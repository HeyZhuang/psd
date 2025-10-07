import React from 'react';
import { observer } from 'mobx-react-lite';
import { Spinner, Icon } from '@blueprintjs/core';
import { SectionTab } from 'polotno/side-panel';

// 使用 IndexedDB 存储大数据
const DB_NAME = 'PolotnoTemplates';
const DB_VERSION = 1;
const STORE_NAME = 'templates';

// 初始化 IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// 获取所有模板
const getTemplates = async () => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const templates = request.result || [];
        // 按创建时间倒序排列
        templates.sort((a, b) => b.createdAt - a.createdAt);
        resolve(templates);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('读取模板失败:', error);
    return [];
  }
};

// 保存单个模板
const saveTemplate = async (template) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.put(template);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('保存模板失败:', error);
    return false;
  }
};

// 删除模板
const deleteTemplate = async (templateId) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(templateId);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('删除模板失败:', error);
    return false;
  }
};

// 更新模板
const updateTemplate = async (templateId, updates) => {
  try {
    const db = await initDB();
    const templates = await getTemplates();
    const template = templates.find((t) => t.id === templateId);

    if (!template) return false;

    const updatedTemplate = { ...template, ...updates };
    return await saveTemplate(updatedTemplate);
  } catch (error) {
    console.error('更新模板失败:', error);
    return false;
  }
};

