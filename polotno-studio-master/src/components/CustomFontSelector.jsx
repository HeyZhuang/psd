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
    <select
      value={currentFont}
      onChange={handleFontChange}
      className="polotno-toolbar-select custom-font-select"
      style={{
        padding: '6px 28px 6px 10px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#000000',
        backgroundColor: '#ffffff',
        border: '2px solid #cccccc',
        borderRadius: '4px',
        cursor: 'pointer',
        outline: 'none',
        minWidth: '140px',
        maxWidth: '200px',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23000000' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        transition: 'all 0.15s ease',
        height: '32px',
        lineHeight: '1',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#1764EA';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#cccccc';
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#1764EA';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(23, 100, 234, 0.1)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#cccccc';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {customFonts.map((font) => (
        <option
          key={font.id}
          value={font.family}
          style={{
            fontFamily: font.family,
            padding: '8px',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          {font.name}
        </option>
      ))}
    </select>
  );
});
