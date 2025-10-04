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

  // 文字效果状态
  const [textEffects, setTextEffects] = React.useState(element.custom?.textEffects || {
    stroke: null,
    outerGlow: null,
    colorOverlay: null,
    dropShadow: null,
    hasEffects: false
  });
  
  // 效果开关状态
  const [enableStroke, setEnableStroke] = React.useState(textEffects.stroke?.enabled || false);
  const [enableGlow, setEnableGlow] = React.useState(textEffects.outerGlow?.enabled || false);
  const [enableShadow, setEnableShadow] = React.useState(textEffects.dropShadow?.enabled || false);
  const [enableColorOverlay, setEnableColorOverlay] = React.useState(textEffects.colorOverlay?.enabled || false);

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

  // 生成CSS效果样式
  const generateEffectsCSS = () => {
    const cssStyles = [];
    
    // 描边效果
    if (enableStroke && textEffects.stroke) {
      const stroke = textEffects.stroke;
      cssStyles.push(`-webkit-text-stroke: ${stroke.size}px ${stroke.color}`);
    }
    
    // 外发光效果
    if (enableGlow && textEffects.outerGlow) {
      const glow = textEffects.outerGlow;
      cssStyles.push(`text-shadow: 0 0 ${glow.blur}px ${glow.color}`);
    }
    
    // 投影效果
    if (enableShadow && textEffects.dropShadow) {
      const shadow = textEffects.dropShadow;
      const angle = (shadow.angle || 120) * Math.PI / 180;
      const offsetX = Math.cos(angle) * (shadow.distance || 5);
      const offsetY = Math.sin(angle) * (shadow.distance || 5);
      cssStyles.push(`text-shadow: ${offsetX}px ${offsetY}px ${shadow.blur}px ${shadow.color}`);
    }
    
    return cssStyles.length > 0 ? cssStyles.join('; ') : null;
  };

  // 应用修改
  const applyChanges = () => {
    // 更新效果状态
    const updatedEffects = {
      ...textEffects,
      stroke: enableStroke ? textEffects.stroke : null,
      outerGlow: enableGlow ? textEffects.outerGlow : null,
      dropShadow: enableShadow ? textEffects.dropShadow : null,
      colorOverlay: enableColorOverlay ? textEffects.colorOverlay : null,
      hasEffects: enableStroke || enableGlow || enableShadow || enableColorOverlay
    };
    
    const cssEffects = generateEffectsCSS();
    
    element.set({
      text,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      fill: enableColorOverlay && textEffects.colorOverlay ? textEffects.colorOverlay.color : fill,
      align,
      lineHeight,
      letterSpacing,
      // 更新自定义属性
      custom: {
        ...element.custom,
        textEffects: updatedEffects,
        cssEffects: cssEffects,
        // 保存编辑历史
        ...(isPSDText ? {
          editHistory: [
            ...(element.custom?.editHistory || []),
            {
              timestamp: Date.now(),
              originalText: originalText || text,
              editedText: text
            }
          ]
        } : {})
      }
    });

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
  }, [text, fontSize, fontFamily, fontWeight, fontStyle, fill, align, lineHeight, letterSpacing, enableStroke, enableGlow, enableShadow, enableColorOverlay, textEffects]);

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

      {/* 文字效果区域 */}
      {isPSDText && textEffects && (
        <Card style={{ marginBottom: '20px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '14px', fontWeight: 600 }}>
            🎨 文字效果 (来自PSD)
          </h4>

          {/* 描边效果 */}
          {textEffects.stroke && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, fontSize: '13px' }}>📝 描边效果</span>
                <Checkbox
                  checked={enableStroke}
                  onChange={(e) => setEnableStroke(e.target.checked)}
                  label="启用"
                />
              </div>
              <div style={{ fontSize: '12px', color: '#666', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>大小: {textEffects.stroke.size}px</div>
                <div>颜色: <span style={{ 
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  background: textEffects.stroke.color,
                  borderRadius: '2px',
                  border: '1px solid #ccc',
                  marginLeft: '4px'
                }}></span></div>
              </div>
            </div>
          )}

          {/* 外发光效果 */}
          {textEffects.outerGlow && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, fontSize: '13px' }}>✨ 外发光</span>
                <Checkbox
                  checked={enableGlow}
                  onChange={(e) => setEnableGlow(e.target.checked)}
                  label="启用"
                />
              </div>
              <div style={{ fontSize: '12px', color: '#666', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>模糊: {textEffects.outerGlow.blur}px</div>
                <div>颜色: <span style={{ 
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  background: textEffects.outerGlow.color,
                  borderRadius: '2px',
                  border: '1px solid #ccc',
                  marginLeft: '4px'
                }}></span></div>
              </div>
            </div>
          )}

          {/* 投影效果 */}
          {textEffects.dropShadow && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, fontSize: '13px' }}>🌫️ 投影</span>
                <Checkbox
                  checked={enableShadow}
                  onChange={(e) => setEnableShadow(e.target.checked)}
                  label="启用"
                />
              </div>
              <div style={{ fontSize: '12px', color: '#666', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>距离: {textEffects.dropShadow.distance}px</div>
                <div>模糊: {textEffects.dropShadow.blur}px</div>
                <div>角度: {textEffects.dropShadow.angle}°</div>
                <div>颜色: <span style={{ 
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  background: textEffects.dropShadow.color,
                  borderRadius: '2px',
                  border: '1px solid #ccc',
                  marginLeft: '4px'
                }}></span></div>
              </div>
            </div>
          )}

          {/* 颜色叠加效果 */}
          {textEffects.colorOverlay && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, fontSize: '13px' }}>🎨 颜色叠加</span>
                <Checkbox
                  checked={enableColorOverlay}
                  onChange={(e) => setEnableColorOverlay(e.target.checked)}
                  label="启用"
                />
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <div>颜色: <span style={{ 
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  background: textEffects.colorOverlay.color,
                  borderRadius: '2px',
                  border: '1px solid #ccc',
                  marginLeft: '4px'
                }}></span> {textEffects.colorOverlay.color}</div>
                <div style={{ marginTop: '4px' }}>不透明度: {textEffects.colorOverlay.opacity}%</div>
              </div>
            </div>
          )}

          {!textEffects.hasEffects && (
            <div style={{ textAlign: 'center', color: '#999', fontSize: '13px', padding: '20px' }}>
              该文字图层没有检测到效果
            </div>
          )}
        </Card>
      )}

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