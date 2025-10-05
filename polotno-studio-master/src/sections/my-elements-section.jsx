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
  }, [loadElements]);

  // 删除元素
  const handleDelete = (elementId, e) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个元素吗?')) {
      deleteElement(elementId);
      loadElements();
      if (selectedElement?.id === elementId) {
        setSelectedElement(null);
      }
    }
  };

  // 清空所有
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有保存的元素吗? 此操作不可恢复!')) {
      clearAllElements();
      loadElements();
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
      <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
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
            gap: '10px'
          }}>
            {elements.map((element) => (
              <div
                key={element.id}
                style={{
                  position: 'relative',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: '#fff'
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
                {/* 预览图 */}
                <div style={{
                  width: '100%',
                  paddingTop: '100%',
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
                        objectFit: 'contain'
                      }}
                    />
                  )}
                </div>

                {/* 元素信息 */}
                <div style={{
                  padding: '8px',
                  fontSize: '12px',
                  borderTop: '1px solid #e5e5e5'
                }}>
                  <div style={{
                    fontWeight: 500,
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {element.name}
                  </div>
                  <div style={{ color: '#999', fontSize: '11px' }}>
                    {element.type}
                  </div>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={(e) => handleDelete(element.id, e)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#ff4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
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