// 生成唯一ID
const generateId = () => {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 模板项组件
const TemplateItem = observer(({ template, onClick, onDelete, onRename }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(template.name);

  const handleSaveRename = () => {
    if (newName.trim()) {
      onRename(template.id, newName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: '16px',
        borderRadius: '12px',
        border: '2px solid #e1e8ed',
        backgroundColor: '#fff',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#667eea';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#e1e8ed';
      }}
    >
      {/* 预览图 */}
      <div
        onClick={() => !isEditing && onClick(template)}
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '180px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <img
          src={template.preview}
          alt={template.name}
          style={{
            maxWidth: '100%',
            maxHeight: '160px',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
          }}
        />

        {/* 操作按钮 */}
        <div
          className="template-actions"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px',
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            title="重命名"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.95)',
              color: '#667eea',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
              e.currentTarget.style.color = '#667eea';
            }}
          >
            ✏️
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`确定要删除模板 "${template.name}" 吗？`)) {
                onDelete(template.id);
              }
            }}
            title="删除"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.95)',
              color: '#dc3545',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc3545';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
              e.currentTarget.style.color = '#dc3545';
            }}
          >
            🗑
          </button>
        </div>

        <style>{`
          .template-actions {
            opacity: 0 !important;
          }
          div:hover > .template-actions {
            opacity: 1 !important;
          }
        `}</style>
      </div>

      {/* 模板信息 */}
      <div style={{ padding: '12px 16px' }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename();
                if (e.key === 'Escape') {
                  setNewName(template.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              style={{
                width: '100%',
                border: '2px solid #667eea',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '600',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveRename();
                }}
                style={{
                  flex: 1,
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ✓ 保存
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewName(template.name);
                  setIsEditing(false);
                }}
                style={{
                  flex: 1,
                  background: '#f0f0f0',
                  color: '#666',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                × 取消
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#1a1a1a',
                marginBottom: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {template.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div
                style={{
                  fontSize: '12px',
                  color: '#666',
                  background: '#f5f5f5',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                📐 {template.width} × {template.height}
              </div>
              {template.elementCount > 0 && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    background: '#f5f5f5',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  📚 {template.elementCount} 个元素
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

// 获取存储使用情况（IndexedDB）
const getStorageInfo = async () => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const usageInMB = (usage / (1024 * 1024)).toFixed(2);
      const quotaInMB = (quota / (1024 * 1024)).toFixed(0);
      const percentUsed = quota > 0 ? ((usage / quota) * 100).toFixed(1) : 0;

      return {
        usage,
        quota,
        displaySize: `${usageInMB} MB / ${quotaInMB} MB`,
        percentUsed: `${percentUsed}%`,
      };
    }
    return { displaySize: 'N/A', percentUsed: '0%' };
  } catch (error) {
    return { displaySize: 'N/A', percentUsed: '0%' };
  }
};

// 我的模板面板
export const MyTemplatesPanel = observer(({ store }) => {
  const [templates, setTemplates] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // 加载模板
  const loadTemplates = async () => {
    const savedTemplates = await getTemplates();
    setTemplates(savedTemplates);
  };

  // 保存当前设计为模板
  const saveCurrentAsTemplate = async () => {
    try {
      setIsLoading(true);

      const currentJson = store.toJSON();
      const activePage = store.activePage;

      if (!activePage || !activePage.children || activePage.children.length === 0) {
        alert('画布为空，无法保存为模板');
        return;
      }

      // 获取画布尺寸
      const width = store.width;
      const height = store.height;

      // 生成预览图（白色背景）
      const preview = await generatePreview(store);

      // 创建模板 - 使用 IndexedDB 可以保存完整数据
      const template = {
        id: generateId(),
        name: `模板 ${new Date().toLocaleString('zh-CN')}`,
        json: currentJson,
        preview: preview,
        width: width,
        height: height,
        elementCount: activePage.children.length,
        createdAt: Date.now(),
      };

      // 保存到 IndexedDB
      const saved = await saveTemplate(template);

      if (saved) {
        // 重新加载模板列表
        await loadTemplates();
        showNotification('✅ 模板保存成功', template.name);

        // 检查模板数量，如果超过50个，删除最旧的
        const allTemplates = await getTemplates();
        if (allTemplates.length > 50) {
          const oldestTemplate = allTemplates[allTemplates.length - 1];
          await deleteTemplate(oldestTemplate.id);
          console.log('已自动删除最旧的模板');
        }
      } else {
        alert('保存失败：无法保存模板数据。');
      }
    } catch (error) {
      console.error('保存模板失败:', error);
      alert('保存模板失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 生成预览图（白色背景，保持比例，优化压缩）
  const generatePreview = async (store) => {
    try {
      // 创建临时canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 设置canvas尺寸（最大300px宽度，保持比例 - 减小尺寸以节省空间）
      const maxWidth = 300;
      const width = store.width;
      const height = store.height;
      const scale = Math.min(maxWidth / width, 1);

      canvas.width = width * scale;
      canvas.height = height * scale;

      // 填充白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 获取Polotno的导出图（使用更小的像素比）
      const dataURL = await store.toDataURL({ pixelRatio: scale * 0.5 });

      // 加载图片
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataURL;
      });

      // 绘制到白色背景上
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 使用JPEG格式和中等质量以减小文件大小
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch (error) {
      console.warn('生成预览图失败:', error);
      // 降级方案：使用更小的像素比
      return await store.toDataURL({ pixelRatio: 0.2, mimeType: 'image/jpeg' });
    }
  };

  // 应用模板
  const applyTemplate = (template) => {
    try {
      if (!template.json) {
        alert('模板数据无效');
        return;
      }

      // 清空画布并加载模板
      store.clear();
      store.loadJSON(template.json);

      showNotification('🎨 模板已应用', template.name);
    } catch (error) {
      console.error('应用模板失败:', error);
      alert('应用模板失败: ' + error.message);
    }
  };

  // 删除模板回调
  const handleDeleteTemplate = async (templateId) => {
    const success = await deleteTemplate(templateId);
    if (success) {
      await loadTemplates();
    }
  };

  // 重命名模板回调
  const handleRenameTemplate = async (templateId, newName) => {
    const success = await updateTemplate(templateId, { name: newName });
    if (success) {
      await loadTemplates();
    }
  };

  // 显示通知
  const showNotification = (title, message) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 25000;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      max-width: 320px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.innerHTML = `
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 13px; opacity: 0.95;">${message}</div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  // 组件挂载时加载模板
  React.useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fafbfc' }}>
      {/* 顶部操作栏 */}
      <div
        style={{
          padding: '16px',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
          borderBottom: '2px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <button
          onClick={saveCurrentAsTemplate}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
          }}
        >
          {isLoading ? (
            <>
              <Spinner size={16} />
              <span>保存中...</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '16px' }}>💾</span>
              <span>保存当前设计为模板</span>
            </>
          )}
        </button>
      </div>

      {/* 模板列表 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          scrollbarWidth: 'thin',
        }}
      >
        {templates.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#5c7080',
            }}
          >
            <Icon icon="folder-open" size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <div style={{ fontSize: '14px' }}>
              还没有保存的模板
              <br />
              点击上方按钮保存当前设计
            </div>
          </div>
        ) : (
          templates.map((template) => (
            <TemplateItem
              key={template.id}
              template={template}
              onClick={applyTemplate}
              onDelete={handleDeleteTemplate}
              onRename={handleRenameTemplate}
            />
          ))
        )}
      </div>
    </div>
  );
});

// 导出Section配置
export const MyTemplatesSection = {
  name: 'my-templates',
  Tab: (props) => (
    <SectionTab name="我的模板" {...props}>
      <Icon icon="bookmark" />
    </SectionTab>
  ),
  Panel: MyTemplatesPanel,
};
