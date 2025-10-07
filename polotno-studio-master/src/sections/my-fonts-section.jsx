import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button } from '@blueprintjs/core';
import MdTextFields from '@meronex/icons/md/MdTextFields';

import {
  getCustomFonts,
  deleteCustomFont,
  clearCustomFonts,
  loadFontFileAsBase64,
  registerFont,
  saveCustomFont,
  PRESET_FONTS,
  loadPresetFont,
  getStorageInfo,
} from '../utils/my-fonts-manager';

// 我的字体面板
export const MyFontsPanel = observer(({ store }) => {
  const [fonts, setFonts] = React.useState([]);
  const [storageInfo, setStorageInfo] = React.useState({ displaySize: '0 KB' });
  const [loadingPresets, setLoadingPresets] = React.useState(false);
  const fileInputRef = React.useRef();

  // 加载字体列表
  const loadFonts = () => {
    const customFonts = getCustomFonts();
    setFonts(customFonts);
    setStorageInfo(getStorageInfo());
  };

  React.useEffect(() => {
    loadFonts();
  }, []);

  // 添加文字到画布并应用字体
  const handleApplyFont = (fontFamily) => {
    const x = store.width / 2;
    const y = store.height / 2;

    store.activePage?.addElement({
      type: 'text',
      x,
      y,
      fill: 'black',
      fontSize: 48,
      fontFamily: fontFamily,
      text: '双击编辑文字',
    });
  };

  // 删除字体
  const handleDeleteFont = async (fontId, e) => {
    e.stopPropagation();

    if (window.confirm('确定要删除这个字体吗?')) {
      const success = deleteCustomFont(fontId);
      if (success) {
        loadFonts();
      }
    }
  };

  // 上传自定义字体文件
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      const fileName = file.name;
      const fontFamily = fileName.replace(/\.(ttf|otf|woff|woff2)$/i, '');

      try {
        // 转换为 Base64
        const base64Url = await loadFontFileAsBase64(file);

        // 注册字体
        const registered = await registerFont(fontFamily, base64Url);

        if (registered) {
          // 保存到 localStorage
          saveCustomFont({
            name: fontFamily,
            family: fontFamily,
            url: base64Url,
            fileName: fileName,
          });

          console.log('✅ 字体上传成功:', fontFamily);
        }
      } catch (error) {
        console.error('❌ 字体上传失败:', fileName, error);
        alert(`上传失败: ${fileName}`);
      }
    }

    // 重新加载字体列表
    loadFonts();

    // 清空 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 加载预设字体
  const handleLoadPresetFont = async (fontInfo) => {
    setLoadingPresets(true);
    try {
      const success = await loadPresetFont(fontInfo);
      if (success) {
        loadFonts();
        console.log('✅ 预设字体加载成功:', fontInfo.name);
      } else {
        alert(`加载失败: ${fontInfo.name}`);
      }
    } catch (error) {
      console.error('❌ 加载预设字体失败:', error);
      alert(`加载失败: ${fontInfo.name}`);
    } finally {
      setLoadingPresets(false);
    }
  };

  // 清空所有字体
  const handleClearAll = () => {
    if (window.confirm('确定要删除所有自定义字体吗？此操作不可恢复！')) {
      clearCustomFonts();
      loadFonts();
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 上传按钮 */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#1764EA',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1557d0';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1764EA';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          📤 上传字体文件
        </button>

        {fonts.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '8px',
              backgroundColor: 'transparent',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#dc2626',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            🗑️ 清空所有字体
          </button>
        )}
      </div>

      {/* 字体列表 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
        }}
      >
        {/* 已保存的字体 */}
        {fonts.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#374151',
              }}
            >
              我的字体 ({fonts.length})
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '10px',
              }}
            >
              {fonts.map((font) => (
                <div
                  key={font.id}
                  onClick={() => handleApplyFont(font.family)}
                  style={{
                    padding: '14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1764EA';
                    e.currentTarget.style.backgroundColor = '#f0f4ff';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: font.family,
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#1f2937',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {font.name}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6b7280',
                      }}
                    >
                      {font.fileName}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteFont(font.id, e)}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'transparent',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#dc2626',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginLeft: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                      e.currentTarget.style.borderColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 预设字体库 */}
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#374151',
            }}
          >
            预设字体库 ({PRESET_FONTS.length})
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '10px',
            }}
          >
            {PRESET_FONTS.map((fontInfo, index) => {
              const isLoaded = fonts.some((f) => f.family === fontInfo.family);

              return (
                <div
                  key={index}
                  onClick={() => !isLoaded && !loadingPresets && handleLoadPresetFont(fontInfo)}
                  style={{
                    padding: '14px',
                    backgroundColor: isLoaded ? '#f0fdf4' : '#ffffff',
                    border: `1px solid ${isLoaded ? '#86efac' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: isLoaded || loadingPresets ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: loadingPresets ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoaded && !loadingPresets) {
                      e.currentTarget.style.borderColor = '#1764EA';
                      e.currentTarget.style.backgroundColor = '#f0f4ff';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoaded) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '500',
                      color: isLoaded ? '#16a34a' : '#1f2937',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isLoaded ? '✅' : '📦'} {fontInfo.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                    }}
                  >
                    {isLoaded ? '已加载到我的字体' : '点击加载字体'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#495057',
            marginBottom: '6px',
          }}
        >
          📁 共 {fonts.length} 个字体 (最多50个)
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#6c757d',
          }}
        >
          💾 存储占用: {storageInfo.displaySize}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#6c757d',
            marginTop: '4px',
          }}
        >
          💡 支持 TTF、OTF、WOFF、WOFF2 格式
        </div>
      </div>
    </div>
  );
});

// 导出 Section 配置
export const MyFontsSection = {
  name: 'my-fonts',
  Tab: (props) => (
    <SectionTab name="我的字体" {...props}>
      <MdTextFields />
    </SectionTab>
  ),
  Panel: MyFontsPanel,
};
