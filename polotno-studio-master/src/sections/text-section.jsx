import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Spinner } from '@blueprintjs/core';
import FaFont from '@meronex/icons/fa/FaFont';

// 预设文字模板
const TEXT_TEMPLATES = [
  {
    text: '粗体文字',
    fontSize: 42,
    fontWeight: 'bold',
    fill: '#1764EA',
    fontFamily: 'Arial',
  },
  {
    text: '斜体文字',
    fontSize: 38,
    fontWeight: 'normal',
    fontStyle: 'italic',
    fill: '#374151',
    fontFamily: 'Georgia',
  },
  {
    text: '彩色标题',
    fontSize: 56,
    fontWeight: 'bold',
    fill: '#ef4444',
    fontFamily: 'Roboto',
  },
  {
    text: '描边文字',
    fontSize: 48,
    fontWeight: 'bold',
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    fontFamily: 'Arial',
  },
  {
    text: '阴影文字',
    fontSize: 44,
    fontWeight: 'bold',
    fill: '#1f2937',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowBlur: 10,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    fontFamily: 'Roboto',
  },
  {
    text: '渐变效果',
    fontSize: 52,
    fontWeight: 'bold',
    fill: '#8b5cf6',
    fontFamily: 'Arial',
  },
  {
    text: '居中对齐',
    fontSize: 40,
    fontWeight: '500',
    fill: '#059669',
    align: 'center',
    fontFamily: 'Roboto',
  },
];

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

  const handleTemplateClick = (template) => {
    const x = store.width / 2;
    const y = store.height / 2;

    // 添加模板文字到画布
    store.activePage?.addElement({
      type: 'text',
      x,
      y,
      ...template,
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 添加文字按钮 */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
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

      {/* 文字模板列表 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#374151'
        }}>
          文字模板 ({TEXT_TEMPLATES.length})
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '12px'
        }}>
          {TEXT_TEMPLATES.map((template, index) => (
            <div
              key={index}
              onClick={() => handleTemplateClick(template)}
              style={{
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1764EA';
                e.currentTarget.style.backgroundColor = '#f0f4ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(23, 100, 234, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontFamily: template.fontFamily || 'Roboto',
                fontSize: Math.min(template.fontSize / 2 || 24, 28) + 'px',
                fontWeight: template.fontWeight || 'normal',
                fontStyle: template.fontStyle || 'normal',
                color: template.fill || '#000000',
                textAlign: 'center',
                textDecoration: template.textDecoration || 'none',
                letterSpacing: template.letterSpacing ? template.letterSpacing + 'px' : 'normal',
                lineHeight: 1.4,
                wordBreak: 'break-word',
                WebkitTextStroke: template.stroke ? `${template.strokeWidth || 1}px ${template.stroke}` : 'none',
                textShadow: template.shadowColor
                  ? `${template.shadowOffsetX || 0}px ${template.shadowOffsetY || 0}px ${template.shadowBlur || 0}px ${template.shadowColor}`
                  : 'none'
              }}>
                {template.text || '示例文字'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 提示信息 */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#f0f9ff',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: '12px', color: '#1e40af', lineHeight: '1.5' }}>
          💡 点击模板添加到画布中央，双击文字可编辑内容
        </div>
      </div>
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
