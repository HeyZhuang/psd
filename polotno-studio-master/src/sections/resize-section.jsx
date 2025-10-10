import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, InputGroup, RadioGroup, Radio, Checkbox } from '@blueprintjs/core';
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
  const [scaleStrategy, setScaleStrategy] = React.useState('proportional'); // 'proportional' 或 'fit'
  const [keepAspectRatio, setKeepAspectRatio] = React.useState(true);
  const [maintainQuality, setMaintainQuality] = React.useState(true);

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

    const originalWidth = store.width;
    const originalHeight = store.height;

    let scaleX, scaleY;

    // 根据策略计算缩放比例
    if (scaleStrategy === 'fit' && keepAspectRatio) {
      // 智能适配：保持宽高比，完全适配到新画布
      const scaleRatio = Math.min(width / originalWidth, height / originalHeight);
      scaleX = scaleRatio;
      scaleY = scaleRatio;
      console.log(`🎯 智能适配模式: 统一缩放比例 ${scaleRatio.toFixed(3)}`);
    } else if (keepAspectRatio) {
      // 等比缩放：使用较小的缩放比例保持宽高比
      const scaleRatio = Math.min(width / originalWidth, height / originalHeight);
      scaleX = scaleRatio;
      scaleY = scaleRatio;
      console.log(`📏 等比缩放模式: 统一缩放比例 ${scaleRatio.toFixed(3)}`);
    } else {
      // 自由缩放：分别按X和Y轴缩放
      scaleX = width / originalWidth;
      scaleY = height / originalHeight;
      console.log(`🔧 自由缩放模式: X=${scaleX.toFixed(3)}, Y=${scaleY.toFixed(3)}`);
    }

    console.log(`🔧 画布缩放: ${originalWidth}×${originalHeight} → ${width}×${height}`);

    let totalElements = 0;
    let imageElements = 0;

    store.pages.forEach((page) => {
      page.children.forEach((element) => {
        totalElements++;

        // 基础属性缩放
        const updates = {
          x: element.x * scaleX,
          y: element.y * scaleY,
        };

        // 根据保持质量选项决定是否缩放尺寸
        if (maintainQuality && element.type === 'image') {
          // 保持图片原始尺寸，仅调整位置
          updates.width = element.width;
          updates.height = element.height;
          imageElements++;
          console.log(`  🖼️ 保持图片质量: ${element.id?.substring(0, 8)} - 不缩放尺寸`);
        } else {
          // 正常缩放
          if (keepAspectRatio) {
            // 等比缩放时，使用统一比例
            const uniformScale = Math.min(scaleX, scaleY);
            updates.width = element.width * uniformScale;
            updates.height = element.height * uniformScale;
          } else {
            updates.width = element.width * scaleX;
            updates.height = element.height * scaleY;
          }
        }

        // 处理文字元素
        if (element.type === 'text') {
          const textScale = keepAspectRatio ? Math.min(scaleX, scaleY) : Math.min(scaleX, scaleY);

          // 缩放字体大小
          if (element.fontSize) {
            updates.fontSize = element.fontSize * textScale;
          }

          // 缩放行高（如果设置了具体数值）
          if (element.lineHeight && typeof element.lineHeight === 'number' && element.lineHeight > 2) {
            updates.lineHeight = element.lineHeight * textScale;
          }

          // 缩放字符间距
          if (element.letterSpacing) {
            updates.letterSpacing = element.letterSpacing * textScale;
          }

          // 处理PSD文字效果（如果存在）
          if (element.custom && element.custom.textEffects) {
            const scaledEffects = JSON.parse(JSON.stringify(element.custom.textEffects));

            // 缩放描边宽度
            if (scaledEffects.stroke && scaledEffects.stroke.size) {
              scaledEffects.stroke.size = scaledEffects.stroke.size * textScale;
            }

            // 缩放外发光
            if (scaledEffects.outerGlow) {
              if (scaledEffects.outerGlow.size) {
                scaledEffects.outerGlow.size = scaledEffects.outerGlow.size * textScale;
              }
              if (scaledEffects.outerGlow.spread) {
                scaledEffects.outerGlow.spread = scaledEffects.outerGlow.spread * textScale;
              }
            }

            // 缩放投影
            if (scaledEffects.dropShadow) {
              if (scaledEffects.dropShadow.distance) {
                scaledEffects.dropShadow.distance = scaledEffects.dropShadow.distance * textScale;
              }
              if (scaledEffects.dropShadow.size) {
                scaledEffects.dropShadow.size = scaledEffects.dropShadow.size * textScale;
              }
              if (scaledEffects.dropShadow.spread) {
                scaledEffects.dropShadow.spread = scaledEffects.dropShadow.spread * textScale;
              }
            }

            // 缩放内阴影
            if (scaledEffects.innerShadow) {
              if (scaledEffects.innerShadow.distance) {
                scaledEffects.innerShadow.distance = scaledEffects.innerShadow.distance * textScale;
              }
              if (scaledEffects.innerShadow.size) {
                scaledEffects.innerShadow.size = scaledEffects.innerShadow.size * textScale;
              }
            }

            // 缩放斜面和浮雕
            if (scaledEffects.bevelEmboss) {
              if (scaledEffects.bevelEmboss.size) {
                scaledEffects.bevelEmboss.size = scaledEffects.bevelEmboss.size * textScale;
              }
              if (scaledEffects.bevelEmboss.depth) {
                scaledEffects.bevelEmboss.depth = scaledEffects.bevelEmboss.depth * textScale;
              }
            }

            // 更新自定义属性
            if (!updates.custom) {
              updates.custom = { ...element.custom };
            }
            updates.custom.textEffects = scaledEffects;
          }
        }

        // 处理图片元素（包括PSD导入的位图文字）
        if (element.type === 'image') {
          // 保持旋转角度
          if (element.rotation !== undefined) {
            updates.rotation = element.rotation;
          }

          // 保持透明度
          if (element.opacity !== undefined) {
            updates.opacity = element.opacity;
          }

          // 处理PSD相关的自定义属性
          if (element.custom) {
            if (!updates.custom) {
              updates.custom = { ...element.custom };
            }

            // 保持PSD标记
            if (element.custom.isPSDText) {
              updates.custom.isPSDText = element.custom.isPSDText;
            }

            // 保持原始文字内容
            if (element.custom.originalText) {
              updates.custom.originalText = element.custom.originalText;
            }

            // 保持原始图片源以维持质量
            if (element.custom.originalSrc && maintainQuality) {
              updates.custom.originalSrc = element.custom.originalSrc;
            }
          }
        }

        // 应用所有更新
        element.set(updates);
      });
    });

    store.setSize(width, height);

    // 更新画布尺寸显示
    updateCanvasSizeDisplay(width, height);

    console.log(`✅ 画布缩放完成:`);
    console.log(`   - 总元素: ${totalElements}`);
    console.log(`   - 图片元素: ${imageElements} ${maintainQuality ? '(质量保护已启用)' : ''}`);
    console.log(`   - 缩放策略: ${scaleStrategy === 'fit' ? '智能适配' : '等比缩放'}`);
    console.log(`   - 保持宽高比: ${keepAspectRatio ? '是' : '否'}`);
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

      {/* 缩放选项 */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '12px'
        }}>
          ⚙️ 缩放选项
        </div>

        {/* 缩放策略 */}
        <RadioGroup
          onChange={(e) => setScaleStrategy(e.target.value)}
          selectedValue={scaleStrategy}
          style={{ marginBottom: '12px' }}
        >
          <Radio
            label={
              <div style={{ fontSize: '13px' }}>
                <strong>等比缩放</strong>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                  保持元素宽高比，按统一比例缩放
                </div>
              </div>
            }
            value="proportional"
          />
          <Radio
            label={
              <div style={{ fontSize: '13px' }}>
                <strong>智能适配</strong>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                  自动适配到新画布，保持整体布局
                </div>
              </div>
            }
            value="fit"
          />
        </RadioGroup>

        {/* 附加选项 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Checkbox
            checked={keepAspectRatio}
            onChange={(e) => setKeepAspectRatio(e.target.checked)}
            label={
              <span style={{ fontSize: '13px', color: '#374151' }}>
                <strong>保持宽高比</strong>
                <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '6px' }}>
                  避免元素变形
                </span>
              </span>
            }
          />
          <Checkbox
            checked={maintainQuality}
            onChange={(e) => setMaintainQuality(e.target.checked)}
            label={
              <span style={{ fontSize: '13px', color: '#374151' }}>
                <strong>保护图片质量</strong>
                <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '6px' }}>
                  图片不缩放，仅调整位置
                </span>
              </span>
            }
          />
        </div>
      </div>

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
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none'
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
          <div style={{ marginBottom: '4px' }}>• <strong>仅调整画布：</strong>改变画布大小，元素位置和大小不变</div>
          <div style={{ marginBottom: '4px' }}>• <strong>调整并缩放：</strong>按比例缩放画布和所有元素</div>
          <div style={{ marginBottom: '4px' }}>• <strong>保护图片质量：</strong>避免图片因缩放导致模糊失真</div>
          <div>• <strong>保持宽高比：</strong>确保元素不会被拉伸变形</div>
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
