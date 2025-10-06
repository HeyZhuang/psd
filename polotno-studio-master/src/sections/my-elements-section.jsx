import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import {
  getMyElements,
  deleteElement,
  clearAllElements,
  addElementToCanvas,
  myElementsEvents,
} from '../utils/my-elements-manager';

// 图标
const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
  </svg>
);

// 我的元素面板
const MyElementsPanel = observer(({ store }) => {
  const [elements, setElements] = React.useState([]);
  const [selectedElement, setSelectedElement] = React.useState(null);

  // 加载元素
  const loadElements = React.useCallback(() => {
    const myElements = getMyElements();
    setElements(myElements);
  }, []);

  React.useEffect(() => {
    loadElements();

    // 订阅元素更新事件
    const unsubscribe = myElementsEvents.subscribe(() => {
      console.log('📢 我的元素库已更新，重新加载...');
      loadElements();
    });

    // 清理订阅
    return unsubscribe;
  }, [loadElements]);

  // 删除元素
  const handleDelete = (elementId, e) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个元素吗?')) {
      deleteElement(elementId);
      // 不需要手动调用 loadElements，事件会自动触发
      if (selectedElement?.id === elementId) {
        setSelectedElement(null);
      }
    }
  };

  // 清空所有
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有保存的元素吗? 此操作不可恢复!')) {
      clearAllElements();
      // 不需要手动调用 loadElements，事件会自动触发
      setSelectedElement(null);
    }
  };

  // 添加到画布
  const handleAddToCanvas = (elementData) => {
    addElementToCanvas(elementData, store);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部操作栏 */}
      <div style={{ padding: '15px', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>我的元素</h3>
          <Button
            small
            intent="danger"
            minimal
            onClick={handleClearAll}
            disabled={elements.length === 0}
          >
            清空
          </Button>
        </div>
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: '#666',
          lineHeight: '1.4'
        }}>
          在画布中右键点击元素,选择"保存到我的元素"
        </p>
      </div>

      {/* 元素列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',  // 只允许垂直滚动
        overflowX: 'hidden', // 禁止水平滚动
        padding: '8px', // 减小内边距，留更多空间给元素
        // 隐藏滚动条但保持滚动功能
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
      }}>
        {/* 隐藏滚动条 - Webkit浏览器 */}
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {elements.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: '#999',
            textAlign: 'center',
            padding: '20px'
          }}>
            <StarIcon />
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
              还没有保存的元素
            </p>
            <p style={{ fontSize: '12px', marginTop: '5px' }}>
              右键点击画布中的元素保存
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px', // 减小间隙，确保两个元素完整显示
            width: '100%',
            maxWidth: '100%', // 防止内容超出容器
            boxSizing: 'border-box'
          }}>
            {elements.map((element) => (
              <div
                key={element.id}
                style={{
                  position: 'relative',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: '#fff',
                  width: '100%', // 明确设置宽度为100%
                  minWidth: 0, // 允许收缩以适应容器
                  boxSizing: 'border-box'
                }}
                onClick={() => handleAddToCanvas(element)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1764EA';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(23, 100, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* 预览图 - 缩小尺寸 */}
                <div style={{
                  width: '100%',
                  paddingTop: '70%', // 调整为70%，使卡片更紧凑
                  position: 'relative',
                  backgroundColor: '#f5f5f5'
                }}>
                  {element.preview && (
                    <img
                      src={element.preview}
                      alt={element.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '4px' // 添加内边距
                      }}
                    />
                  )}
                </div>

                {/* 元素信息 - 精简布局 */}
                <div style={{
                  padding: '5px 6px',
                  fontSize: '10px',
                  borderTop: '1px solid #e5e5e5',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.3',
                    width: '100%' // 确保文字容器宽度正确
                  }}>
                    {element.name}
                  </div>
                </div>

                {/* 删除按钮 - 缩小尺寸 */}
                <button
                  onClick={(e) => handleDelete(element.id, e)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#ff4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ff4444';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.color = '#ff4444';
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      {elements.length > 0 && (
        <div style={{
          padding: '10px 15px',
          borderTop: '1px solid #e5e5e5',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          共保存 {elements.length} 个元素
        </div>
      )}
    </div>
  );
});

// 定义 Section
export const MyElementsSection = {
  name: 'my-elements',
  Tab: (props) => (
    <SectionTab name="我的元素" {...props}>
      <StarIcon />
    </SectionTab>
  ),
  Panel: MyElementsPanel,
};
