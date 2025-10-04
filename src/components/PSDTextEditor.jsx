import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, ButtonGroup, Card, InputGroup, FormGroup, HTMLSelect, NumericInput, Slider, Checkbox } from '@blueprintjs/core';

// PSD文字编辑器组件
export const PSDTextEditor = observer(({ element, store, onClose }) => {
  const [text, setText] = React.useState(element.text || '');
  const [fontSize, setFontSize] = React.useState(element.fontSize || 16);
  const [fontFamily, setFontFamily] = React.useState(element.fontFamily || 'Arial');
  const [fontWeight, setFontWeight] = React.useState(element.fontWeight || 'normal');
  const [fontStyle, setFontStyle] = React.useState(element.fontStyle || 'normal');
  const [fill, setFill] = React.useState(element.fill || '#000000');
  const [align, setAlign] = React.useState(element.align || 'left');
  const [lineHeight, setLineHeight] = React.useState(element.lineHeight || 1.2);
  const [letterSpacing, setLetterSpacing] = React.useState(element.letterSpacing || 0);

  // 检查是否为PSD导入的文字元素
  const isPSDText = element.custom?.fromPSD || element.custom?.fromTextLayer;
  const originalText = element.custom?.originalText;

  // 常用字体列表
  const commonFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Georgia', 'Verdana',
    'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Courier New',
    'Microsoft YaHei', '微软雅黑', 'SimSun', '宋体', 'SimHei', '黑体',
    'KaiTi', '楷体', 'FangSong', '仿宋', 'PingFang SC', 'Hiragino Sans GB'
  ];

  // 应用修改
  const applyChanges = () => {
    element.set({
      text,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      fill,
      align,
      lineHeight,
      letterSpacing
    });

    // 保存编辑历史
    if (isPSDText) {
      element.custom = {
        ...element.custom,
        editHistory: [
          ...(element.custom?.editHistory || []),
          {
            timestamp: Date.now(),
            originalText: originalText || text,
            editedText: text
          }
        ]
      };
    }

    console.log('文字编辑已应用:', { text, fontSize, fontFamily });
  };

  // 重置为原始文字
  const resetToOriginal = () => {
    if (originalText) {
      setText(originalText);
    }
  };

  // 实时预览
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyChanges();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [text, fontSize, fontFamily, fontWeight, fontStyle, fill, align, lineHeight, letterSpacing]);

  return (
    <div style={{ 
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 20000,
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90%',
      overflow: 'auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* 标题栏 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e1e8ed'
      }}>
        <h3 style={{ margin: 0, color: '#333', fontWeight: 600 }}>
          {isPSDText ? '📝 PSD文字编辑' : '📝 文字编辑'}
        </h3>
        <Button
          icon="cross"
          minimal
          onClick={onClose}
          style={{ borderRadius: '6px' }}
        />
      </div>

      {/* PSD文字信息 */}
      {isPSDText && (
        <Card style={{ marginBottom: '16px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '13px', color: '#666' }}>
            <strong>原始PSD文字:</strong> {originalText || '(无原始文字记录)'}
          </div>
          {originalText && originalText !== text && (
            <Button
              size="small"
              intent="primary"
              minimal
              onClick={resetToOriginal}
              style={{ marginTop: '8px' }}
            >
              恢复原始文字
            </Button>
          )}
        </Card>
      )}

      {/* 文字内容 */}
      <FormGroup label="文字内容" style={{ marginBottom: '16px' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
          placeholder="输入文字内容..."
        />
      </FormGroup>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* 字体 */}
        <FormGroup label="字体">
          <HTMLSelect
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            fill
            options={commonFonts.map(font => ({ label: font, value: font }))}
          />
        </FormGroup>

        {/* 字号 */}
        <FormGroup label="字号">
          <NumericInput
            value={fontSize}
            onValueChange={(value) => setFontSize(value || 16)}
            min={8}
            max={200}
            stepSize={1}
            fill
          />
        </FormGroup>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* 字重 */}
        <FormGroup label="字重">
          <HTMLSelect
            value={fontWeight}
            onChange={(e) => setFontWeight(e.target.value)}
            fill
            options={[
              { label: '正常', value: 'normal' },
              { label: '粗体', value: 'bold' },
              { label: '细体', value: '300' },
              { label: '中等', value: '500' },
              { label: '特粗', value: '700' },
              { label: '超粗', value: '900' }
            ]}
          />
        </FormGroup>

        {/* 字体样式 */}
        <FormGroup label="字体样式">
          <HTMLSelect
            value={fontStyle}
            onChange={(e) => setFontStyle(e.target.value)}
            fill
            options={[
              { label: '正常', value: 'normal' },
              { label: '斜体', value: 'italic' }
            ]}
          />
        </FormGroup>
      </div>

      {/* 颜色 */}
      <FormGroup label="文字颜色" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="color"
            value={fill}
            onChange={(e) => setFill(e.target.value)}
            style={{
              width: '40px',
              height: '32px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          />
          <InputGroup
            value={fill}
            onChange={(e) => setFill(e.target.value)}
            placeholder="#000000"
            style={{ flex: 1 }}
          />
        </div>
      </FormGroup>

      {/* 对齐方式 */}
      <FormGroup label="对齐方式" style={{ marginBottom: '16px' }}>
        <ButtonGroup fill>
          <Button
            active={align === 'left'}
            onClick={() => setAlign('left')}
            icon="align-left"
          >
            左对齐
          </Button>
          <Button
            active={align === 'center'}
            onClick={() => setAlign('center')}
            icon="align-center"
          >
            居中
          </Button>
          <Button
            active={align === 'right'}
            onClick={() => setAlign('right')}
            icon="align-right"
          >
            右对齐
          </Button>
        </ButtonGroup>
      </FormGroup>

      {/* 行高 */}
      <FormGroup label={`行高: ${lineHeight.toFixed(1)}`} style={{ marginBottom: '16px' }}>
        <Slider
          min={0.8}
          max={3}
          stepSize={0.1}
          value={lineHeight}
          onChange={setLineHeight}
          showTrackFill={false}
        />
      </FormGroup>

      {/* 字符间距 */}
      <FormGroup label={`字符间距: ${letterSpacing}px`} style={{ marginBottom: '20px' }}>
        <Slider
          min={-5}
          max={20}
          stepSize={0.5}
          value={letterSpacing}
          onChange={setLetterSpacing}
          showTrackFill={false}
        />
      </FormGroup>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>
          关闭
        </Button>
        <Button
          intent="primary"
          onClick={() => {
            applyChanges();
            onClose();
          }}
        >
          应用更改
        </Button>
      </div>
    </div>
  );
});

export default PSDTextEditor;