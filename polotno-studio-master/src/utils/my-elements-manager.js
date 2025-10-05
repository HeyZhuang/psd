// 我的元素管理器 - 保存和管理用户自定义元素
import { unstable_registerNextDomDrop } from 'polotno/config';

const STORAGE_KEY = 'polotno_my_elements';

// 获取所有保存的元素
export const getMyElements = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading my elements:', error);
    return [];
  }
};

// 保存元素到库
export const saveElement = async (element, store) => {
  try {
    const elements = getMyElements();

    // 创建元素的副本,包含所有属性
    const elementData = {
      id: `my-element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: element.type,
      name: element.name || element.text || `${element.type} Element`,
      savedAt: new Date().toISOString(),
      // 保存元素的完整JSON数据
      data: element.toJSON(),
      // 生成缩略图
      preview: await generatePreview(element, store),
    };

    // 添加到数组开头
    elements.unshift(elementData);

    // 限制最多保存100个元素
    if (elements.length > 100) {
      elements.length = 100;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
    console.log('✅ 元素已保存:', elementData.name);
    return true;
  } catch (error) {
    console.error('Error saving element:', error);
    return false;
  }
};

// 删除元素
export const deleteElement = (elementId) => {
  try {
    const elements = getMyElements();
    const filtered = elements.filter(el => el.id !== elementId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting element:', error);
    return false;
  }
};

// 清空所有元素
export const clearAllElements = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing elements:', error);
    return false;
  }
};

// 生成元素预览图
const generatePreview = async (element, store) => {
  try {
    // 创建临时画布用于生成预览
    const canvas = document.createElement('canvas');
    const size = 150;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // 根据元素类型生成预览
    if (element.type === 'text') {
      // 文字预览
      ctx.fillStyle = element.fill || '#000000';
      ctx.font = `${Math.min(element.fontSize || 20, 40)}px ${element.fontFamily || 'Arial'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = (element.text || 'Text').substring(0, 20);
      ctx.fillText(text, size / 2, size / 2);
    } else if (element.type === 'image' || element.type === 'svg') {
      // 图片预览 - 尝试加载实际图片
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = element.src;
          // 超时处理
          setTimeout(reject, 3000);
        });

        // 计算缩放以适应画布
        const scale = Math.min(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (size - w) / 2;
        const y = (size - h) / 2;
        ctx.drawImage(img, x, y, w, h);
      } catch (err) {
        // 如果图片加载失败,绘制占位符
        drawPlaceholder(ctx, size, element.type);
      }
    } else {
      // 其他类型的占位符
      drawPlaceholder(ctx, size, element.type);
    }

    // 转换为base64
    return canvas.toDataURL('image/png', 0.8);
  } catch (error) {
    console.error('Error generating preview:', error);
    // 返回空的预览图
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 150, 150);
    return canvas.toDataURL('image/png');
  }
};

// 绘制占位符
const drawPlaceholder = (ctx, size, type) => {
  // 浅灰色背景
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, size, size);

  // 绘制图标和文字
  ctx.fillStyle = '#999999';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(type.toUpperCase(), size / 2, size / 2);
};

// 生成唯一ID
const generateUniqueId = () => {
  return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 添加元素到画布
export const addElementToCanvas = (elementData, store) => {
  try {
    const page = store.activePage;
    if (!page) {
      console.error('No active page');
      return;
    }

    // 复制元素数据,移除可能导致不可拖动的属性
    const {
      id: oldId,
      locked: oldLocked,
      selectable: oldSelectable,
      draggable: oldDraggable,
      ...cleanData
    } = elementData.data;

    // 创建新的元素配置,强制设置可拖动属性
    const elementConfig = {
      ...cleanData,
      // 生成新的唯一ID
      id: generateUniqueId(),
      // 强制设置可交互属性
      selectable: true,
      draggable: true,
      locked: false,
      removable: true,
    };

    console.log('🔧 准备添加元素:', {
      type: elementConfig.type,
      draggable: elementConfig.draggable,
      selectable: elementConfig.selectable,
      locked: elementConfig.locked
    });

    // 从清理后的数据创建新元素
    const newElement = page.addElement(elementConfig);

    // 等待元素创建完成后,再次确保属性正确
    setTimeout(() => {
      newElement.set({
        selectable: true,
        draggable: true,
        locked: false,
        removable: true,
      });
      console.log('🔄 元素属性已更新:', {
        id: newElement.id,
        draggable: newElement.draggable,
        selectable: newElement.selectable,
        locked: newElement.locked
      });
    }, 100);

    // 将元素放置在画布中央
    const centerX = page.width / 2;
    const centerY = page.height / 2;
    newElement.set({
      x: centerX - newElement.width / 2,
      y: centerY - newElement.height / 2,
    });

    // 选中新添加的元素
    store.selectElements([newElement.id]);

    console.log('✅ 元素已添加到画布', {
      id: newElement.id,
      type: newElement.type,
      draggable: newElement.draggable,
      selectable: newElement.selectable,
      locked: newElement.locked
    });

    return newElement;
  } catch (error) {
    console.error('Error adding element to canvas:', error);
    return null;
  }
};
