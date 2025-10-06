import React from 'react';
import { observer } from 'mobx-react-lite';
import { LayersSection } from '../sections/layers-section';

export const RightLayersPanel = observer(({ store, isOpen, onToggle }) => {
  const panelRef = React.useRef(null);

  // 监听面板宽度变化，确保画布能够正确响应
  React.useEffect(() => {
    if (panelRef.current) {
      // 使用 ResizeObserver 监听面板大小变化
      const resizeObserver = new ResizeObserver(() => {
        // 触发全局 resize 事件
        window.dispatchEvent(new Event('resize'));
      });

      resizeObserver.observe(panelRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        right: 0,
        top: '50px',
        bottom: 0,
        width: isOpen ? '320px' : '50px',
        minWidth: isOpen ? '320px' : '50px',
        maxWidth: isOpen ? '320px' : '50px',
        background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
        borderLeft: '1px solid #e5e5e5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOpen ? 'stretch' : 'center',
        justifyContent: isOpen ? 'flex-start' : 'center',
        cursor: isOpen ? 'default' : 'pointer',
        zIndex: 10,
        boxShadow: isOpen ? '-2px 0 12px rgba(0, 0, 0, 0.08)' : '-2px 0 8px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'width',
      }}
      onClick={isOpen ? undefined : onToggle}
    >
      {!isOpen ? (
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: '13px',
            fontWeight: 600,
            color: '#333333',
            letterSpacing: '0.05em',
          }}
        >
          LAYERS
        </div>
      ) : (
        <>
          {/* 头部 */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: '#333333',
                letterSpacing: '0.02em',
              }}
            >
              Layers
            </h3>
            <button
              onClick={onToggle}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 10L10 5L5 10"
                  stroke="#333333"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(90 10 10)"
                />
              </svg>
            </button>
          </div>

          {/* 图层内容 */}
          <div
            className="right-layers-panel"
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px',
            }}
          >
            <LayersSection.Panel store={store} />
          </div>
        </>
      )}
    </div>
  );
});
