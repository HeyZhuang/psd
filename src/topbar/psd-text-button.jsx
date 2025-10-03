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

  // 测试编辑器
  const testEditor = () => {
    // 创建一个测试文字元素
    const testElement = {
      type: 'text',
      text: '测试PSD文字编辑',
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      custom: {
        fromPSD: true,
        fromTextLayer: true,
        originalText: '测试PSD文字编辑',
        rasterized: false,
        psdTextLayer: true
      },
      set: function(props) {
        Object.assign(this, props);
        console.log('测试元素已更新:', props);
      }
    };
    
    psdTextManager.openTextEditor(testElement);
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
          
          <MenuDivider />
          
          <MenuItem
            icon="code"
            text="测试编辑器"
            onClick={testEditor}
          />
        </>
      )}
      
      {psdTextElements.length === 0 && (
        <>
          <MenuItem
            icon="info-sign"
            text="没有找到PSD文字"
            disabled
          />
          
          <MenuDivider />
          
          <MenuItem
            icon="code"
            text="测试编辑器"
            onClick={testEditor}
          />
        </>
      )}
    </Menu>
  );

  // 总是显示按钮，至少可以测试编辑器
  // if (psdTextElements.length === 0 && !selectedTextElement) {
  //   return null; 
  // }

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