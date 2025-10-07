import React from 'react';
import { observer } from 'mobx-react-lite';
import { getCustomFonts } from '../utils/my-fonts-manager';

/**
 * 自定义字体选择器 - 只显示"我的字体"中的字体
 */
export const CustomFontSelector = observer(({ store }) => {
  const [customFonts, setCustomFonts] = React.useState([]);
  const selectedElements = store.selectedElements;
  const selectedElement = selectedElements[0];

  // 加载自定义字体列表
  React.useEffect(() => {
    const fonts = getCustomFonts();
    setCustomFonts(fonts);
    console.log('🎨 CustomFontSelector: 加载了', fonts.length, '个自定义字体');
  }, []);

  // 监听 store.fonts 变化（当有新字体添加时）
  React.useEffect(() => {
    const fonts = getCustomFonts();
    setCustomFonts(fonts);
  }, [store.fonts?.length]);

  // 获取当前选中元素的字体
  const currentFont = selectedElement?.type === 'text'
    ? selectedElement.fontFamily
    : '';

  // 处理字体变更
  const handleFontChange = (e) => {
    const newFont = e.target.value;
    if (selectedElement && selectedElement.type === 'text') {
      selectedElement.set({ fontFamily: newFont });
      console.log('✅ 字体已更改为:', newFont);
    }
  };

  // 如果没有选中文字元素，不显示选择器
  if (!selectedElement || selectedElement.type !== 'text') {
    return null;
  }

  // 如果没有自定义字体，显示提示
  if (customFonts.length === 0) {
    return (
      <div style={{
        padding: '8px 12px',
        fontSize: '12px',
        color: '#999',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        margin: '0 8px',
      }}>
        暂无自定义字体，请先在"我的字体"中添加
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0 8px',
    }}>
      <label style={{
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
        whiteSpace: 'nowrap',
      }}>
        字体:
      </label>
      <select
        value={currentFont}
        onChange={handleFontChange}
        style={{
          padding: '6px 32px 6px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#000000',
          backgroundColor: '#ffffff',
          border: '2px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          outline: 'none',
          minWidth: '180px',
          maxWidth: '250px',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#1764EA';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(23, 100, 234, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#1764EA';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(23, 100, 234, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {customFonts.map((font) => (
          <option
            key={font.id}
            value={font.family}
            style={{
              fontFamily: font.family,
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {font.name}
          </option>
        ))}
      </select>
      <div style={{
        fontSize: '11px',
        color: '#6b7280',
        whiteSpace: 'nowrap',
      }}>
        ({customFonts.length} 个字体)
      </div>
    </div>
  );
});
