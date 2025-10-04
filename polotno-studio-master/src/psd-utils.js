import { readPsd } from 'ag-psd';
import { psdDebugger } from './utils/PSDDebugger';
import { fontManager } from './utils/FontManager';
// 全局导入选项：可通过 window.psdImportOptions.rasterizeText 控制
const shouldRasterizeText = () => {
  try {
    if (window.psdImportOptions && typeof window.psdImportOptions.rasterizeText === 'boolean') {
      console.log('使用指定的文字导入模式:', window.psdImportOptions.rasterizeText ? '位图模式' : '可编辑模式');
      return window.psdImportOptions.rasterizeText;
    }
  } catch (e) {}
  console.log('使用默认文字导入模式: 可编辑模式');
  return false; // 默认关闭：导入为可编辑文字，支持编辑功能
};

/**
 * 解析 PSD 文件
 * @param {File} file - PSD 文件
 * @returns {Promise<Object>} 解析后的 PSD 数据
 */
export const parsePSDFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // 检查文件头
        const header = new Uint8Array(arrayBuffer.slice(0, 4));
        const signature = String.fromCharCode(...header);
        
        if (signature !== '8BPS') {
          throw new Error('无效的 PSD 文件格式');
        }
        
        // 精确解析配置以保持原始PSD数据完整性和最高图像质量
        const psd = readPsd(arrayBuffer, {
          skipLayerImageData: false,
          skipCompositeImageData: false,
          skipThumbnail: false,
          useImageData: false, // 使用Canvas以获得更精确的颜色显示和更好的性能
          useRawThumbnail: false,
          throwForMissingFeatures: false,
          logMissingFeatures: false,
          ignoreAlphaChannel: false,
          logDevModeWarnings: false,
          // 确保高质量图像数据处理
          preserveImageData: true,
          globalAngle: true,
          globalAltitude: true
        });
        
        const psdInfo = {
          width: psd.width,
          height: psd.height,
          colorMode: psd.colorMode,
          resolution: psd.resolution,
          pixelsPerInch: psd.pixelsPerInch,
          layerCount: psd.children?.length || 0,
          hasColorProfile: !!psd.colorProfile
        };
        
        console.log('PSD解析成功:', psdInfo);
        psdDebugger.log('PSD文件解析成功', psdInfo);
        
        // 将PSD信息附加到每个图层以便后续使用
        const attachPSDInfo = (layers) => {
          layers.forEach(layer => {
            layer.psdInfo = {
              resolution: psd.resolution || psd.pixelsPerInch || 72,
              width: psd.width,
              height: psd.height
            };
            if (layer.children) {
              attachPSDInfo(layer.children);
            }
          });
        };
        
        if (psd.children) {
          attachPSDInfo(psd.children);
        }
        
        resolve(psd);
      } catch (error) {
        console.error('PSD 解析详细错误:', error);
        reject(new Error(`PSD 解析失败: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 从图层数据创建 Canvas
 * @param {Object} layer - PSD 图层
 * @returns {HTMLCanvasElement|null} Canvas 元素
 */
export const layerToCanvas = (layer) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 计算图层尺寸
  const width = Math.max(1, Math.floor((layer.right || 0) - (layer.left || 0)));
  const height = Math.max(1, Math.floor((layer.bottom || 0) - (layer.top || 0)));
  
  
  canvas.width = width;
  canvas.height = height;
  
  // ag-psd 在使用 useImageData: false 时会直接创建 HTMLCanvasElement
  if (layer.canvas) {
    if (layer.canvas instanceof HTMLCanvasElement) {
      // 直接使用原始canvas，保持最高保真度
      const sourceCanvas = layer.canvas;
      if (sourceCanvas.width > 0 && sourceCanvas.height > 0) {
        // 设置目标尺寸
        canvas.width = width || sourceCanvas.width;
        canvas.height = height || sourceCanvas.height;
        
        // 使用最高质量的绘制设置
        ctx.imageSmoothingEnabled = true; // 启用高质量插值
        ctx.imageSmoothingQuality = 'high'; // 设置最高质量
        
        // 支持高分辨率显示
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
          // 为高分辨率屏幕创建更大的canvas
          const hiDPICanvas = document.createElement('canvas');
          const hiDPICtx = hiDPICanvas.getContext('2d');
          hiDPICanvas.width = canvas.width * dpr;
          hiDPICanvas.height = canvas.height * dpr;
          
          hiDPICtx.imageSmoothingEnabled = true;
          hiDPICtx.imageSmoothingQuality = 'high';
          hiDPICtx.scale(dpr, dpr);
          hiDPICtx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
          
          // 将高分辨率内容绘制到目标canvas
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(hiDPICanvas, 0, 0, hiDPICanvas.width, hiDPICanvas.height, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
        }
        return canvas;
      }
    }
    
    // 如果 canvas 是数据对象
    if (layer.canvas.data && layer.canvas.width && layer.canvas.height) {
      
      try {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // 支持高分辨率渲染
        const dpr = window.devicePixelRatio || 1;
        const scaledWidth = layer.canvas.width * dpr;
        const scaledHeight = layer.canvas.height * dpr;
        
        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;
        tempCtx.scale(dpr, dpr);
        
        // 设置高质量渲染
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        
        const imageData = tempCtx.createImageData(layer.canvas.width, layer.canvas.height);
        
        // 处理数据格式
        let sourceData;
        if (layer.canvas.data instanceof Uint8ClampedArray) {
          sourceData = layer.canvas.data;
        } else {
          sourceData = new Uint8ClampedArray(layer.canvas.data);
        }
        
        imageData.data.set(sourceData);
        tempCtx.putImageData(imageData, 0, 0);
        
        const tempDataURL = tempCanvas.toDataURL();
        
        // 将临时 canvas 绘制到目标 canvas 上
        ctx.drawImage(tempCanvas, 0, 0, width, height);
        return canvas;
      } catch (error) {
        console.error('Canvas 数据绘制失败:', error, layer.name);
      }
    }
  }
  
  // 检查 imageData
  if (layer.imageData && layer.imageData.data) {
    
    try {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = layer.imageData.width;
      tempCanvas.height = layer.imageData.height;
      
      const expectedLength = layer.imageData.width * layer.imageData.height * 4;
      
      if (layer.imageData.data.length !== expectedLength) {
        // 如果长度不匹配，可能需要调整
        const adjustedData = new Uint8ClampedArray(expectedLength);
        const copyLength = Math.min(layer.imageData.data.length, expectedLength);
        
        // 确保数据是正确的格式
        if (layer.imageData.data instanceof Uint8ClampedArray) {
          adjustedData.set(layer.imageData.data.subarray(0, copyLength));
        } else {
          adjustedData.set(new Uint8ClampedArray(layer.imageData.data.buffer || layer.imageData.data).subarray(0, copyLength));
        }
        
        const imageData = tempCtx.createImageData(layer.imageData.width, layer.imageData.height);
        imageData.data.set(adjustedData);
        tempCtx.putImageData(imageData, 0, 0);
      } else {
        const imageData = tempCtx.createImageData(layer.imageData.width, layer.imageData.height);
        
        // 确保数据格式正确
        let sourceData;
        if (layer.imageData.data instanceof Uint8ClampedArray) {
          sourceData = layer.imageData.data;
        } else if (layer.imageData.data.buffer) {
          sourceData = new Uint8ClampedArray(layer.imageData.data.buffer);
        } else {
          sourceData = new Uint8ClampedArray(layer.imageData.data);
        }
        
        
        // 处理颜色空间和预乘alpha问题
        const processedData = new Uint8ClampedArray(sourceData.length);
        for (let i = 0; i < sourceData.length; i += 4) {
          let r = sourceData[i];
          let g = sourceData[i + 1];
          let b = sourceData[i + 2];
          let a = sourceData[i + 3];
          
          // 简化颜色处理 - 保持原始PSD颜色值
          // 只进行必要的预乘alpha处理
          if (a > 0 && a < 255) {
            const alpha = a / 255;
            if (alpha > 0) {
              r = Math.min(255, Math.max(0, Math.round(r / alpha)));
              g = Math.min(255, Math.max(0, Math.round(g / alpha)));
              b = Math.min(255, Math.max(0, Math.round(b / alpha)));
            }
          }
          
          // 不应用任何gamma校正，保持原始颜色
          r = Math.max(0, Math.min(255, Math.round(r)));
          g = Math.max(0, Math.min(255, Math.round(g)));
          b = Math.max(0, Math.min(255, Math.round(b)));
          
          processedData[i] = r;     // Red
          processedData[i + 1] = g; // Green
          processedData[i + 2] = b; // Blue
          processedData[i + 3] = a; // Alpha
        }
        
        imageData.data.set(processedData);
        tempCtx.putImageData(imageData, 0, 0);
        
      }
      
      const tempDataURL = tempCanvas.toDataURL();
      
      // 将临时 canvas 绘制到目标 canvas 上
      ctx.drawImage(tempCanvas, 0, 0, width, height);
      return canvas;
    } catch (error) {
      console.error('ImageData 绘制失败:', error, layer.name);
    }
  }
  
  // 如果都没有有效数据，创建一个带颜色的测试图层
  ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(0, 0, width, height);
  
  // 添加图层名称
  ctx.fillStyle = '#000000';
  ctx.font = '12px Arial';
  ctx.fillText(layer.name || 'Unnamed', 5, 15);
  
  return canvas;
};

/**
 * Canvas 转换为 DataURL
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {string} format - 图片格式 (默认 'image/png')
 * @returns {string} DataURL
 */
export const canvasToDataURL = (canvas, format = 'image/png') => {
  try {
    // 使用最高质量进行图像输出
    const quality = format === 'image/jpeg' ? 1.0 : undefined; // JPEG使用最高质量，PNG忽略质量参数
    const dataURL = canvas.toDataURL(format, quality);
    
    if (dataURL.length < 1000) {
      
      // 尝试创建一个简单的测试图像来验证canvas功能
      const testCanvas = document.createElement('canvas');
      testCanvas.width = canvas.width;
      testCanvas.height = canvas.height;
      const testCtx = testCanvas.getContext('2d');
      
      // 绘制一个简单的背景来测试
      testCtx.fillStyle = '#ff0000';
      testCtx.fillRect(0, 0, 50, 50);
      
      const testDataURL = testCanvas.toDataURL(format);
      
      return dataURL;
    }
    
    return dataURL;
  } catch (error) {
    console.error('Canvas 转换 DataURL 失败:', error);
    // 返回一个默认的透明图像
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = canvas.width;
    fallbackCanvas.height = canvas.height;
    return fallbackCanvas.toDataURL(format);
  }
};

/**
 * 增强图像质量的Canvas处理
 * @param {HTMLCanvasElement} sourceCanvas - 源Canvas
 * @param {number} scaleFactor - 缩放因子 (默认2倍超采样)
 * @returns {HTMLCanvasElement} 增强后的Canvas
 */
const enhanceImageQuality = (sourceCanvas, scaleFactor = 2) => {
  try {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    
    // 创建高分辨率Canvas进行超采样
    const highResCanvas = document.createElement('canvas');
    const highResCtx = highResCanvas.getContext('2d');
    
    highResCanvas.width = width * scaleFactor;
    highResCanvas.height = height * scaleFactor;
    
    // 设置高质量渲染
    highResCtx.imageSmoothingEnabled = true;
    highResCtx.imageSmoothingQuality = 'high';
    
    // 绘制放大版本
    highResCtx.drawImage(sourceCanvas, 0, 0, width * scaleFactor, height * scaleFactor);
    
    // 创建目标Canvas并缩放回原始尺寸
    const enhancedCanvas = document.createElement('canvas');
    const enhancedCtx = enhancedCanvas.getContext('2d');
    
    enhancedCanvas.width = width;
    enhancedCanvas.height = height;
    
    // 使用高质量缩放算法
    enhancedCtx.imageSmoothingEnabled = true;
    enhancedCtx.imageSmoothingQuality = 'high';
    enhancedCtx.drawImage(highResCanvas, 0, 0, width * scaleFactor, height * scaleFactor, 0, 0, width, height);
    
    return enhancedCanvas;
  } catch (error) {
    console.warn('图像质量增强失败，使用原始图像:', error);
    return sourceCanvas;
  }
};

/**
 * 高质量Canvas转DataURL
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @param {string} format - 输出格式
 * @param {boolean} enhance - 是否启用质量增强
 * @returns {string} DataURL
 */
const getHighQualityDataURL = (canvas, format = 'image/png', enhance = true) => {
  try {
    let outputCanvas = canvas;
    
    // 对于较小的图像或需要增强的情况，进行质量增强
    if (enhance && (canvas.width < 500 || canvas.height < 500)) {
      outputCanvas = enhanceImageQuality(canvas);
    }
    
    // 使用最高质量设置
    const quality = format === 'image/jpeg' ? 1.0 : undefined;
    return outputCanvas.toDataURL(format, quality);
  } catch (error) {
    console.error('高质量DataURL生成失败:', error);
    return canvas.toDataURL(format, 0.95);
  }
};

/**
 * 解析图层效果（描边、发光、叠加等）
 * @param {Object} layer - PSD 图层对象
 * @returns {Object} 解析后的图层效果数据
 */
const parseLayerEffects = (layer) => {
  const effects = {
    stroke: null,
    outerGlow: null,
    colorOverlay: null,
    dropShadow: null,
    innerShadow: null,
    bevelEmboss: null,
    hasEffects: false
  };

  try {
    // 检查图层是否有效果数据
    if (!layer.effects && !layer.layerEffects && !layer.additionalLayerInfo) {
      return effects;
    }

    // 尝试从多个可能的位置获取效果数据
    let effectsData = layer.effects || layer.layerEffects;
    
    // 如果直接获取失败，尝试从additionalLayerInfo中获取
    if (!effectsData && layer.additionalLayerInfo) {
      // 查找效果相关的信息
      for (const info of layer.additionalLayerInfo) {
        if (info.key === 'lfx2' || info.key === 'leff' || info.signature === 'lfx2') {
          effectsData = info.data || info;
          break;
        }
      }
    }

    if (!effectsData) {
      return effects;
    }

    console.log('找到图层效果数据:', layer.name, effectsData);

    // 解析描边效果
    if (effectsData.stroke || effectsData.frameFX) {
      const strokeData = effectsData.stroke || effectsData.frameFX;
      if (strokeData.enabled !== false) {
        effects.stroke = {
          enabled: true,
          size: strokeData.size || strokeData.strokeWidth || 1,
          color: parseEffectColor(strokeData.color || strokeData.strokeColor),
          position: strokeData.position || strokeData.strokePosition || 'outside',
          opacity: strokeData.opacity || strokeData.strokeOpacity || 100
        };
        effects.hasEffects = true;
      }
    }

    // 解析外发光效果
    if (effectsData.outerGlow || effectsData.outerGlowEffect) {
      const glowData = effectsData.outerGlow || effectsData.outerGlowEffect;
      if (glowData.enabled !== false) {
        effects.outerGlow = {
          enabled: true,
          color: parseEffectColor(glowData.color),
          opacity: glowData.opacity || 75,
          blur: glowData.blur || glowData.size || 5,
          spread: glowData.spread || 0,
          blendMode: glowData.blendMode || 'normal'
        };
        effects.hasEffects = true;
      }
    }

    // 解析颜色叠加效果
    if (effectsData.colorOverlay || effectsData.solidFill) {
      const overlayData = effectsData.colorOverlay || effectsData.solidFill;
      if (overlayData.enabled !== false) {
        effects.colorOverlay = {
          enabled: true,
          color: parseEffectColor(overlayData.color),
          opacity: overlayData.opacity || 100,
          blendMode: overlayData.blendMode || 'normal'
        };
        effects.hasEffects = true;
      }
    }

    // 解析投影效果
    if (effectsData.dropShadow) {
      const shadowData = effectsData.dropShadow;
      if (shadowData.enabled !== false) {
        effects.dropShadow = {
          enabled: true,
          color: parseEffectColor(shadowData.color),
          opacity: shadowData.opacity || 75,
          distance: shadowData.distance || 5,
          angle: shadowData.angle || 120,
          blur: shadowData.blur || shadowData.size || 5,
          spread: shadowData.spread || 0
        };
        effects.hasEffects = true;
      }
    }

    // 解析内阴影效果
    if (effectsData.innerShadow) {
      const innerShadowData = effectsData.innerShadow;
      if (innerShadowData.enabled !== false) {
        effects.innerShadow = {
          enabled: true,
          color: parseEffectColor(innerShadowData.color),
          opacity: innerShadowData.opacity || 75,
          distance: innerShadowData.distance || 5,
          angle: innerShadowData.angle || 120,
          blur: innerShadowData.blur || innerShadowData.size || 5,
          choke: innerShadowData.choke || 0
        };
        effects.hasEffects = true;
      }
    }

    // 解析斜面和浮雕效果
    if (effectsData.bevelEmboss) {
      const bevelData = effectsData.bevelEmboss;
      if (bevelData.enabled !== false) {
        effects.bevelEmboss = {
          enabled: true,
          style: bevelData.style || 'innerBevel',
          technique: bevelData.technique || 'smooth',
          depth: bevelData.depth || 100,
          size: bevelData.size || 5,
          soften: bevelData.soften || 0,
          angle: bevelData.angle || 120,
          altitude: bevelData.altitude || 30,
          highlightMode: bevelData.highlightMode || 'screen',
          shadowMode: bevelData.shadowMode || 'multiply'
        };
        effects.hasEffects = true;
      }
    }

  } catch (error) {
    console.error('解析图层效果失败:', error);
  }

  return effects;
};

/**
 * 解析效果颜色数据
 * @param {Object} colorData - 颜色数据
 * @returns {string} CSS颜色值
 */
const parseEffectColor = (colorData) => {
  if (!colorData) return '#000000';

  // 处理RGB颜色
  if (colorData.r !== undefined && colorData.g !== undefined && colorData.b !== undefined) {
    let r = Math.round(colorData.r);
    let g = Math.round(colorData.g);
    let b = Math.round(colorData.b);

    // 如果颜色值在0-1范围，转换为0-255
    if (colorData.r <= 1 && colorData.g <= 1 && colorData.b <= 1) {
      r = Math.round(colorData.r * 255);
      g = Math.round(colorData.g * 255);
      b = Math.round(colorData.b * 255);
    }

    return `rgb(${r}, ${g}, ${b})`;
  }

  // 处理十六进制颜色
  if (typeof colorData === 'string') {
    return colorData.startsWith('#') ? colorData : `#${colorData}`;
  }

  return '#000000';
};

/**
 * 将图层效果转换为CSS样式
 * @param {Object} effects - 解析后的图层效果
 * @returns {string} CSS样式字符串
 */
const generateCSSEffects = (effects) => {
  const cssStyles = [];

  try {
    // 处理描边效果
    if (effects.stroke && effects.stroke.enabled) {
      const stroke = effects.stroke;
      // 对于文字，使用 text-stroke 或 text-shadow 来模拟描边
      const strokeSize = stroke.size || 1;
      const strokeColor = stroke.color || '#000000';
      const strokeOpacity = (stroke.opacity || 100) / 100;
      
      // 使用 -webkit-text-stroke 和 text-shadow 组合实现描边
      cssStyles.push(`-webkit-text-stroke: ${strokeSize}px ${strokeColor}`);
      cssStyles.push(`-webkit-text-stroke-width: ${strokeSize}px`);
      cssStyles.push(`-webkit-text-stroke-color: ${strokeColor}`);
      
      // 添加text-shadow作为fallback
      const shadowOffsets = [];
      for (let x = -strokeSize; x <= strokeSize; x++) {
        for (let y = -strokeSize; y <= strokeSize; y++) {
          if (x !== 0 || y !== 0) {
            shadowOffsets.push(`${x}px ${y}px 0 ${strokeColor}`);
          }
        }
      }
      if (shadowOffsets.length > 0) {
        cssStyles.push(`text-shadow: ${shadowOffsets.join(', ')}`);
      }
    }

    // 处理外发光效果
    if (effects.outerGlow && effects.outerGlow.enabled) {
      const glow = effects.outerGlow;
      const glowColor = glow.color || '#ffffff';
      const glowBlur = glow.blur || 5;
      const glowSpread = glow.spread || 0;
      const glowOpacity = (glow.opacity || 75) / 100;
      
      // 使用text-shadow实现外发光
      cssStyles.push(`text-shadow: 0 0 ${glowBlur}px ${glowColor}, 0 0 ${glowBlur * 2}px ${glowColor}`);
      cssStyles.push(`filter: drop-shadow(0 0 ${glowBlur}px ${glowColor})`);
    }

    // 处理颜色叠加效果
    if (effects.colorOverlay && effects.colorOverlay.enabled) {
      const overlay = effects.colorOverlay;
      const overlayColor = overlay.color || '#000000';
      const overlayOpacity = (overlay.opacity || 100) / 100;
      
      // 对于颜色叠加，直接改变文字颜色
      cssStyles.push(`color: ${overlayColor} !important`);
      if (overlayOpacity < 1) {
        cssStyles.push(`opacity: ${overlayOpacity}`);
      }
    }

    // 处理投影效果
    if (effects.dropShadow && effects.dropShadow.enabled) {
      const shadow = effects.dropShadow;
      const shadowColor = shadow.color || '#000000';
      const shadowDistance = shadow.distance || 5;
      const shadowAngle = (shadow.angle || 120) * Math.PI / 180; // 转换为弧度
      const shadowBlur = shadow.blur || 5;
      const shadowOpacity = (shadow.opacity || 75) / 100;
      
      // 计算阴影偏移
      const offsetX = Math.cos(shadowAngle) * shadowDistance;
      const offsetY = Math.sin(shadowAngle) * shadowDistance;
      
      cssStyles.push(`text-shadow: ${offsetX}px ${offsetY}px ${shadowBlur}px ${shadowColor}`);
      cssStyles.push(`filter: drop-shadow(${offsetX}px ${offsetY}px ${shadowBlur}px ${shadowColor})`);
    }

    // 处理内阴影效果（较难实现，使用inset box-shadow近似）
    if (effects.innerShadow && effects.innerShadow.enabled) {
      const innerShadow = effects.innerShadow;
      const shadowColor = innerShadow.color || '#000000';
      const shadowDistance = innerShadow.distance || 5;
      const shadowAngle = (innerShadow.angle || 120) * Math.PI / 180;
      const shadowBlur = innerShadow.blur || 5;
      
      const offsetX = Math.cos(shadowAngle) * shadowDistance;
      const offsetY = Math.sin(shadowAngle) * shadowDistance;
      
      // 对于文字的内阴影，使用text-shadow的负值
      cssStyles.push(`text-shadow: inset ${offsetX}px ${offsetY}px ${shadowBlur}px ${shadowColor}`);
    }

  } catch (error) {
    console.error('生成CSS效果失败:', error);
  }

  return cssStyles.length > 0 ? cssStyles.join('; ') : null;
};

/**
 * 递归提取所有图层
 * @param {Array} layers - PSD 图层数组
 * @param {Array} result - 结果数组
 * @param {number} parentIndex - 父级索引
 * @returns {Array} 扁平化的图层数组
 */
export const flattenLayers = (layers = [], result = [], parentIndex = -1) => {
  layers.forEach((layer, index) => {
    // 创建图层信息，保持更多原始属性
    const layerInfo = {
      ...layer,
      originalIndex: index,
      parentIndex,
      id: layer.id || `layer_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      visible: layer.hidden !== true,
      opacity: layer.opacity !== undefined ? layer.opacity / 255 : 1, // 保持原始透明度
      blendMode: layer.blendMode || 'normal',
    };
    
    // 先处理子图层（如果有的话）
    if (layer.children && layer.children.length > 0) {
      console.log(`处理图层组: ${layer.name}, 子图层数: ${layer.children.length}`);
      // 递归处理子图层
      flattenLayers(layer.children, result, result.length);
    } else {
      // 只有非组图层才加入结果
      result.push(layerInfo);
      console.log(`添加图层: ${layer.name}, 类型: ${layer.text ? '文字' : (layer.canvas || layer.imageData ? '图像' : '其他')}`);
    }
  });
  
  return result;
};

/**
 * 将 PSD 图层转换为 Polotno 元素数据
 * @param {Object} layer - PSD 图层
 * @returns {Object|null} Polotno 元素数据
 */
export const layerToPolotnoElement = async (layer) => {
  try {
    // 更宽松的图层过滤策略 - 不跳过隐藏图层，让用户自己决定
    // 只跳过明确无用的图层
    if (layer.hidden && !layer.text && !layer.canvas && !layer.imageData && (!layer.children || layer.children.length === 0)) {
      console.log('跳过空隐藏图层:', layer.name);
      return null;
    }
    
    // 对于隐藏但有内容的图层，仍然导入但设置为不可见
    if (layer.hidden) {
      console.log('导入隐藏图层但设置为不可见:', layer.name);
    }
    
    
    // 更精确的尺寸计算，处理边界情况
    let width = Math.abs((layer.right || 0) - (layer.left || 0));
    let height = Math.abs((layer.bottom || 0) - (layer.top || 0));
    
    // 对于没有明确尺寸的图层，尝试从其他源获取
    if (width <= 0 && layer.canvas) {
      width = layer.canvas.width || 100;
    }
    if (height <= 0 && layer.canvas) {
      height = layer.canvas.height || 100;
    }
    
    // 保证最小尺寸
    width = Math.max(1, width);
    height = Math.max(1, height);
    
    // 确保坐标正确性，处理负值和边界情况
    let x = layer.left || 0;
    let y = layer.top || 0;
    
    // 对于某些特殊图层，可能需要调整坐标
    if (layer.canvas && (width !== layer.canvas.width || height !== layer.canvas.height)) {
      // 如果canvas尺寸与计算的尺寸不同，可能需要调整位置
      console.log(`图层 ${layer.name} 尺寸不匹配: 计算=${width}x${height}, Canvas=${layer.canvas.width}x${layer.canvas.height}`);
    }
    
    const element = {
      id: `layer_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`, // 强制使用字符串ID
      name: layer.name || 'Layer',
      x,
      y,
      width,
      height,
      rotation: 0,
      opacity: 1, // 设置所有组件透明度为100%
      visible: !layer.hidden, // 根据图层可见性设置
      blendMode: mapBlendMode(layer.blendMode) // 映射混合模式
    };
    
    console.log(`创建元素: ${layer.name}, 位置: (${x}, ${y}), 尺寸: ${width}x${height}, 可见: ${!layer.hidden}`);
    
    // 解析图层效果（描边、发光、叠加等）
    const layerEffects = parseLayerEffects(layer);
    
    // 处理文本图层
    if (layer.text && layer.text.text) {
      // 若启用“位图导入文字”，优先将文本图层以图像方式导入以确保完全一致
      if (shouldRasterizeText()) {
        const rasterCanvas = layerToCanvas(layer);
        if (rasterCanvas) {
          element.type = 'image';
          element.src = getHighQualityDataURL(rasterCanvas, 'image/png', true);
          // 保留元数据，便于后续一键转换回可编辑文本
          element.custom = {
            ...element.custom,
            fromTextLayer: true,
            originalText: layer.text.text,
            rasterized: true
          };
          return element;
        }
      }

      // 严格模式，确保与 PSD 高度一致（可编辑文本路径）
      element.type = 'text';
      element.text = layer.text.text || '';
      
      // 标记为PSD文字元素，支持编辑
      element.custom = {
        ...element.custom,
        fromPSD: true,
        fromTextLayer: true,
        originalText: layer.text.text || '',
        rasterized: false,
        psdTextLayer: true,
        layerEffects: layerEffects // 保存图层效果数据
      };
      
      // 获取文本样式，尝试多种数据结构以确保兼容性
      let textStyle = null;
      
      // 方法1: 优先使用textStyleRange中的样式(最准确)
      if (layer.text.textStyleRange && layer.text.textStyleRange.length > 0) {
        textStyle = layer.text.textStyleRange[0].textStyle;
        console.log('使用textStyleRange样式:', textStyle);
      }
      // 方法2: 使用runs中的样式
      else if (layer.text.runs && layer.text.runs.length > 0) {
        textStyle = layer.text.runs[0].style;
        console.log('使用runs样式:', textStyle);
      }
      // 方法3: 使用默认样式对象
      else if (layer.text.style) {
        textStyle = layer.text.style;
        console.log('使用默认样式:', textStyle);
      }
      // 方法4: 如果有engineData，尝试从中解析
      else if (layer.text.engineData) {
        console.log('尝试解析engineData:', layer.text.engineData);
        // engineData通常包含更复杂的样式信息
        if (layer.text.engineData.StyleRun && layer.text.engineData.StyleRun.length > 0) {
          const styleRun = layer.text.engineData.StyleRun[0];
          if (styleRun.StyleSheet && styleRun.StyleSheet.StyleSheetData) {
            textStyle = styleRun.StyleSheet.StyleSheetData;
            console.log('从engineData解析样式:', textStyle);
          }
        }
      }
      
      // 如果仍然没有找到样式，创建默认样式
      if (!textStyle) {
        textStyle = {
          fontSize: 16,
          fontName: 'Arial',
          fillColor: { r: 0, g: 0, b: 0 }
        };
        console.log('使用默认样式:', textStyle);
      }
      
      // 添加精确样式类标记 - 用于CSS精确渲染
      element.custom = {
        ...element.custom,
        psdPrecision: true,
        originalFontSize: textStyle?.fontSize,
        originalFontName: textStyle?.fontName,
        originalColor: textStyle?.fillColor,
        renderingMode: 'precise'
      };

      // 应用图层效果到文字元素
      if (layerEffects.hasEffects) {
        console.log(`文字图层 "${layer.name}" 包含效果:`, layerEffects);
        
        // 创建CSS效果样式
        const cssEffects = generateCSSEffects(layerEffects);
        if (cssEffects) {
          element.custom = {
            ...element.custom,
            cssEffects: cssEffects,
            textEffects: layerEffects
          };
        }
      }
      
      const originalStyleData = {
        layerName: layer.name,
        textStyle: textStyle,
        fontSize: textStyle?.fontSize,
        fontName: textStyle?.fontName,
        fillColor: textStyle?.fillColor
      };
      
      console.log('PSD文本样式原始数据:', originalStyleData);
      psdDebugger.logConversion('文本样式提取', layer.name, originalStyleData, null);
      
      // 严格的字体大小：优先使用 Photoshop 提供的像素字号 (implied)，否则按 pt→px(96/72)
      const ptToPx = (pt) => (pt * 96) / 72;
      const styleRunData = (layer.text?.engineData?.StyleRun && layer.text.engineData.StyleRun[0]?.StyleSheet?.StyleSheetData) || {};
      const impliedPx = Number(textStyle?.impliedFontSize || textStyle?.ImpliedFontSize || styleRunData.ImpliedFontSize);
      const originalFontSizePt = Number(textStyle?.fontSize) || Number(textStyle?.Size) || Number(styleRunData.FontSize) || 16;
      const baseFontPx = impliedPx && impliedPx > 0 ? impliedPx : ptToPx(originalFontSizePt);
      element.fontSize = Math.max(1, Math.round(baseFontPx * 100) / 100);
      element.custom = {
        ...element.custom,
        originalFontSizePt: originalFontSizePt,
        originalFontSizePx: element.fontSize,
        fontSizeSource: impliedPx && impliedPx > 0 ? 'impliedPx' : 'ptToPx'
      };
      
      // 使用Web安全字体映射，但保持最大相似性
      if (textStyle?.fontName) {
        const originalFont = textStyle.fontName;
        element.fontFamily = fontManager.getFontWithFallback(originalFont);
        fontManager.loadFont(originalFont, element.fontSize).then((loaded) => {
          if (!loaded) console.warn(`字体 ${originalFont} 加载失败，使用回退`);
        });
        psdDebugger.logFontConversion(layer.name, originalFont, element.fontFamily,
          originalFontSizePt, element.fontSize);
        element.custom = {
          ...element.custom,
          fontOptimized: true,
          originalFontName: originalFont
        };
      } else {
        element.fontFamily = 'Arial, sans-serif';
      }
      
      // 高精度颜色转换 - 为Polotno编辑器优化
      if (textStyle?.fillColor) {
        const color = textStyle.fillColor;
        if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
          // 确保颜色值在正确范围内
          let r = Math.round(Math.max(0, Math.min(255, color.r)));
          let g = Math.round(Math.max(0, Math.min(255, color.g)));
          let b = Math.round(Math.max(0, Math.min(255, color.b)));
          
          // 如果颜色值在0-1范围，转换为0-255
          if (color.r <= 1 && color.g <= 1 && color.b <= 1) {
            r = Math.round(color.r * 255);
            g = Math.round(color.g * 255);
            b = Math.round(color.b * 255);
          }
          
          element.fill = `rgb(${r}, ${g}, ${b})`; // 使用RGB格式以获得更好的兼容性
          
          // 保存精确颜色信息
          element.custom = {
            ...element.custom,
            preciseColor: { r, g, b },
            originalColorSource: 'psd'
          };
          
          console.log(`颜色转换: RGB(${color.r}, ${color.g}, ${color.b}) -> ${element.fill}`);
          
          // 记录颜色转换详情
          psdDebugger.logColorConversion(layer.name, 
            { r: color.r, g: color.g, b: color.b }, 
            { r, g, b, css: element.fill }
          );
        } else {
          element.fill = 'rgb(0, 0, 0)';
        }
      } else {
        element.fill = 'rgb(0, 0, 0)';
      }
      
      // 精确的对齐方式映射
      const alignment = textStyle?.alignment || textStyle?.justification || 'left';
      element.align = mapTextAlignment(alignment);
      
      console.log(`文本对齐: ${alignment} -> ${element.align}`);
      
      // 原始字体样式
      element.fontWeight = (textStyle?.fauxBold || 
        (textStyle?.fontName && textStyle.fontName.toLowerCase().includes('bold'))) ? 'bold' : 'normal';
      
      element.fontStyle = (textStyle?.fauxItalic || 
        (textStyle?.fontName && textStyle.fontName.toLowerCase().includes('italic'))) ? 'italic' : 'normal';
      
      // 原始文本装饰
      const decorations = [];
      if (textStyle?.underline) decorations.push('underline');
      if (textStyle?.strikethrough) decorations.push('line-through');
      element.textDecoration = decorations.length > 0 ? decorations.join(' ') : 'none';
      
      // 应用水平/垂直缩放（Photoshop HorizontalScale/VerticalScale 或 Transform 矩阵）
      const hScalePct = Number(textStyle?.horizontalScale || textStyle?.HorizontalScale || styleRunData.HorizontalScale);
      const vScalePct = Number(textStyle?.verticalScale || textStyle?.VerticalScale || styleRunData.VerticalScale);
      let scaleX = isFinite(hScalePct) && hScalePct > 0 ? hScalePct / 100 : 1;
      let scaleY = isFinite(vScalePct) && vScalePct > 0 ? vScalePct / 100 : 1;

      // 解析 Transform 矩阵以获取缩放
      const transform = layer.text?.engineData?.Transform || layer.text?.transform || styleRunData.Transform;
      if (Array.isArray(transform) && transform.length >= 4) {
        // Photoshop 矩阵 [xx, xy, yx, yy, tx, ty]
        const xx = Number(transform[0]);
        const xy = Number(transform[1]);
        const yx = Number(transform[2]);
        const yy = Number(transform[3]);
        const calcScaleX = Math.sqrt((xx || 0) * (xx || 0) + (xy || 0) * (xy || 0));
        const calcScaleY = Math.sqrt((yx || 0) * (yx || 0) + (yy || 0) * (yy || 0));
        if (calcScaleX > 0) scaleX *= calcScaleX;
        if (calcScaleY > 0) scaleY *= calcScaleY;
      }

      // 仅当没有 ImpliedFontSize（即从 pt→px 计算）时，才对字号施加缩放，避免二次缩放
      if (scaleY !== 1 && element.custom.fontSizeSource === 'ptToPx') {
        const before = element.fontSize;
        element.fontSize = Math.max(1, Math.round((element.fontSize * scaleY) * 100) / 100);
        element.custom = { ...element.custom, appliedScaleY: scaleY, fontSizeBeforeScale: before };
      }
      // 仅在从 pt→px 计算的情况下，对字距应用水平缩放
      if (scaleX !== 1 && typeof element.letterSpacing === 'number' && element.custom.fontSizeSource === 'ptToPx') {
        element.letterSpacing = Math.max(-0.5, Math.min(2.0, Math.round((element.letterSpacing * scaleX) * 1000) / 1000));
        element.custom = { ...element.custom, appliedScaleX: scaleX };
      }

      // 行高：PSD leading 为 pt，换算为 px 后除以字体像素，得到比例
      if (textStyle?.leading && textStyle.leading > 0) {
        const leadingPt = Number(textStyle.leading);
        const leadingPx = ptToPx(leadingPt);
        element.lineHeight = Math.max(0.8, Math.min(3.0, Math.round((leadingPx / element.fontSize) * 1000) / 1000));
        console.log(`严格行高: ${leadingPt}pt -> ${element.lineHeight} (font ${element.fontSize}px)`);
      } else {
        element.lineHeight = 1.2;
      }
      
      // 高精度字符间距处理
      if (textStyle?.tracking !== undefined && textStyle.tracking !== null) {
        // PSD tracking 以 1/1000 em 表示
        const tracking = Number(textStyle.tracking);
        element.letterSpacing = Math.max(-0.5, Math.min(2.0, Math.round((tracking / 1000) * 1000) / 1000));
        console.log(`严格字符间距: ${tracking} -> ${element.letterSpacing}em`);
      } else {
        element.letterSpacing = 0;
      }
      
      // 保存原始行高和间距值用于调试
      element.custom = {
        ...element.custom,
        originalLeadingPt: textStyle?.leading,
        originalTrackingThousandthsEm: textStyle?.tracking,
        preciseMetrics: {
          lineHeight: element.lineHeight,
          letterSpacing: element.letterSpacing,
          calculationMethod: 'strict-pt-to-px'
        }
      };
      
      // 应用精确样式CSS类
      element.custom = {
        ...element.custom,
        cssClass: 'psd-precision-text',
        renderingOptimizations: {
          fontSmoothing: 'antialiased',
          textRendering: 'optimizeLegibility',
          fontDisplay: 'swap'
        }
      };
      
      console.log('转换后的Polotno元素:', element);
      
      // 记录最终元素转换结果
      psdDebugger.logConversion('元素转换完成', layer.name, 
        { 
          layerType: layer.text ? 'text' : 'image',
          layerBounds: { left: layer.left, top: layer.top, right: layer.right, bottom: layer.bottom }
        },
        {
          elementType: element.type,
          position: { x: element.x, y: element.y },
          size: { width: element.width, height: element.height },
          styles: element.type === 'text' ? {
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fill: element.fill,
            hasCustomPrecision: !!element.custom?.psdPrecision
          } : null
        }
      );
      
    } 
    // 处理图像图层 - 高质量图像处理
    else {
      // 检查图层是否有有效内容
      const hasCanvas = layer.canvas && (layer.canvas.width > 0 || layer.canvas.height > 0);
      const hasImageData = layer.imageData && layer.imageData.data;
      const hasValidBounds = width > 0 && height > 0;
      
      if (!hasCanvas && !hasImageData && !hasValidBounds) {
        console.log(`跳过空图层: ${layer.name} (无有效内容)`);
        return null;
      }
      
      element.type = 'image';
      const canvas = layerToCanvas(layer);
      if (canvas && canvas.width > 0 && canvas.height > 0) {
        // 为图像元素添加高质量标记
        element.custom = {
          ...element.custom,
          highQuality: true,
          originalDimensions: {
            width: canvas.width,
            height: canvas.height
          },
          psdImageLayer: true
        };
        
        // 使用最高质量进行图像输出
        // 对于所有图像都使用PNG格式以保持最佳质量
        const format = 'image/png';
        element.src = getHighQualityDataURL(canvas, format, true);
        
        console.log(`✅ 高质量图像图层创建: ${layer.name}, 尺寸: ${canvas.width}x${canvas.height}, 格式: ${format}`);
      } else {
        // 为没有图像内容的图层创建占位符
        console.log(`⚠️  图层 ${layer.name} 无图像内容，创建占位符`);
        element.type = 'rect';
        element.fill = 'rgba(200, 200, 200, 0.3)'; // 半透明灰色占位符
        element.stroke = '#ccc';
        element.strokeWidth = 1;
        element.custom = {
          ...element.custom,
          isPlaceholder: true,
          psdLayer: true
        };
      }
    }
    
    return element;
  } catch (error) {
    console.error('图层转换失败:', error, {
      layerName: layer.name,
      layerKeys: Object.keys(layer)
    });
    return null;
  }
};

/**
 * 确保字体已加载
 * @param {string} fontFamily - 字体名称
 * @param {number} fontSize - 字体大小
 * @returns {Promise<boolean>} 是否加载成功
 */
const ensureFontLoaded = async (fontFamily, fontSize = 16) => {
  if (!fontFamily || fontFamily === 'Arial') return true;
  
  try {
    // 使用FontFace API检查字体是否可用
    await document.fonts.ready;
    
    // 检查字体是否已经可用
    if (document.fonts.check(`${fontSize}px ${fontFamily}`)) {
      return true;
    }

    // 尝试从系统字体加载
    const fontFace = new FontFace(fontFamily, `local("${fontFamily}")`);
    const loadedFont = await fontFace.load();
    document.fonts.add(loadedFont);
    
    return document.fonts.check(`${fontSize}px ${fontFamily}`);
  } catch (error) {
    console.warn(`字体 ${fontFamily} 加载失败:`, error);
    return false;
  }
};

/**
 * 获取字体的回退方案
 * @param {string} fontName - 原始字体名称
 * @returns {string} 字体回退字符串
 */
const getFontFallbacks = (fontName) => {
  if (!fontName) return 'Arial, sans-serif';
  
  const lowerName = fontName.toLowerCase();
  
  // 无衬线字体回退
  if (lowerName.includes('arial') || lowerName.includes('helvetica')) {
    return 'Arial, Helvetica, sans-serif';
  }
  
  // 衬线字体回退
  if (lowerName.includes('times') || lowerName.includes('georgia') || lowerName.includes('serif')) {
    return 'Times, "Times New Roman", Georgia, serif';
  }
  
  // 等宽字体回退
  if (lowerName.includes('courier') || lowerName.includes('mono')) {
    return 'Courier, "Courier New", Monaco, monospace';
  }
  
  // 手写体回退
  if (lowerName.includes('script') || lowerName.includes('brush')) {
    return 'cursive';
  }
  
  // 装饰字体回退
  if (lowerName.includes('display') || lowerName.includes('title')) {
    return 'fantasy';
  }
  
  // 默认无衬线回退
  return 'Arial, sans-serif';
};

/**
 * 映射字体名称到Web安全字体
 * @param {string} psdFontName - PSD 字体名称
 * @returns {string} Web安全字体名称
 */
const mapFontName = (psdFontName) => {
  if (!psdFontName) return 'Arial';
  
  const fontName = psdFontName.toLowerCase();
  
  // 常见字体映射
  const fontMap = {
    'arial': 'Arial, sans-serif',
    'helvetica': 'Helvetica, Arial, sans-serif',
    'times': 'Times, "Times New Roman", serif',
    'timesnewroman': 'Times, "Times New Roman", serif',
    'times new roman': 'Times, "Times New Roman", serif',
    'courier': 'Courier, "Courier New", monospace',
    'couriernew': 'Courier, "Courier New", monospace',
    'courier new': 'Courier, "Courier New", monospace',
    'verdana': 'Verdana, Arial, sans-serif',
    'georgia': 'Georgia, Times, serif',
    'palatino': 'Palatino, "Palatino Linotype", serif',
    'garamond': 'Garamond, Times, serif',
    'bookman': 'Bookman, serif',
    'comic sans ms': '"Comic Sans MS", cursive',
    'impact': 'Impact, Arial Black, sans-serif',
    'lucida console': '"Lucida Console", Monaco, monospace',
    'lucida sans unicode': '"Lucida Sans Unicode", Arial, sans-serif',
    'symbol': 'Symbol',
    'webdings': 'Webdings',
    'wingdings': 'Wingdings',
    'ms sans serif': '"MS Sans Serif", sans-serif',
    'ms serif': '"MS Serif", serif',
  };
  
  // 尝试精确匹配
  if (fontMap[fontName]) {
    return fontMap[fontName];
  }
  
  // 尝试部分匹配
  for (const [key, value] of Object.entries(fontMap)) {
    if (fontName.includes(key) || key.includes(fontName)) {
      return value;
    }
  }
  
  // 根据字体特征分类
  if (fontName.includes('serif') && !fontName.includes('sans')) {
    return 'Times, "Times New Roman", serif';
  } else if (fontName.includes('mono') || fontName.includes('courier')) {
    return 'Courier, "Courier New", monospace';
  } else if (fontName.includes('script') || fontName.includes('cursive')) {
    return 'cursive';
  } else if (fontName.includes('fantasy') || fontName.includes('decorative')) {
    return 'fantasy';
  }
  
  // 默认无衬线字体
  return 'Arial, sans-serif';
};

/**
 * 映射文本对齐方式
 * @param {string} psdAlignment - PSD 对齐方式
 * @returns {string} CSS 对齐方式
 */
const mapTextAlignment = (psdAlignment) => {
  if (!psdAlignment) return 'left';
  
  const alignment = psdAlignment.toString().toLowerCase();
  
  const alignmentMap = {
    'left': 'left',
    'center': 'center',
    'centre': 'center',
    'middle': 'center',
    'right': 'right',
    'justify': 'justify',
    'justifyleft': 'left',
    'justifycenter': 'center',
    'justifyright': 'right',
    'justifyall': 'justify',
    // 处理数字值
    '0': 'left',
    '1': 'center', 
    '2': 'right',
    '3': 'justify',
  };
  
  return alignmentMap[alignment] || 'left';
};

/**
 * 映射混合模式
 * @param {string} psdBlendMode - PSD 混合模式
 * @returns {string} CSS 混合模式
 */
const mapBlendMode = (psdBlendMode) => {
  const blendModeMap = {
    'normal': 'normal',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'softLight': 'soft-light',
    'hardLight': 'hard-light',
    'colorDodge': 'color-dodge',
    'colorBurn': 'color-burn',
    'darken': 'darken',
    'lighten': 'lighten',
    'difference': 'difference',
    'exclusion': 'exclusion',
  };
  
  return blendModeMap[psdBlendMode] || 'normal';
};

/**
 * RGB 转 HEX (改进版本，处理颜色空间问题)
 * @param {Object} rgb - RGB 颜色对象
 * @returns {string} HEX 颜色字符串
 */
const rgbToHex = (rgb) => {
  let { r = 0, g = 0, b = 0 } = rgb;
  
  // 确保颜色值在有效范围内
  r = Math.max(0, Math.min(255, Math.round(r)));
  g = Math.max(0, Math.min(255, Math.round(g)));
  b = Math.max(0, Math.min(255, Math.round(b)));
  
  // 不应用任何颜色校正，保持原始颜色值
  
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
};

/**
 * 获取 PSD 文件预览图
 * @param {Object} psd - 解析后的 PSD 数据
 * @returns {string|null} 预览图 DataURL
 */
export const getPSDPreview = (psd) => {
  try {
    console.log('getPSDPreview: 开始生成预览，PSD信息:', {
      width: psd.width,
      height: psd.height,
      hasCanvas: !!psd.canvas,
      canvasType: psd.canvas ? (psd.canvas instanceof HTMLCanvasElement ? 'HTMLCanvasElement' : 'Object') : 'none'
    });
    
    // 尝试使用合成图像
    if (psd.canvas) {
      if (psd.canvas instanceof HTMLCanvasElement) {
        console.log('getPSDPreview: 使用HTMLCanvasElement生成预览');
        const dataURL = canvasToDataURL(psd.canvas);
        console.log('getPSDPreview: HTMLCanvasElement预览生成完成，长度:', dataURL?.length);
        return dataURL;
      }
      
      if (psd.canvas.data && psd.canvas.width && psd.canvas.height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = psd.canvas.width;
        canvas.height = psd.canvas.height;
        
        try {
          const imageData = ctx.createImageData(canvas.width, canvas.height);
          imageData.data.set(new Uint8ClampedArray(psd.canvas.data));
          ctx.putImageData(imageData, 0, 0);
          const dataURL = canvasToDataURL(canvas);
          return dataURL;
        } catch (error) {
          console.warn('Canvas 数据处理失败，使用占位符:', error);
        }
      }
    }
    
    // 如果没有合成图像，创建简单预览
    if (psd.width && psd.height) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 创建缩略图尺寸
      const maxSize = 200;
      const scale = Math.min(maxSize / psd.width, maxSize / psd.height);
      
      canvas.width = Math.max(1, psd.width * scale);
      canvas.height = Math.max(1, psd.height * scale);
      
      // 绘制简单的占位符
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 添加边框
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
      
      // 添加PSD图标和信息
      ctx.fillStyle = '#666';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PSD', canvas.width / 2, canvas.height / 2 - 5);
      
      ctx.font = '10px Arial';
      ctx.fillText(`${psd.width}×${psd.height}`, canvas.width / 2, canvas.height / 2 + 10);
      
      const dataURL = canvasToDataURL(canvas);
      return dataURL;
    }
    
    return null;
  } catch (error) {
    console.error('生成 PSD 预览失败:', error);
    return null;
  }
};

/**
 * 验证文件是否为 PSD 格式
 * @param {File} file - 文件对象
 * @returns {boolean} 是否为 PSD 文件
 */
export const isPSDFile = (file) => {
  const psdMimeTypes = [
    'image/vnd.adobe.photoshop',
    'image/photoshop',
    'image/x-photoshop',
    'application/photoshop',
    'application/psd',
    'application/octet-stream', // 很多时候PSD文件会被识别为这种类型
  ];
  
  const hasPSDMimeType = psdMimeTypes.includes(file.type);
  const hasPSDExtension = file.name.toLowerCase().endsWith('.psd');
  
  // 如果是 octet-stream，只有在文件扩展名是 .psd 时才认为是PSD文件
  const isPSDByMimeType = file.type === 'application/octet-stream' ? hasPSDExtension : hasPSDMimeType;
  
  const result = isPSDByMimeType || hasPSDExtension;
  
  console.log('PSD 文件检测:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    hasPSDMimeType,
    hasPSDExtension,
    isPSDByMimeType,
    finalResult: result
  });
  
  return result;
};

// ==================== 模板预览生成功能 ====================

/**
 * 生成模板预览图
 * @param {Object} psd - 解析后的PSD数据
 * @param {Object} options - 预览选项
 * @returns {Promise<string>} Base64格式的预览图
 */
export const generateTemplatePreview = async (psd, options = {}) => {
  const { 
    width = 300, 
    height = 200, 
    quality = 0.8,
    backgroundColor = '#f5f5f5' 
  } = options;

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    // 设置背景色
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // 如果PSD有预览图，使用预览图
    if (psd.canvas) {
      const aspectRatio = Math.min(width / psd.width, height / psd.height);
      const drawWidth = psd.width * aspectRatio;
      const drawHeight = psd.height * aspectRatio;
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;
      
      ctx.drawImage(psd.canvas, x, y, drawWidth, drawHeight);
    } else {
      // 如果没有预览图，渲染简化版本
      await renderSimplifiedPreview(ctx, psd, width, height);
    }
    
    return canvas.toDataURL('image/jpeg', quality);
  } catch (error) {
    console.error('生成模板预览失败:', error);
    return await generateFallbackPreview(psd, width, height);
  }
};

/**
 * 生成缩略图
 * @param {Object} psd - 解析后的PSD数据
 * @param {Object} options - 缩略图选项
 * @returns {Promise<string>} Base64格式的缩略图
 */
export const generateThumbnail = async (psd, options = {}) => {
  const { width = 150, height = 100, quality = 0.6 } = options;
  
  return await generateTemplatePreview(psd, { 
    width, 
    height, 
    quality,
    backgroundColor: '#ffffff'
  });
};

/**
 * 渲染简化预览
 */
const renderSimplifiedPreview = async (ctx, psd, width, height) => {
  try {
    // 计算缩放比例
    const scale = Math.min(width / psd.width, height / psd.height);
    const offsetX = (width - psd.width * scale) / 2;
    const offsetY = (height - psd.height * scale) / 2;
    
    // 渲染主要图层
    if (psd.children && psd.children.length > 0) {
      const visibleLayers = psd.children.filter(layer => !layer.hidden);
      const maxLayers = 5; // 限制渲染图层数量以提高性能
      
      for (let i = 0; i < Math.min(visibleLayers.length, maxLayers); i++) {
        const layer = visibleLayers[i];
        await renderLayerSimplified(ctx, layer, scale, offsetX, offsetY);
      }
    }
    
    // 添加边框
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, psd.width * scale, psd.height * scale);
  } catch (error) {
    console.warn('简化预览渲染失败:', error);
  }
};

/**
 * 简化图层渲染
 */
const renderLayerSimplified = async (ctx, layer, scale, offsetX, offsetY) => {
  try {
    if (!layer || layer.hidden) return;
    
    const x = offsetX + (layer.left || 0) * scale;
    const y = offsetY + (layer.top || 0) * scale;
    const layerWidth = (layer.right - layer.left) * scale;
    const layerHeight = (layer.bottom - layer.top) * scale;
    
    // 渲染不同类型的图层
    if (layer.canvas) {
      // 图像图层
      ctx.globalAlpha = (layer.opacity || 255) / 255;
      ctx.drawImage(layer.canvas, x, y, layerWidth, layerHeight);
      ctx.globalAlpha = 1;
    } else if (layer.text) {
      // 文本图层
      renderTextLayerSimplified(ctx, layer, x, y, scale);
    } else if (layer.fillColor) {
      // 填充图层
      ctx.fillStyle = layer.fillColor;
      ctx.fillRect(x, y, layerWidth, layerHeight);
    }
  } catch (error) {
    console.warn('图层渲染失败:', layer.name, error);
  }
};

/**
 * 简化文本渲染
 */
const renderTextLayerSimplified = (ctx, layer, x, y, scale) => {
  try {
    const text = layer.text?.text || layer.name || 'Text';
    const fontSize = Math.max(8, (layer.text?.fontSize || 12) * scale);
    
    ctx.fillStyle = layer.text?.color || '#333333';
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 简单的文本换行
    const maxWidth = (layer.right - layer.left) * scale;
    const words = text.split(' ');
    let line = '';
    let lineY = y;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, lineY);
        line = words[n] + ' ';
        lineY += fontSize * 1.2;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, lineY);
  } catch (error) {
    console.warn('文本渲染失败:', error);
  }
};

/**
 * 生成后备预览图
 */
const generateFallbackPreview = async (psd, width, height) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = width;
  canvas.height = height;
  
  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f8f9fa');
  gradient.addColorStop(1, '#e9ecef');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 绘制PSD图标
  ctx.fillStyle = '#6c757d';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PSD Template', width / 2, height / 2 - 10);
  
  // 绘制尺寸信息
  ctx.font = '12px Arial';
  ctx.fillText(`${psd.width} × ${psd.height}`, width / 2, height / 2 + 15);
  
  return canvas.toDataURL('image/jpeg', 0.8);
};

/**
 * 创建模板元数据
 * @param {File} file - 原始PSD文件
 * @param {Object} psd - 解析后的PSD数据
 * @param {Object} store - Polotno store
 * @returns {Object} 模板元数据
 */
export const createTemplateMetadata = (file, psd, store) => {
  const layerCount = psd.children ? flattenLayers(psd.children).length : 0;
  
  return {
    originalFileName: file.name,
    dimensions: { 
      width: psd.width, 
      height: psd.height 
    },
    createdAt: Date.now(),
    layerCount,
    fileSize: file.size,
    tags: extractTags(file.name, psd),
    category: determineCategory(file.name, psd),
    compatibility: {
      polotnoVersion: store.version || '2.28.3',
      hasText: hasTextLayers(psd),
      hasImages: hasImageLayers(psd),
      hasShapes: hasShapeLayers(psd)
    }
  };
};

/**
 * 从文件名和PSD内容提取标签
 */
const extractTags = (fileName, psd) => {
  const tags = [];
  const name = fileName.toLowerCase().replace('.psd', '');
  
  // 从文件名提取标签
  if (name.includes('template')) tags.push('template');
  if (name.includes('poster')) tags.push('poster');
  if (name.includes('flyer')) tags.push('flyer');
  if (name.includes('banner')) tags.push('banner');
  if (name.includes('card')) tags.push('card');
  if (name.includes('social')) tags.push('social-media');
  
  // 从PSD内容分析
  if (psd.width > psd.height) {
    tags.push('landscape');
  } else if (psd.height > psd.width) {
    tags.push('portrait');
  } else {
    tags.push('square');
  }
  
  // 尺寸标签
  if (psd.width >= 1920 || psd.height >= 1920) {
    tags.push('high-resolution');
  }
  
  return [...new Set(tags)]; // 去重
};

/**
 * 确定模板分类
 */
const determineCategory = (fileName, psd) => {
  const name = fileName.toLowerCase();
  
  if (name.includes('poster')) return 'poster';
  if (name.includes('flyer')) return 'flyer';
  if (name.includes('banner')) return 'banner';
  if (name.includes('card')) return 'card';
  if (name.includes('social')) return 'social-media';
  if (name.includes('brochure')) return 'brochure';
  
  // 根据尺寸判断
  const aspectRatio = psd.width / psd.height;
  if (aspectRatio > 2) return 'banner';
  if (Math.abs(aspectRatio - 1) < 0.1) return 'social-media';
  if (aspectRatio < 0.8) return 'poster';
  
  return 'general';
};

/**
 * 检查是否包含文本图层
 */
const hasTextLayers = (psd) => {
  if (!psd.children) return false;
  const layers = flattenLayers(psd.children);
  return layers.some(layer => layer.text);
};

/**
 * 检查是否包含图像图层
 */
const hasImageLayers = (psd) => {
  if (!psd.children) return false;
  const layers = flattenLayers(psd.children);
  return layers.some(layer => layer.canvas || layer.imageData);
};

/**
 * 检查是否包含形状图层
 */
const hasShapeLayers = (psd) => {
  if (!psd.children) return false;
  const layers = flattenLayers(psd.children);
  return layers.some(layer => layer.vectorMask || layer.fillColor);
};