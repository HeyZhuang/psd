// 我的字体管理器 - 管理用户自定义字体库

const STORAGE_KEY = 'polotno_custom_fonts';
const MAX_FONTS = 50; // 最多存储50个字体

// 从 fonts 文件夹预设的字体列表
export const PRESET_FONTS = [
  { name: 'Brudoni Desktop', fileName: '3601 Brudoni Desktop.otf', family: 'Brudoni Desktop' },
  { name: 'Aileron Black Italic', fileName: 'Aileron-BlackItalic-3.ttf', family: 'Aileron' },
  { name: 'Alex Brush', fileName: 'Alexbrush Regular.ttf', family: 'Alex Brush' },
  { name: 'Altgotisch', fileName: 'Altgotisch.ttf', family: 'Altgotisch' },
  { name: 'At Askara', fileName: 'At Askara.otf', family: 'At Askara' },
  { name: 'Boldgod Display', fileName: 'Boldgod Display.otf', family: 'Boldgod Display' },
  { name: 'CAT Reporter', fileName: 'CAT Reporter.ttf', family: 'CAT Reporter' },
  { name: 'Attack Graffiti', fileName: 'a Attack Graffiti.ttf', family: 'Attack Graffiti' },
  { name: '華康POP1體W5', fileName: '華康POP1體W5.ttf', family: 'DFPPop1-W5' },
  { name: '華康POP1體W9', fileName: '華康POP1體W9.ttf', family: 'DFPPop1-W9' },
  { name: '華康超特圓體', fileName: '華康超特圓體.ttf', family: 'DFSuper-W7' },
];

/**
 * 获取所有自定义字体
 */
export function getCustomFonts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 获取自定义字体失败:', error);
    return [];
  }
}

/**
 * 保存字体到localStorage
 * @param {Object} fontData - { name, family, url, fileName }
 */
export function saveCustomFont(fontData) {
  try {
    const fonts = getCustomFonts();

    // 检查是否已存在
    const exists = fonts.some(f => f.family === fontData.family);
    if (exists) {
      console.warn('⚠️ 字体已存在:', fontData.family);
      return false;
    }

    // 检查数量限制
    if (fonts.length >= MAX_FONTS) {
      // 删除最旧的字体 (FIFO)
      fonts.shift();
    }

    // 添加新字体
    const newFont = {
      id: Date.now().toString(),
      name: fontData.name,
      family: fontData.family,
      url: fontData.url, // Base64 data URL
      fileName: fontData.fileName,
      addedAt: new Date().toISOString()
    };

    fonts.push(newFont);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fonts));

    console.log('✅ 字体已保存:', newFont.name);
    return true;
  } catch (error) {
    console.error('❌ 保存字体失败:', error);
    return false;
  }
}

/**
 * 删除字体
 */
export function deleteCustomFont(fontId) {
  try {
    const fonts = getCustomFonts();
    const filtered = fonts.filter(f => f.id !== fontId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('🗑️ 字体已删除');
    return true;
  } catch (error) {
    console.error('❌ 删除字体失败:', error);
    return false;
  }
}

/**
 * 清空所有自定义字体
 */
export function clearCustomFonts() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ 已清空所有自定义字体');
    return true;
  } catch (error) {
    console.error('❌ 清空字体失败:', error);
    return false;
  }
}

/**
 * 加载字体文件并转换为 Base64
 */
export async function loadFontFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 注册字体到浏览器
 */
export async function registerFont(fontFamily, fontUrl) {
  try {
    // 检查是否已注册
    if (document.fonts.check(`16px "${fontFamily}"`)) {
      console.log('✅ 字体已注册:', fontFamily);
      return true;
    }

    const fontFace = new FontFace(fontFamily, `url(${fontUrl})`);
    const loadedFont = await fontFace.load();
    document.fonts.add(loadedFont);

    console.log('✅ 字体注册成功:', fontFamily);
    return true;
  } catch (error) {
    console.error('❌ 字体注册失败:', fontFamily, error);
    return false;
  }
}

/**
 * 从预设字体文件夹加载字体
 */
export async function loadPresetFont(fontInfo) {
  try {
    const fontPath = `/fonts/${fontInfo.fileName}`;
    const response = await fetch(fontPath);

    if (!response.ok) {
      throw new Error(`无法加载字体: ${fontPath}`);
    }

    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        const base64Url = e.target.result;

        // 注册字体
        const registered = await registerFont(fontInfo.family, base64Url);

        if (registered) {
          // 保存到localStorage
          const saved = saveCustomFont({
            name: fontInfo.name,
            family: fontInfo.family,
            url: base64Url,
            fileName: fontInfo.fileName
          });

          resolve(saved);
        } else {
          reject(new Error('字体注册失败'));
        }
      };

      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ 加载预设字体失败:', fontInfo.name, error);
    return false;
  }
}

/**
 * 批量加载所有预设字体
 */
export async function loadAllPresetFonts() {
  console.log('📦 开始加载预设字体...');

  const results = [];
  for (const fontInfo of PRESET_FONTS) {
    try {
      const success = await loadPresetFont(fontInfo);
      results.push({ font: fontInfo.name, success });
      console.log(`${success ? '✅' : '❌'} ${fontInfo.name}`);
    } catch (error) {
      console.error(`❌ 加载字体失败: ${fontInfo.name}`, error);
      results.push({ font: fontInfo.name, success: false });
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`✅ 字体加载完成: ${successCount}/${PRESET_FONTS.length}`);

  return results;
}

/**
 * 初始化字体系统 - 注册已保存的字体，首次启动时自动加载预设字体
 */
export async function initializeCustomFonts() {
  const fonts = getCustomFonts();
  console.log(`🎨 初始化自定义字体系统 (${fonts.length} 个字体)`);

  // 首次启动检测：如果没有保存任何字体，自动加载所有预设字体
  if (fonts.length === 0) {
    console.log('🆕 首次启动检测到，开始自动加载预设字体...');

    for (const fontInfo of PRESET_FONTS) {
      try {
        console.log(`📦 正在加载预设字体: ${fontInfo.name}...`);
        const success = await loadPresetFont(fontInfo);
        if (success) {
          console.log(`✅ ${fontInfo.name} 加载成功`);
        } else {
          console.warn(`⚠️ ${fontInfo.name} 加载失败`);
        }
        // 添加延迟避免加载过快导致问题
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ 加载预设字体失败: ${fontInfo.name}`, error);
      }
    }

    console.log('✅ 预设字体加载完成');

    // 重新获取已保存的字体
    const updatedFonts = getCustomFonts();
    console.log(`📊 现在共有 ${updatedFonts.length} 个字体已保存`);
  } else {
    // 注册已保存的字体
    for (const font of fonts) {
      try {
        await registerFont(font.family, font.url);
        console.log(`✅ 字体已注册: ${font.name}`);
      } catch (error) {
        console.error('❌ 初始化字体失败:', font.name, error);
      }
    }
  }

  console.log('✅ 自定义字体系统初始化完成');
}

/**
 * 获取存储占用大小
 */
export function getStorageInfo() {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || '';
    const bytes = new Blob([data]).size;
    const kb = bytes / 1024;
    const mb = kb / 1024;

    return {
      bytes,
      kb: kb.toFixed(2),
      mb: mb.toFixed(2),
      displaySize: mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`
    };
  } catch (error) {
    return { bytes: 0, kb: '0', mb: '0', displaySize: '0 KB' };
  }
}
