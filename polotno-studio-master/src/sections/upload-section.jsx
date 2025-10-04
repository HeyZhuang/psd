import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@blueprintjs/core';
// 使用字串 IconName
import {
  ImagesGrid,
  UploadSection as DefaultUploadSection,
} from 'polotno/side-panel';
import { getImageSize, getCrop } from 'polotno/utils/image';
import { getVideoSize, getVideoPreview } from 'polotno/utils/video';
import { dataURLtoBlob } from '../blob';
import { 
  parsePSDFile, 
  flattenLayers, 
  layerToPolotnoElement, 
  getPSDPreview,
  isPSDFile,
  generateTemplatePreview,
  generateThumbnail,
  createTemplateMetadata
} from '../psd-utils';
import { TemplateManager } from '../utils/template-manager';

import { CloudWarning } from '../cloud-warning';

import { useProject } from '../project';
import { listAssets, uploadAsset, deleteAsset } from '../api';
import { createTestPSD } from '../create-test-psd';

function getType(file) {
  const { type, name } = file;
  
  if (isPSDFile(file)) {
    return 'psd';
  }
  if (type.indexOf('svg') >= 0) {
    return 'svg';
  }
  if (type.indexOf('image') >= 0) {
    return 'image';
  }
  if (type.indexOf('video') >= 0) {
    return 'video';
  }
  return 'image';
}

const getImageFilePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      // now we need to render that image into smaller canvas and get data url
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = (200 * img.height) / img.width;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
};

