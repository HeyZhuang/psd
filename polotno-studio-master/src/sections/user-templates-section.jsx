import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, ButtonGroup, Spinner, Card, Icon } from '@blueprintjs/core';
import { SectionTab } from 'polotno/side-panel';
import { ImagesGrid } from 'polotno/side-panel';
import { TemplateManager } from '../utils/template-manager';

// 模板项组件
const TemplateItem = ({ image, onClick, getImageSize, ...props }) => {
  const [isDeleting, setDeleting] = React.useState(false);
  const [isEditing, setEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(image.name);
  
  const handleClick = (e) => {
    e.preventDefault();
    onClick && onClick(image);
  };
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`确定要删除模板 "${image.name}" 吗？`)) return;
    
    setDeleting(true);
    try {
      await TemplateManager.deleteTemplate(image.id);
      // 触发父组件重新加载
      if (props.onDelete) {
        props.onDelete(image.id);
      }
    } catch (error) {
      console.error('删除模板失败:', error);
      alert(`删除模板失败: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleRename = async (e) => {
    e.stopPropagation();
    setEditing(true);
  };

  const handleSaveRename = async () => {
    if (!newName.trim()) {
      alert('模板名称不能为空');
      return;
    }
    
    try {
      await TemplateManager.updateTemplate(image.id, { name: newName.trim() });
      
      // 触发父组件重新加载
      if (props.onUpdate) {
        props.onUpdate();
      }
      
      setEditing(false);
      console.log('模板重命名成功:', newName);
    } catch (error) {
      console.error('重命名模板失败:', error);
      alert(`重命名失败: ${error.message}`);
    }
  };

  const handleCancelRename = () => {
    setNewName(image.name);
    setEditing(false);
  };
  
  const imageSize = getImageSize(image);
  
  return (
    <div 
      onClick={handleClick}
      style={{ 
        position: 'relative', 
        cursor: 'pointer',
        opacity: isDeleting ? 0.5 : 1
      }}
    >
      <Card interactive style={{ margin: '5px', overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={image.preview || image.thumbnail}
            style={{
              width: '100%',
              height: `${imageSize.height}px`,
              objectFit: 'cover',
              display: 'block'
            }}
            alt={image.name}
          />
          
          {/* 模板信息覆盖层 */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            color: 'white',
            padding: '10px 8px 8px',
            fontSize: '12px'
          }}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '4px 6px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') handleCancelRename();
                  }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={handleSaveRename}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelRename}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                  {image.name}
                </div>
                <div style={{ opacity: 0.9 }}>
                  {image.metadata?.dimensions?.width} × {image.metadata?.dimensions?.height}
                  {image.metadata?.layerCount && ` • ${image.metadata.layerCount} 图层`}
                </div>
                {image.metadata?.tags && (
                  <div style={{ 
                    marginTop: '4px',
                    fontSize: '10px',
                    opacity: 0.8
                  }}>
                    {image.metadata.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        marginRight: '4px'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* 操作按钮组 */}
          <div style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            display: 'flex',
            gap: '4px'
          }}>
            {/* 编辑名称按钮 */}
            <Button
              icon="edit"
              minimal
              small
              style={{
                background: 'rgba(0,0,0,0.5)',
                color: 'white'
              }}
              onClick={handleRename}
              title="编辑模板名称"
              disabled={isEditing || isDeleting}
            />
            
            {/* 删除按钮 */}
            <Button
              icon="trash"
              minimal
              small
              intent="danger"
              style={{
                background: 'rgba(0,0,0,0.5)',
                color: 'white'
              }}
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isDeleting || isEditing}
              title="删除模板"
            />
          </div>
          
          {/* 应用按钮 */}
          <Button
            icon="play"
            minimal
            small
            intent="primary"
            style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              background: 'rgba(0,0,0,0.5)',
              color: 'white'
            }}
            onClick={handleClick}
            title="应用此模板"
            disabled={isEditing}
          />
        </div>
      </Card>
    </div>
  );
};

// 用户模板面板组件
export const UserTemplatesPanel = observer(({ store }) => {
  const [templates, setTemplates] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [stats, setStats] = React.useState({ total: 0, local: 0, cloud: 0 });

  // 加载用户模板
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const userTemplates = await TemplateManager.getAllTemplates();
      const templateStats = await TemplateManager.getTemplateStats();
      
      setTemplates(userTemplates);
      setStats(templateStats);
      console.log(`加载了 ${userTemplates.length} 个用户模板`);
    } catch (error) {
      console.error('加载用户模板失败:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // 应用模板 - 直接替换画布
  const applyTemplate = async (template) => {
    try {
      if (!template.json) {
        throw new Error('模板数据无效');
      }

      // 直接替换模式：清空画布再加载模板
      store.clear();
      store.loadJSON(template.json);
      showSuccessMessage(template, '🎨 模板已应用');

      console.log('模板应用成功:', template.name);

    } catch (error) {
      console.error('应用模板失败:', error);
      showErrorMessage('应用模板失败', error.message);
    }
  };

  // 美观的成功消息
  const showSuccessMessage = (template, message) => {
    const dimensions = template.metadata?.dimensions;
    const sizeText = dimensions ? `${dimensions.width} × ${dimensions.height}` : '';
    
    showNotification({
      type: 'success',
      title: message,
      message: `${template.name}${sizeText ? ` (${sizeText})` : ''}`,
      duration: 3000
    });
  };

  // 美观的错误消息
  const showErrorMessage = (title, message) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration: 4000
    });
  };

  // 通用通知组件
  const showNotification = ({ type, title, message, duration = 3000 }) => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 
      'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 
      'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)';
    
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 25000;
      background: ${bgColor}; color: white; padding: 16px 20px;
      border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      max-width: 320px; font-family: system-ui, -apple-system, sans-serif;
      transform: translateX(100%); transition: transform 0.3s ease;
      backdrop-filter: blur(10px);
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="font-size: 16px;">${type === 'success' ? '✓' : '⚠'}</span>
        <strong style="font-size: 14px; font-weight: 600;">${title}</strong>
      </div>
      <div style="font-size: 13px; opacity: 0.95; line-height: 1.4;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  };

  // 同步云端模板
  const syncCloudTemplates = async () => {
    if (!window.puter?.auth?.isSignedIn()) {
      alert('请先登录云端账户');
      return;
    }
    
    setLoading(true);
    try {
      await TemplateManager.syncCloudTemplates();
      await loadTemplates();
      alert('云端模板同步成功！');
    } catch (error) {
      console.error('同步云端模板失败:', error);
      alert(`同步失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 保存当前设计为模板
  const saveCurrentDesignAsTemplate = async () => {
    try {
      // 获取当前设计数据
      const currentJson = store.toJSON();
      
      if (!currentJson.pages || currentJson.pages.length === 0 || 
          !currentJson.pages[0].children || currentJson.pages[0].children.length === 0) {
        alert('画布为空，无法保存为模板');
        return;
      }

      // 显示保存模板对话框
      const templateData = await showSaveTemplateDialog(currentJson);
      if (!templateData) return; // 用户取消

      // 创建模板对象
      const template = {
        id: TemplateManager.generateId(),
        name: templateData.name,
        json: currentJson,
        preview: await generatePreviewImage(),
        thumbnail: await generateThumbnailImage(),
        metadata: {
          dimensions: {
            width: store.width,
            height: store.height
          },
          layerCount: currentJson.pages[0].children.length,
          createdAt: Date.now(),
          category: templateData.category || 'general',
          tags: templateData.tags || []
        }
      };

      // 保存模板
      await TemplateManager.saveTemplate(template);
      
      // 刷新模板列表
      await loadTemplates();
      
      showSuccessMessage(template, '✨ 模板保存成功');
      console.log('当前设计已保存为模板:', template.name);
      
    } catch (error) {
      console.error('保存模板失败:', error);
      showErrorMessage('保存失败', error.message);
    }
  };

  // 生成预览图
  const generatePreviewImage = async () => {
    try {
      const dataURL = store.toDataURL({ pixelRatio: 1 });
      return dataURL;
    } catch (error) {
      console.warn('生成预览图失败:', error);
      return null;
    }
  };

  // 生成缩略图
  const generateThumbnailImage = async () => {
    try {
      const dataURL = store.toDataURL({ pixelRatio: 0.3 });
      return dataURL;
    } catch (error) {
      console.warn('生成缩略图失败:', error);
      return null;
    }
  };

  // 保存模板对话框
  const showSaveTemplateDialog = (currentJson) => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.6); z-index: 20000; display: flex; 
        align-items: center; justify-content: center; backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease-out;
      `;
      
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: white; 
        color: #333; padding: 0; border-radius: 16px; 
        max-width: 480px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        transform: scale(0.9); transition: transform 0.2s ease-out;
        overflow: hidden;
      `;
      
      setTimeout(() => {
        dialog.style.transform = 'scale(1)';
      }, 10);
      
      dialog.innerHTML = `
        <style>
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .save-template-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
          }
          .save-template-body {
            padding: 24px;
            background: white;
          }
          .save-template-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .save-template-subtitle {
            font-size: 14px;
            opacity: 0.9;
            margin: 0;
            font-weight: 400;
          }
          .form-group {
            margin-bottom: 16px;
          }
          .form-label {
            display: block;
            font-weight: 600;
            margin-bottom: 6px;
            color: #333;
            font-size: 14px;
          }
          .form-input {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s ease;
            box-sizing: border-box;
          }
          .form-input:focus {
            outline: none;
            border-color: #667eea;
          }
          .form-textarea {
            min-height: 60px;
            resize: vertical;
          }
          .template-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
          }
          .btn {
            flex: 1;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
          }
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .btn-secondary {
            background: #f5f5f5;
            color: #666;
            border: 1px solid #ddd;
          }
          .btn-secondary:hover {
            background: #eeeeee;
          }
          .design-info {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 13px;
            color: #666;
          }
        </style>
        
        <div class="save-template-header">
          <h3 class="save-template-title">
            <span>💾</span>
            保存为模板
          </h3>
          <p class="save-template-subtitle">将当前设计保存为可复用的模板</p>
        </div>
        
        <div class="save-template-body">
          <div class="design-info">
            <strong>当前设计信息：</strong><br>
            尺寸: ${store.width} × ${store.height}px<br>
            元素数量: ${currentJson.pages[0].children.length} 个
          </div>
          
          <div class="form-group">
            <label class="form-label" for="templateName">模板名称 *</label>
            <input 
              type="text" 
              id="templateName" 
              class="form-input" 
              placeholder="请输入模板名称" 
              value="我的设计 ${new Date().toLocaleDateString()}"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="templateCategory">分类</label>
            <select id="templateCategory" class="form-input">
              <option value="general">通用</option>
              <option value="business">商务</option>
              <option value="creative">创意</option>
              <option value="social">社交媒体</option>
              <option value="print">印刷品</option>
              <option value="presentation">演示文稿</option>
              <option value="other">其他</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="templateTags">标签 (用逗号分隔)</label>
            <input 
              type="text" 
              id="templateTags" 
              class="form-input" 
              placeholder="例如: 海报, 宣传, 红色"
            />
          </div>
          
          <div class="template-actions">
            <button class="btn btn-secondary" data-action="cancel">
              取消
            </button>
            <button class="btn btn-primary" data-action="save">
              保存模板
            </button>
          </div>
        </div>
      `;
      
      modal.appendChild(dialog);
      document.body.appendChild(modal);
      
      // 聚焦到名称输入框
      setTimeout(() => {
        const nameInput = dialog.querySelector('#templateName');
        nameInput.focus();
        nameInput.select();
      }, 100);
      
      const cleanup = () => {
        modal.style.opacity = '0';
        dialog.style.transform = 'scale(0.9)';
        setTimeout(() => {
          if (document.body.contains(modal)) {
            document.body.removeChild(modal);
          }
        }, 200);
      };
      
      // 绑定事件
      dialog.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'save') {
          const nameInput = dialog.querySelector('#templateName');
          const categorySelect = dialog.querySelector('#templateCategory');
          const tagsInput = dialog.querySelector('#templateTags');
          
          const name = nameInput.value.trim();
          if (!name) {
            nameInput.focus();
            nameInput.style.borderColor = '#e74c3c';
            return;
          }
          
          const tags = tagsInput.value.trim()
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
          
          cleanup();
          resolve({
            name,
            category: categorySelect.value,
            tags
          });
        } else if (action === 'cancel') {
          cleanup();
          resolve(null);
        }
      });
      
      // ESC键取消
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          cleanup();
          resolve(null);
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          cleanup();
          resolve(null);
        }
      });
    });
  };

  // 删除模板回调
  const handleTemplateDelete = (templateId) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    setStats(prev => ({ ...prev, total: prev.total - 1 }));
  };

  // 模板更新回调
  const handleTemplateUpdate = () => {
    loadTemplates(); // 重新加载所有模板
  };

  // 过滤模板
  const filteredTemplates = React.useMemo(() => {
    let filtered = templates;
    
    // 按搜索查询过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        (template.metadata?.tags || []).some(tag => 
          tag.toLowerCase().includes(query)
        ) ||
        (template.metadata?.category || '').toLowerCase().includes(query)
      );
    }
    
    // 按分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => 
        template.metadata?.category === selectedCategory
      );
    }
    
    return filtered;
  }, [templates, searchQuery, selectedCategory]);

  // 获取所有分类
  const categories = React.useMemo(() => {
    const cats = [...new Set(templates.map(t => t.metadata?.category || 'general'))];
    return ['all', ...cats.sort()];
  }, [templates]);

  // 组件挂载时加载模板
  React.useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部操作栏 */}
      <div style={{ padding: '10px', borderBottom: '1px solid #e1e8ed' }}>
        {/* 主要操作按钮 */}
        <div style={{ marginBottom: '10px' }}>
          <Button
            icon="floppy-disk"
            intent="primary"
            onClick={saveCurrentDesignAsTemplate}
            style={{ width: '100%', marginBottom: '8px' }}
          >
            保存当前设计为模板
          </Button>
        </div>

        {/* 统计信息 */}
        <div style={{ 
          fontSize: '12px', 
          color: '#5c7080', 
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            共 {stats.total} 个模板 
            {window.puter?.auth?.isSignedIn() && `（本地: ${stats.local}）`}
          </span>
          
          {window.puter?.auth?.isSignedIn() && (
            <Button
              icon="refresh"
              minimal
              small
              onClick={syncCloudTemplates}
              loading={isLoading}
              title="同步云端模板"
            >
              同步
            </Button>
          )}
        </div>
        
        {/* 搜索框 */}
        <input
          type="text"
          placeholder="搜索模板..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d9e0',
            borderRadius: '4px',
            marginBottom: '10px'
          }}
        />
        
        {/* 分类筛选 */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            border: '1px solid #d1d9e0',
            borderRadius: '4px'
          }}
        >
          <option value="all">所有分类</option>
          {categories.filter(cat => cat !== 'all').map(category => (
            <option key={category} value={category}>
              {category === 'general' ? '通用' : category}
            </option>
          ))}
        </select>
      </div>

      {/* 模板列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px' 
          }}>
            <Spinner size={30} />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#5c7080'
          }}>
            <Icon icon="folder-open" size={40} style={{ marginBottom: '10px' }} />
            <div>
              {templates.length === 0 
                ? '还没有保存的模板\n上传PSD文件时选择"保存为模板"来创建模板'
                : '没有找到匹配的模板\n尝试调整搜索条件'
              }
            </div>
          </div>
        ) : (
          <ImagesGrid
            images={filteredTemplates}
            getPreview={(template) => template.preview || template.thumbnail}
            getImageSize={() => ({ width: 200, height: 140 })}
            isLoading={isLoading}
            onSelect={applyTemplate}
            ItemComponent={(props) => (
              <TemplateItem {...props} onDelete={handleTemplateDelete} onUpdate={handleTemplateUpdate} />
            )}
          />
        )}
      </div>
    </div>
  );
});

// 导出Section配置
export const UserTemplatesSection = {
  name: 'user-templates',
  Tab: (props) => (
    <SectionTab name="用户模板" {...props}>
      <Icon icon="folder-shared" />
    </SectionTab>
  ),
  Panel: UserTemplatesPanel,
};