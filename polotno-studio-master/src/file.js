import {
  parsePSDFile,
  flattenLayers,
  layerToPolotnoElement,
  isPSDFile,
  getPSDPreview
} from './psd-utils';

export const loadJSONFile = (file, store) => {
  var reader = new FileReader();
  reader.onloadend = function () {
    var text = reader.result;
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      alert('Can not load the project.');
    }

    if (json) {
      store.loadJSON(json);
    }
  };
  reader.onerror = function () {
    alert('Can not load Polotno project file.');
  };
  reader.readAsText(file);
};

export const loadImageFile = (file, store) => {
  var reader = new FileReader();
  reader.onloadend = function () {
    var url = reader.result;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const scale = Math.min(
        1,
        store.width / img.width,
        store.height / img.height
      );
      const type = file.type.indexOf('svg') > -1 ? 'svg' : 'image';
      store.activePage.addElement({
        type,
        width: img.width * scale,
        height: img.height * scale,
        src: url,
      });
    };
  };
  reader.onerror = function () {
    alert('Can not load image.');
  };
  reader.readAsDataURL(file);
};

// PSD 文件处理函数
export const loadPSDFile = async (file, store) => {
  try {
    console.log('开始加载 PSD 文件:', file.name, file.size, 'bytes');

    const psd = await parsePSDFile(file);
    console.log('PSD 解析完成:', psd);

    // === 新增：记录当前画布尺寸，用于自动缩放 ===
    const currentCanvasWidth = store.width;
    const currentCanvasHeight = store.height;
    const psdWidth = psd.width;
    const psdHeight = psd.height;

    console.log('当前画布尺寸:', currentCanvasWidth, 'x', currentCanvasHeight);
    console.log('PSD文件尺寸:', psdWidth, 'x', psdHeight);

    // === 新增：计算智能适配缩放比例（保持宽高比，完整显示） ===
    const scale = Math.min(
      currentCanvasWidth / psdWidth,
      currentCanvasHeight / psdHeight
    );

    console.log(`🎯 PSD自动缩放比例: ${scale.toFixed(3)} (${(scale * 100).toFixed(1)}%)`);
    console.log(`   原始尺寸: ${psdWidth} × ${psdHeight} px`);
    console.log(`   适配后尺寸: ${Math.round(psdWidth * scale)} × ${Math.round(psdHeight * scale)} px`);

    // 保存PSD预览图用于对比
    const previewUrl = getPSDPreview(psd);
    if (previewUrl) {
      // 将预览图保存到全局变量，供PSD对比工具使用
      window.lastPSDPreview = previewUrl;
      if (window.storePSDPreview) {
        window.storePSDPreview(previewUrl, file.name);
      }
      console.log('PSD预览图已保存，可用于对比工具');
    }

    // === 修改：不改变画布尺寸，保持当前画布大小 ===
    // 原代码: store.setSize(psd.width, psd.height);
    // 现在：保持画布尺寸不变，让PSD适应画布

    // 提取并转换图层
    const layers = flattenLayers(psd.children || []);
    console.log('扁平化图层数量:', layers.length);

    let successCount = 0;
    let errorCount = 0;

    for (const layer of layers) {
      console.log('处理图层:', layer.name, layer);
      try {
        const element = await layerToPolotnoElement(layer);
        if (element) {
          // === 新增：应用自动缩放到每个元素 ===
          // 位置缩放
          element.x = (element.x || 0) * scale;
          element.y = (element.y || 0) * scale;

          // 尺寸缩放
          if (element.width) {
            element.width *= scale;
          }
          if (element.height) {
            element.height *= scale;
          }

          // 文字字号缩放
          if (element.fontSize) {
            element.fontSize *= scale;
            console.log(`  📝 文字字号缩放: ${(element.fontSize / scale).toFixed(1)} → ${element.fontSize.toFixed(1)} px`);
          }

          // 描边宽度缩放
          if (element.strokeWidth) {
            element.strokeWidth *= scale;
          }

          // 文字效果缩放（如果有）
          if (element.custom && element.custom.textEffects) {
            const effects = element.custom.textEffects;

            // 描边效果
            if (effects.stroke && effects.stroke.size) {
              effects.stroke.size *= scale;
            }

            // 外发光效果
            if (effects.outerGlow && effects.outerGlow.size) {
              effects.outerGlow.size *= scale;
            }

            // 投影效果
            if (effects.dropShadow) {
              if (effects.dropShadow.distance) {
                effects.dropShadow.distance *= scale;
              }
              if (effects.dropShadow.size) {
                effects.dropShadow.size *= scale;
              }
              if (effects.dropShadow.spread) {
                effects.dropShadow.spread *= scale;
              }
            }

            // 内阴影效果
            if (effects.innerShadow) {
              if (effects.innerShadow.distance) {
                effects.innerShadow.distance *= scale;
              }
              if (effects.innerShadow.size) {
                effects.innerShadow.size *= scale;
              }
            }

            // 斜面和浮雕效果
            if (effects.bevelEmboss) {
              if (effects.bevelEmboss.depth) {
                effects.bevelEmboss.depth *= scale;
              }
              if (effects.bevelEmboss.size) {
                effects.bevelEmboss.size *= scale;
              }
            }

            console.log('  ✨ 文字效果已缩放');
          }

          // 圆角半径缩放（如果有）
          if (element.cornerRadius) {
            element.cornerRadius *= scale;
          }

          store.activePage.addElement(element);
          successCount++;
          console.log('✅ 成功添加图层:', element.name);
        } else {
          console.log('⏭️ 跳过图层:', layer.name);
        }
      } catch (layerError) {
        console.error('❌ 图层处理失败:', layer.name, layerError);
        errorCount++;
      }
    }

    console.log('PSD 文件加载完成');

    if (successCount > 0) {
      alert(`成功导入 PSD 文件！\n\n导入图层: ${successCount}\n跳过图层: ${layers.length - successCount - errorCount}\n失败图层: ${errorCount}\n\n📐 自动缩放: ${(scale * 100).toFixed(1)}%\n原始尺寸: ${psdWidth} × ${psdHeight} px\n适配尺寸: ${Math.round(psdWidth * scale)} × ${Math.round(psdHeight * scale)} px\n\n📌 所有图层已自动适配当前画布尺寸`);
    } else {
      alert('PSD 文件导入完成，但没有可用的图层内容');
    }
  } catch (error) {
    console.error('PSD 文件加载失败:', error);
    alert(`PSD 文件加载失败: ${error.message}\n\n请确保文件是有效的 PSD 格式，且不是过于复杂的文件。`);
  }
};

export const loadFile = (file, store) => {
  if (isPSDFile(file)) {
    loadPSDFile(file, store);
  } else if (file.type.indexOf('image') >= 0) {
    loadImageFile(file, store);
  } else {
    loadJSONFile(file, store);
  }
};