export const UploadPanel = observer(({ store }) => {
  const [images, setImages] = React.useState([]);
  const [isUploading, setUploading] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const project = useProject();

  const load = async () => {
    setLoading(true);
    try {
      const images = await listAssets();
      setImages(images);
    } catch (error) {
      console.error('加载资源列表失败:', error);
      // 即使失败也要显示现有的图片
    } finally {
      setLoading(false);
    }
  };

  // 检查PSD是否包含文字图层
  const checkForTextLayers = (psd) => {
    if (!psd.children) return false;
    
    const checkLayer = (layer) => {
      if (layer.text && layer.text.text) return true;
      if (layer.children) {
        return layer.children.some(checkLayer);
      }
      return false;
    };
    
    return psd.children.some(checkLayer);
  };

  // 统计文字图层数量
  const countTextLayers = (psd) => {
    if (!psd.children) return 0;
    
    let count = 0;
    const countLayer = (layer) => {
      if (layer.text && layer.text.text) count++;
      if (layer.children) {
        layer.children.forEach(countLayer);
      }
    };
    
    psd.children.forEach(countLayer);
    return count;
  };

  // 检查文字图层是否包含效果
  const analyzeTextEffects = (psd) => {
    if (!psd.children) return { hasEffects: false, effectTypes: [], totalTextLayers: 0, textLayersWithEffects: 0 };
    
    let totalTextLayers = 0;
    let textLayersWithEffects = 0;
    const effectTypes = new Set();
    
    const analyzeLayer = (layer) => {
      if (layer.text && layer.text.text) {
        totalTextLayers++;
        
        // 检查是否有效果数据
        let hasLayerEffects = false;
        if (layer.effects || layer.layerEffects || layer.additionalLayerInfo) {
          // 简单检查常见效果
          if (layer.effects || layer.layerEffects) {
            const effects = layer.effects || layer.layerEffects;
            if (effects.stroke) { effectTypes.add('描边'); hasLayerEffects = true; }
            if (effects.outerGlow) { effectTypes.add('外发光'); hasLayerEffects = true; }
            if (effects.dropShadow) { effectTypes.add('投影'); hasLayerEffects = true; }
            if (effects.colorOverlay) { effectTypes.add('颜色叠加'); hasLayerEffects = true; }
          }
          
          // 检查additionalLayerInfo
          if (layer.additionalLayerInfo && layer.additionalLayerInfo.length > 0) {
            for (const info of layer.additionalLayerInfo) {
              if (info.key === 'lfx2' || info.key === 'leff') {
                effectTypes.add('图层效果');
                hasLayerEffects = true;
                break;
              }
            }
          }
        }
        
        if (hasLayerEffects) {
          textLayersWithEffects++;
        }
      }
      
      if (layer.children) {
        layer.children.forEach(analyzeLayer);
      }
    };
    
    psd.children.forEach(analyzeLayer);
    
    return {
      hasEffects: textLayersWithEffects > 0,
      effectTypes: Array.from(effectTypes),
      totalTextLayers,
      textLayersWithEffects
    };
  };

  const handleFileInput = async (e) => {
    const { target } = e;
    
    // 检查是否已经在上传中，如果是则直接返回
    if (isUploading) {
      console.log('已有文件在上传中，忽略新的上传请求');
      return;
    }
    
    setUploading(true);
    console.log('开始文件上传，文件数量:', target.files.length);
    
    try {
      for (const file of target.files) {
        console.log('处理文件:', file.name, '类型:', file.type);
        const type = getType(file);
        console.log('检测到文件类型:', type);
        let previewDataURL = '';
        let shouldImportPSD = false;
      
      if (type === 'psd') {
        try {
          console.log('开始解析 PSD 文件...');
          const psd = await parsePSDFile(file);
          console.log('PSD 解析成功，开始生成预览...');
          previewDataURL = getPSDPreview(psd);
          console.log('PSD 预览生成结果:', previewDataURL ? `长度${previewDataURL.length}` : '失败');
          
          // 如果无法生成预览，创建默认预览
          if (!previewDataURL) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 150;
            
            // 绘制PSD占位符
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 200, 150);
            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(0, 0, 200, 150);
            
            ctx.fillStyle = '#666';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PSD FILE', 100, 75);
            
            ctx.font = '12px Arial';
            ctx.fillText(file.name, 100, 95);
            
            previewDataURL = canvas.toDataURL();
          }
          
          // 使用非阻塞的方式询问用户如何处理PSD文件
          setTimeout(() => {
            handlePSDOptions(file, psd).catch(error => {
              console.error('PSD处理失败:', error);
              alert(`PSD处理失败: ${error.message}`);
            });
          }, 100);
          
          // 继续处理，将PSD文件上传到资源库
        } catch (error) {
          console.error('PSD 处理失败:', error);
          
          // 即使PSD解析失败，也尝试创建基本预览并上传原文件
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 200;
          canvas.height = 150;
          
          ctx.fillStyle = '#ffebee';
          ctx.fillRect(0, 0, 200, 150);
          ctx.strokeStyle = '#f44336';
          ctx.strokeRect(0, 0, 200, 150);
          
          ctx.fillStyle = '#d32f2f';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('PSD ERROR', 100, 75);
          
          ctx.font = '12px Arial';
          ctx.fillText('解析失败', 100, 95);
          
          previewDataURL = canvas.toDataURL();
          
          // 使用非阻塞的错误提示
          setTimeout(() => {
            alert(`PSD 文件处理失败: ${error.message}\n\n文件仍会上传到资源库，但无法导入图层`);
          }, 100);
          // 继续执行，不要跳过上传
        }
      } else if (type === 'video') {
        try {
          previewDataURL = await getVideoPreview(URL.createObjectURL(file));
        } catch (error) {
          console.error('视频预览生成失败:', error);
          previewDataURL = await getImageFilePreview(file); // 回退到图片预览
        }
      } else {
        previewDataURL = await getImageFilePreview(file);
      }
      
      // 确保有有效的预览图
      if (!previewDataURL) {
        console.error(`无法生成 ${file.name} 的预览图`);
        continue;
      }
      
      try {
        console.log('开始上传文件到资源库:', file.name);
        const preview = dataURLtoBlob(previewDataURL);
        console.log('预览图转换为 Blob 成功，大小:', preview.size);
        await uploadAsset({ file, preview, type });
        console.log('文件上传成功:', file.name);
      } catch (error) {
        console.error(`上传文件 ${file.name} 失败:`, error);
        // 使用非阻塞的错误提示
        setTimeout(() => {
          alert(`上传文件 ${file.name} 失败: ${error.message}`);
        }, 100);
        continue;
      }
    }
    } catch (globalError) {
      console.error('文件上传过程发生错误:', globalError);
      // 使用非阻塞的错误提示
      setTimeout(() => {
        alert(`文件上传失败: ${globalError.message}`);
      }, 100);
    } finally {
      // 确保始终重置上传状态
      try {
        await load();
      } catch (loadError) {
        console.error('重新加载资源列表失败:', loadError);
      }
      setUploading(false);
      // 重置文件输入
      if (target) {
        target.value = null;
      }
    }
  };

  const handlePSDImport = async (psd, showCompletionAlert = true) => {
    try {
      
      // 设置画布尺寸
      if (psd.width && psd.height) {
        const maxSize = 5000; // 限制最大尺寸
        const width = Math.min(psd.width, maxSize);
        const height = Math.min(psd.height, maxSize);
        
        store.setSize(width, height);
      }
      
      // 提取并转换图层
      const layers = flattenLayers(psd.children || []);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        try {
          const element = await layerToPolotnoElement(layer);
          if (element) {
            
            if (!store || !store.activePage) {
              errorCount++;
              continue;
            }
            
            store.activePage.addElement(element);
            successCount++;
          }
        } catch (error) {
          console.error(`图层处理失败: ${layer.name}`, error);
          errorCount++;
        }
      }
      
      
      if (showCompletionAlert) {
        const message = `PSD 导入完成!\n\n成功导入: ${successCount} 个图层\n${errorCount > 0 ? `失败: ${errorCount} 个图层\n` : ''}总图层数: ${layers.length}`;
        alert(message);
      } else {
        console.log(`PSD 导入完成: 成功 ${successCount} 个, 失败 ${errorCount} 个, 总计 ${layers.length} 个图层`);
      }
    } catch (error) {
      console.error('PSD 导入失败:', error);
      alert(`PSD 导入过程中发生错误: ${error.message}`);
    }
  };

  // 处理PSD文件选项
  const handlePSDOptions = async (file, psd) => {
    const fileName = file.name.replace('.psd', '');
    
    // 检查是否包含文字图层
    const hasTextLayers = checkForTextLayers(psd);
    const textLayerCount = countTextLayers(psd);
    const textEffectsAnalysis = analyzeTextEffects(psd);
    
    const message = `检测到 PSD 文件: ${file.name}\n尺寸: ${psd.width} × ${psd.height}\n图层数: ${psd.children?.length || 0}${hasTextLayers ? `\n文字图层: ${textLayerCount} 个` : ''}${textEffectsAnalysis.hasEffects ? `\n🎨 发现文字效果: ${textEffectsAnalysis.textLayersWithEffects} 个图层包含效果` : ''}\n\n请选择操作:`;
    
    // 创建模态对话框
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.6); z-index: 10000; display: flex; 
      align-items: center; justify-content: center; backdrop-filter: blur(2px);
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white; padding: 20px; border-radius: 12px; 
      max-width: 500px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    dialog.innerHTML = `
      <h3 style="margin-top: 0; color: #333; font-size: 18px; font-weight: 600;">PSD 文件导入选项</h3>
      <p style="color: #666; line-height: 1.5; margin-bottom: 20px;">${message}</p>
      
      ${hasTextLayers ? `
        <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #007bff;">
          <div style="font-weight: 600; color: #333; margin-bottom: 8px;">📝 文字导入选项</div>
          
          ${textEffectsAnalysis.hasEffects ? `
            <div style="background: #fff3cd; padding: 8px; border-radius: 4px; margin-bottom: 12px; border: 1px solid #ffeaa7;">
              <div style="font-size: 13px; color: #856404; font-weight: 500; margin-bottom: 4px;">🎨 检测到文字效果</div>
              <div style="font-size: 12px; color: #6c5200;">
                ${textEffectsAnalysis.textLayersWithEffects} 个文字图层包含效果: ${textEffectsAnalysis.effectTypes.join(', ')}
              </div>
              <div style="font-size: 11px; color: #856404; margin-top: 4px;">
                • 选择"可编辑文字"可在编辑器中控制这些效果<br>
                • 选择"图片模式"保持效果的完全一致性
              </div>
            </div>
          ` : ''}
          
          <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
            <input type="radio" name="textMode" value="editable" style="margin-right: 8px;" checked>
            <span style="color: #333;">导入为可编辑文字 (推荐${textEffectsAnalysis.hasEffects ? ' - 支持效果编辑' : ''})</span>
          </label>
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="radio" name="textMode" value="rasterized" style="margin-right: 8px;">
            <span style="color: #333;">导入为图片 (保持完全一致${textEffectsAnalysis.hasEffects ? ' - 效果固化' : ''})</span>
          </label>
        </div>
      ` : ''}
      
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        <button id="import-layers" style="flex: 1; min-width: 140px; padding: 12px 16px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background-color 0.2s;">
          导入图层到画布
        </button>
        <button id="save-template" style="flex: 1; min-width: 140px; padding: 12px 16px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background-color 0.2s;">
          保存为模板
        </button>
        <button id="both-actions" style="flex: 1; min-width: 140px; padding: 12px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background-color 0.2s;">
          导入并保存模板
        </button>
        <button id="cancel" style="flex: 1; min-width: 140px; padding: 12px 16px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background-color 0.2s;">
          取消
        </button>
      </div>
      
      <style>
        #import-layers:hover { background: #0056b3; }
        #save-template:hover { background: #1e7e34; }
        #both-actions:hover { background: #545b62; }
        #cancel:hover { background: #c82333; }
      </style>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    return new Promise((resolve) => {
      const cleanup = () => {
        document.body.removeChild(modal);
        resolve();
      };
      
      const getTextMode = () => {
        const textModeRadio = dialog.querySelector('input[name="textMode"]:checked');
        return textModeRadio ? textModeRadio.value : 'editable';
      };
      
      const setTextImportMode = (mode) => {
        // 设置全局PSD导入选项
        window.psdImportOptions = window.psdImportOptions || {};
        window.psdImportOptions.rasterizeText = (mode === 'rasterized');
        console.log('设置文字导入模式:', mode === 'rasterized' ? '位图模式' : '可编辑模式');
      };
      
      dialog.querySelector('#import-layers').onclick = async () => {
        const textMode = getTextMode();
        setTextImportMode(textMode);
        cleanup();
        await handlePSDImport(psd);
      };
      
      dialog.querySelector('#save-template').onclick = async () => {
        const textMode = getTextMode();
        setTextImportMode(textMode);
        cleanup();
        await handleSaveAsTemplate(file, psd, true); // true表示需要先导入PSD
      };
      
      dialog.querySelector('#both-actions').onclick = async () => {
        const textMode = getTextMode();
        setTextImportMode(textMode);
        cleanup();
        await handlePSDImport(psd, true); // 先导入并显示提示
        await handleSaveAsTemplate(file, psd, false); // false表示已经导入过了，不需要再导入
      };
      
      dialog.querySelector('#cancel').onclick = cleanup;
      modal.onclick = (e) => {
        if (e.target === modal) cleanup();
      };
    });
  };

  // 保存为模板 - 需要先导入PSD再保存
  const handleSaveAsTemplate = async (file, psd, shouldImportFirst = true) => {
    try {
      console.log('开始保存PSD为模板:', file.name);
      
      // 创建模板名称输入对话框
      const templateName = prompt('请输入模板名称:', file.name.replace('.psd', ''));
      if (!templateName) return;
      
      let templateJson;
      
      if (shouldImportFirst) {
        // 先导入PSD到store中，然后保存模板
        console.log('先导入PSD到store中...');
        await handlePSDImport(psd, false); // 传入false表示不显示完成提示
        templateJson = store.toJSON();
        console.log('PSD导入完成，模板JSON数据大小:', JSON.stringify(templateJson).length);
      } else {
        // 如果已经导入了，直接使用当前store状态
        templateJson = store.toJSON();
      }
      
      // 生成预览图和缩略图
      console.log('生成模板预览图...');
      const preview = await generateTemplatePreview(psd);
      const thumbnail = await generateThumbnail(psd);
      
      // 创建模板元数据
      const metadata = createTemplateMetadata(file, psd, store);
      
      // 创建模板对象
      const template = {
        id: TemplateManager.generateId(),
        name: templateName,
        type: 'user-psd-template',
        preview,
        thumbnail,
        json: templateJson,
        metadata
      };
      
      // 保存模板
      await TemplateManager.saveTemplate(template);
      
      alert(`模板 "${templateName}" 保存成功！\n可在"用户模板"部分查看和使用。`);
      console.log('模板保存成功:', template.id, '数据大小:', JSON.stringify(template.json).length);
      
    } catch (error) {
      console.error('保存模板失败:', error);
      alert(`保存模板失败: ${error.message}`);
    }
  };

  const handleDelete = async (image) => {
    if (window.confirm('Are you sure you want to delete the image?')) {
      setImages(images.filter((i) => i.id !== image.id));
      await deleteAsset({ id: image.id });
      await load();
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  React.useEffect(() => {
    load();
  }, [project.cloudEnabled]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="input-file">
          <Button
            icon="upload"
            style={{ width: '100%' }}
            onClick={() => {
              if (isUploading) {
                console.log('上传中，忽略点击');
                return;
              }
              const input = document.querySelector('#input-file');
              input?.click();
            }}
            loading={isUploading}
            disabled={isUploading}
            intent="primary"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
          <input
            type="file"
            id="input-file"
            style={{ display: 'none' }}
            onChange={handleFileInput}
            multiple
            accept="image/*,.psd,application/photoshop,image/vnd.adobe.photoshop,application/octet-stream"
            disabled={isUploading}
          />
        </label>
        
        {/* Test PSD Button - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <Button
            icon="document"
            style={{ width: '100%', marginBottom: '10px' }}
            onClick={createTestPSD}
            intent="warning"
          >
            创建测试 PSD 文件
          </Button>
        )}
      </div>
      <CloudWarning />
      <ImagesGrid
        images={images}
        getPreview={(image) => image.preview}
        crossOrigin={undefined}
        isLoading={isLoading}
        getCredit={(image) => (
          <div>
            <Button
              icon="trash"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(image);
              }}
            ></Button>
          </div>
        )}
        onSelect={async (item, pos, element) => {
          const image = item.src;
          const type = item.type;

          const getSizeFunc = type === 'video' ? getVideoSize : getImageSize;

          let { width, height } = await getSizeFunc(image);

          if (
            element &&
            element.type === 'svg' &&
            element.contentEditable &&
            type === 'image'
          ) {
            element.set({ maskSrc: image });
            return;
          }

          if (
            element &&
            element.type === 'image' &&
            element.contentEditable &&
            type == 'image'
          ) {
            const crop = getCrop(element, {
              width,
              height,
            });
            element.set({ src: image, ...crop });
            return;
          }

          const scale = Math.min(store.width / width, store.height / height, 1);
          width = width * scale;
          height = height * scale;

          const x = (pos?.x || store.width / 2) - width / 2;
          const y = (pos?.y || store.height / 2) - height / 2;

          store.activePage?.addElement({
            type,
            src: image,
            x,
            y,
            width,
            height,
          });
        }}
      />
    </div>
  );
});

DefaultUploadSection.Panel = UploadPanel;

export const UploadSection = DefaultUploadSection;
