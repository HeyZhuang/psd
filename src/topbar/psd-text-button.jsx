import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, ButtonGroup, Popover, Menu, MenuItem, MenuDivider } from '@blueprintjs/core';
import { psdTextManager } from '../utils/PSDTextManager';

export const PSDTextButton = observer(({ store }) => {
  const [isMenuOpen, setMenuOpen] = React.useState(false);

  // 获取所有PSD文字元素
  const psdTextElements = React.useMemo(() => {
    if (!store || !store.pages) return [];
    
    const allElements = [];
    store.pages.forEach(page => {
      page.children.forEach(element => {
        if (element.type === 'text' && 
            (element.custom?.fromPSD || element.custom?.fromTextLayer)) {
          allElements.push(element);
        }
      });
    });
    
    return allElements;
  }, [store]);

  const hasSelectedTextElement = () => {
    const selectedElement = store.selectedElements[0];
    return selectedElement && 
           selectedElement.type === 'text' && 
           (selectedElement.custom?.fromPSD || selectedElement.custom?.fromTextLayer);
  };

  const selectedTextElement = hasSelectedTextElement() ? store.selectedElements[0] : null;

  // 编辑选中的文字元素
  const editSelectedText = () => {
    if (selectedTextElement) {
      psdTextManager.openTextEditor(selectedTextElement);
    }
  };

  // 快速编辑第一个文字元素
  const editFirstText = () => {
    if (psdTextElements.length > 0) {
      psdTextManager.openTextEditor(psdTextElements[0]);
    }
  };

  // 批量编辑所有PSD文字
  const batchEditText = () => {
    psdTextManager.batchEditPSDText();
  };

  // 导出文字信息
  const exportTextInfo = () => {
    psdTextManager.exportPSDTextInfo();
  };

  // 菜单内容
  const menuContent = (
    <Menu>
      {selectedTextElement && (
        <>
          <MenuItem
            icon="edit"
            text={`编辑选中文字`}
            onClick={editSelectedText}
          />
          <MenuDivider />
        </>
      )}
      
      {psdTextElements.length > 0 && (
        <>
          <MenuItem
            icon="text-highlight"
            text={`编辑第一个文字`}
            onClick={editFirstText}
          />
          
          <MenuItem
            icon="multi-select"
            text={`批量编辑 (${psdTextElements.length}个)`}
            onClick={batchEditText}
          />
          
          <MenuDivider />
          
          <MenuItem
            icon="download"
            text="导出文字信息"
            onClick={exportTextInfo}
          />
        </>
      )}
      
      {psdTextElements.length === 0 && (
        <MenuItem
          icon="info-sign"
          text="没有找到PSD文字"
          disabled
        />
      )}
    </Menu>
  );

  if (psdTextElements.length === 0 && !selectedTextElement) {
    return null; // 没有PSD文字时不显示按钮
  }

  return (
    <Popover
      content={menuContent}
      position="bottom"
      isOpen={isMenuOpen}
      onInteraction={(nextOpenState) => setMenuOpen(nextOpenState)}
    >
      <Button
        icon="text-highlight"
        minimal
        title="PSD文字编辑"
        intent={selectedTextElement ? "primary" : undefined}
        style={{
          position: 'relative'
        }}
      >
        PSD文字
        {psdTextElements.length > 0 && (
          <span 
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#007bff',
              color: 'white',
              borderRadius: '10px',
              fontSize: '10px',
              padding: '1px 5px',
              minWidth: '16px',
              textAlign: 'center',
              lineHeight: '14px'
            }}
          >
            {psdTextElements.length}
          </span>
        )}
      </Button>
    </Popover>
  );
});

export default PSDTextButton;