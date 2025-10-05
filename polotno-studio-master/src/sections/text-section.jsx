import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { t } from 'polotno/utils/l10n';
import FaFont from '@meronex/icons/fa/FaFont';

// 自定义文字面板 - 移除默认的预设按钮，只保留简单的添加文字功能
export const TextPanel = observer(({ store }) => {
  const handleAddText = () => {
    const x = store.width / 2;
    const y = store.height / 2;
    store.activePage?.addElement({
      type: 'text',
      x,
      y,
      fill: 'black',
      fontSize: 48,
      fontFamily: 'Roboto',
      text: '点击编辑文字',
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        marginBottom: '20px',
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.6'
      }}>
        点击下方按钮在画布中添加文字，或直接双击画布中的文字进行编辑。
      </div>

      <button
        onClick={handleAddText}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#ffffff',
          border: '1px solid #d5d5d5',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333333',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f8f8';
          e.currentTarget.style.borderColor = '#1764EA';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#d5d5d5';
        }}
      >
        添加文字
      </button>
    </div>
  );
});

export const CustomTextSection = {
  name: 'text',
  Tab: (props) => (
    <SectionTab name="文字" {...props}>
      <FaFont />
    </SectionTab>
  ),
  Panel: TextPanel,
};
