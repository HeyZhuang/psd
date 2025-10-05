import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, InputGroup, RadioGroup, Radio } from '@blueprintjs/core';
import MdFullscreen from '@meronex/icons/md/MdFullscreen';

const PRESET_SIZES = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'A4 (Portrait)', width: 2480, height: 3508 },
  { name: 'A4 (Landscape)', width: 3508, height: 2480 },
  { name: 'US Letter', width: 2550, height: 3300 },
  { name: '4K', width: 3840, height: 2160 },
  { name: 'Full HD', width: 1920, height: 1080 },
];

export const ResizePanel = observer(({ store }) => {
  const [mode, setMode] = React.useState('preset');
  const [customWidth, setCustomWidth] = React.useState(store.width.toString());
  const [customHeight, setCustomHeight] = React.useState(store.height.toString());
  const [selectedPreset, setSelectedPreset] = React.useState(0);

  const handleResize = () => {
    let width, height;

    if (mode === 'preset') {
      const preset = PRESET_SIZES[selectedPreset];
      width = preset.width;
      height = preset.height;
    } else {
      width = parseInt(customWidth);
      height = parseInt(customHeight);

      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return;
      }

      if (width > 10000 || height > 10000) {
        return;
      }
    }

    store.setSize(width, height);

    // 更新画布尺寸显示
    updateCanvasSizeDisplay(width, height);
  };

  const updateCanvasSizeDisplay = (width, height) => {
    const canvasContainer = document.querySelector('.polotno-canvas-container');
    if (canvasContainer) {
      canvasContainer.setAttribute('data-canvas-size', `${width} × ${height} px`);
    }
  };

  const handleScaleContent = () => {
    let width, height;

    if (mode === 'preset') {
      const preset = PRESET_SIZES[selectedPreset];
      width = preset.width;
      height = preset.height;
    } else {
      width = parseInt(customWidth);
      height = parseInt(customHeight);

      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return;
      }

      if (width > 10000 || height > 10000) {
        return;
      }
    }

    const scaleX = width / store.width;
    const scaleY = height / store.height;

    store.pages.forEach((page) => {
      page.children.forEach((element) => {
        element.set({
          x: element.x * scaleX,
          y: element.y * scaleY,
          width: element.width * scaleX,
          height: element.height * scaleY,
        });

        if (element.type === 'text' && element.fontSize) {
          element.set({
            fontSize: element.fontSize * Math.min(scaleX, scaleY),
          });
        }
      });
    });

    store.setSize(width, height);

    // 更新画布尺寸显示
    updateCanvasSizeDisplay(width, height);
  };

  const getRatio = () => {
    const ratio = store.width / store.height;
    if (ratio === 1) return '1:1';
    if (Math.abs(ratio - 16/9) < 0.01) return '16:9';
    if (Math.abs(ratio - 9/16) < 0.01) return '9:16';
    if (Math.abs(ratio - 4/3) < 0.01) return '4:3';
    if (Math.abs(ratio - 3/2) < 0.01) return '3:2';
    return ratio.toFixed(2) + ':1';
  };

  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      {/* 当前画布尺寸 */}
      <div style={{
        marginBottom: '20px',
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        color: 'black',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: '12px',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: '500',
          color: '#6b7280'
        }}>
          当前画布
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: '700',
          letterSpacing: '-0.5px',
          marginBottom: '8px',
          color: '#111827'
        }}>
          {store.width} × {store.height}
          <span style={{ fontSize: '14px', fontWeight: '500', marginLeft: '4px', color: '#6b7280' }}>px</span>
        </div>
        <div style={{
          fontSize: '13px',
          display: 'inline-block',
          background: '#f3f4f6',
          padding: '4px 12px',
          borderRadius: '12px',
          color: '#374151',
          fontWeight: '500'
        }}>
          📐 {getRatio()}
        </div>
      </div>

      {/* 模式选择 */}
      <RadioGroup
        onChange={(e) => setMode(e.target.value)}
        selectedValue={mode}
        style={{ marginBottom: '16px' }}
      >
        <Radio
          label={<span style={{ fontSize: '14px', fontWeight: '500' }}>预设尺寸</span>}
          value="preset"
        />
        <Radio
          label={<span style={{ fontSize: '14px', fontWeight: '500' }}>自定义尺寸</span>}
          value="custom"
        />
      </RadioGroup>

      {mode === 'preset' ? (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            {PRESET_SIZES.map((preset, index) => (
              <div
                key={index}
                onClick={() => setSelectedPreset(index)}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: selectedPreset === index ? '2px solid #667eea' : '2px solid #e5e7eb',
                  backgroundColor: selectedPreset === index ? '#f0f4ff' : 'white',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedPreset === index ? '0 2px 8px rgba(102, 126, 234, 0.2)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedPreset !== index) {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPreset !== index) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: '#1f2937',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {preset.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  {preset.width} × {preset.height}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151'
              }}>
                宽度 (px)
              </label>
              <InputGroup
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                placeholder="宽度"
                min="1"
                max="10000"
                style={{ fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151'
              }}>
                高度 (px)
              </label>
              <InputGroup
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                placeholder="高度"
                min="1"
                max="10000"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <Button
          fill
          onClick={handleResize}
          icon="fullscreen"
          style={{
            height: '40px',
            fontWeight: '500',
            fontSize: '14px',
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid #d1d5db'
          }}
        >
          仅调整画布
        </Button>
        <Button
          fill
          onClick={handleScaleContent}
          icon="zoom-to-fit"
          style={{
            height: '40px',
            fontWeight: '500',
            fontSize: '14px',
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid #d1d5db'
          }}
        >
          调整并缩放内容
        </Button>
      </div>

      {/* 提示信息 */}
      <div style={{
        padding: '12px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        borderLeft: '3px solid #3b82f6'
      }}>
        <div style={{ fontSize: '12px', color: '#1e40af', lineHeight: '1.5' }}>
          <div style={{ fontWeight: '600', marginBottom: '6px' }}>💡 使用提示</div>
          <div style={{ marginBottom: '4px' }}>• <strong>仅调整画布：</strong>改变画布大小，元素不变</div>
          <div>• <strong>调整并缩放：</strong>按比例缩放画布和元素</div>
        </div>
      </div>
    </div>
  );
});

export const ResizeSection = {
  name: 'resize',
  Tab: observer((props) => (
    <SectionTab name="尺寸调整" {...props}>
      <MdFullscreen />
    </SectionTab>
  )),
  Panel: ResizePanel,
};
