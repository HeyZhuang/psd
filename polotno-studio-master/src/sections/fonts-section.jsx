import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button } from '@blueprintjs/core';
import { unstable_registerNextDomDrop } from 'polotno/config';
import MdTextFields from '@meronex/icons/md/MdTextFields';

// 字体存储管理
class FontStorage {
  constructor() {
    this.fonts = this.loadFonts();
  }

  loadFonts() {
    try {
      const stored = localStorage.getItem('customFonts');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load fonts:', e);
      return [];
    }
  }

  saveFonts() {
    try {
      localStorage.setItem('customFonts', JSON.stringify(this.fonts));
    } catch (e) {
      console.error('Failed to save fonts:', e);
    }
  }

  async addFont(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fontData = e.target.result;
          const fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');

          // 创建 FontFace 对象
          const fontFace = new FontFace(fontName, `url(${fontData})`);

          // 加载字体
          await fontFace.load();

          // 添加到 document
          document.fonts.add(fontFace);

          // 保存字体信息
          const fontInfo = {
            name: fontName,
            data: fontData,
            fileName: file.name,
            uploadTime: new Date().toISOString()
          };

          this.fonts.push(fontInfo);
          this.saveFonts();

          resolve(fontInfo);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  deleteFont(fontName) {
    this.fonts = this.fonts.filter(f => f.name !== fontName);
    this.saveFonts();

    // 从 document.fonts 中移除
    document.fonts.forEach(font => {
      if (font.family === fontName) {
        document.fonts.delete(font);
      }
    });
  }

  async loadAllFonts() {
    for (const fontInfo of this.fonts) {
      try {
        const fontFace = new FontFace(fontInfo.name, `url(${fontInfo.data})`);
        await fontFace.load();
        document.fonts.add(fontFace);
      } catch (e) {
        console.error(`Failed to load font ${fontInfo.name}:`, e);
      }
    }
  }
}

// 全局字体存储实例
const fontStorage = new FontStorage();

// 在应用启动时加载所有字体
fontStorage.loadAllFonts();

export const FontsPanel = observer(({ store }) => {
  const [fonts, setFonts] = React.useState(fontStorage.fonts);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef();

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        // 检查文件类型
        if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
          alert(`不支持的字体格式: ${file.name}\n请上传 TTF, OTF, WOFF 或 WOFF2 格式的字体文件`);
          continue;
        }

        await fontStorage.addFont(file);
      }
      setFonts([...fontStorage.fonts]);
    } catch (error) {
      console.error('Font upload error:', error);
      alert('字体上传失败: ' + error.message);
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDelete = (fontName) => {
    if (confirm(`确定要删除字体 "${fontName}" 吗？`)) {
      fontStorage.deleteFont(fontName);
      setFonts([...fontStorage.fonts]);
    }
  };

  const handleApplyFont = (fontName) => {
    const selected = store.selectedElements;
    if (selected.length === 0) {
      alert('请先选择一个文字元素');
      return;
    }

    selected.forEach(element => {
      if (element.type === 'text') {
        element.set({ fontFamily: fontName });
      }
    });
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <div style={{
        marginBottom: '20px',
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.6'
      }}>
        上传自定义字体文件（TTF、OTF、WOFF、WOFF2格式），然后在文字元素中使用。
      </div>

      {/* 上传按钮 */}
      <input
        ref={inputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Button
        fill
        icon="upload"
        onClick={() => inputRef.current?.click()}
        loading={uploading}
        style={{
          marginBottom: '20px',
          backgroundColor: '#ffffff',
          color: '#333333',
          border: '1px solid #d5d5d5',
          fontWeight: '500'
        }}
      >
        {uploading ? '上传中...' : '上传字体文件'}
      </Button>

      {/* 字体列表 */}
      <div style={{
        marginTop: '20px'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#374151'
        }}>
          已上传的字体 ({fonts.length})
        </div>

        {fonts.length === 0 ? (
          <div style={{
            padding: '30px 20px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '13px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed #d1d5db'
          }}>
            还没有上传任何字体
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {fonts.map((font, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontFamily: font.name,
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#111827',
                    flex: 1
                  }}>
                    {font.name}
                  </div>
                  <Button
                    minimal
                    small
                    icon="cross"
                    intent="danger"
                    onClick={() => handleDelete(font.name)}
                    style={{
                      minWidth: '24px',
                      minHeight: '24px'
                    }}
                  />
                </div>

                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  {font.fileName}
                </div>

                <div style={{
                  fontFamily: font.name,
                  fontSize: '14px',
                  color: '#4b5563',
                  marginBottom: '10px',
                  padding: '8px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '4px'
                }}>
                  预览: 春眠不觉晓 ABCDEFG 123456
                </div>

                <Button
                  small
                  fill
                  icon="text-highlight"
                  onClick={() => handleApplyFont(font.name)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#333333',
                    border: '1px solid #d5d5d5',
                    fontSize: '12px'
                  }}
                >
                  应用到选中文字
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        borderLeft: '3px solid #3b82f6'
      }}>
        <div style={{ fontSize: '12px', color: '#1e40af', lineHeight: '1.5' }}>
          <div style={{ fontWeight: '600', marginBottom: '6px' }}>💡 使用提示</div>
          <div style={{ marginBottom: '4px' }}>• 支持 TTF、OTF、WOFF、WOFF2 格式</div>
          <div style={{ marginBottom: '4px' }}>• 字体存储在浏览器本地</div>
          <div>• 选中文字元素后点击"应用"使用字体</div>
        </div>
      </div>
    </div>
  );
});

export const FontsSection = {
  name: 'fonts',
  Tab: (props) => (
    <SectionTab name="我的字体" {...props}>
      <MdTextFields />
    </SectionTab>
  ),
  Panel: FontsPanel,
};
