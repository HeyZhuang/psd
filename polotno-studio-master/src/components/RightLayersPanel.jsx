import React from 'react';
import { observer } from 'mobx-react-lite';
import { LayersSection } from '../sections/layers-section';
import styled from 'polotno/utils/styled';

const PanelContainer = styled('div')`
  position: fixed;
  right: 0;
  top: 56px;
  bottom: 0;
  background: var(--layer-panel-bg, #ffffff);
  border-left: 1px solid var(--layer-panel-border, #e5e5e5);
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.06);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: var(--z-sticky, 1020);
`;

const PanelHeader = styled('div')`
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary, #e5e5e5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-primary, #ffffff);
  min-height: 56px;
`;

const PanelTitle = styled('h3')`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #212121);
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const ToggleButton = styled('button')`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-md, 6px);
  transition: background 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #757575);

  &:hover {
    background: var(--state-hover-bg, #f5f5f5);
    color: var(--text-primary, #212121);
  }

  &:active {
    background: var(--state-active-bg, #eeeeee);
  }
`;

const CollapsedLabel = styled('div')`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #757575);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 200ms ease;

  &:hover {
    color: var(--text-primary, #212121);
  }
`;

const PanelContent = styled('div')`
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: var(--bg-secondary, #fafafa);

  /* Modern scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--neutral-300, #e0e0e0);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--neutral-400, #bdbdbd);
  }
`;

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
    <PanelContainer
      ref={panelRef}
      style={{
        width: isOpen ? '280px' : '48px',
        minWidth: isOpen ? '280px' : '48px',
        maxWidth: isOpen ? '280px' : '48px',
        alignItems: isOpen ? 'stretch' : 'center',
        justifyContent: isOpen ? 'flex-start' : 'center',
        cursor: isOpen ? 'default' : 'pointer',
      }}
      onClick={isOpen ? undefined : onToggle}
    >
      {!isOpen ? (
        <CollapsedLabel>LAYERS</CollapsedLabel>
      ) : (
        <>
          <PanelHeader>
            <PanelTitle>Layers</PanelTitle>
            <ToggleButton onClick={onToggle} aria-label="Toggle layers panel">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 10L10 5L5 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="rotate(90 10 10)"
                />
              </svg>
            </ToggleButton>
          </PanelHeader>

          <PanelContent className="right-layers-panel">
            <LayersSection.Panel store={store} />
          </PanelContent>
        </>
      )}
    </PanelContainer>
  );
});
