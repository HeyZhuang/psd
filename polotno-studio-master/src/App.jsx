import React from 'react';
import { observer } from 'mobx-react-lite';
import { Spinner } from '@blueprintjs/core';

import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import {
  SidePanel,
  DEFAULT_SECTIONS,
  PhotosSection,
  VideosSection,
  TextSection
} from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { PagesTimeline } from 'polotno/pages-timeline';
import { setTranslations } from 'polotno/config';

import { loadFile } from './file';

import { QrSection } from './sections/qr-section';
import { QuotesSection } from './sections/quotes-section';
import { IconsSection } from './sections/icons-section';
import { ShapesSection } from './sections/shapes-section';
import { StableDiffusionSection } from './sections/stable-diffusion-section';
import { MyDesignsSection } from './sections/my-designs-section';
import { LayersSection } from './sections/layers-section';
import { UploadSection } from './sections/upload-section';
import { ResizeSection } from './sections/resize-section';
import { MyElementsSection } from './sections/my-elements-section';
import { MyTemplatesSection } from './sections/my-templates-section';
import { MyFontsSection } from './sections/my-fonts-section';

import { useProject } from './project';
import { saveElement } from './utils/my-elements-manager';
import { applyFontSelectStyles } from './utils/font-select-fixer';
import { initializeCustomFonts } from './utils/my-fonts-manager';

import fr from './translations/fr';
import en from './translations/en';
import id from './translations/id';
import ru from './translations/ru';
import ptBr from './translations/pt-br';
import zhCh from './translations/zh-ch';

import Topbar from './topbar/topbar';
import { RightLayersPanel } from './components/RightLayersPanel';
import { CustomToolbar } from './components/CustomToolbar';

// 优化的 Toolbar - 使用自定义工具栏
const MemoizedToolbar = React.memo(CustomToolbar);
const MemoizedWorkspace = React.memo(Workspace);
const MemoizedZoomButtons = React.memo(ZoomButtons);
const MemoizedPagesTimeline = React.memo(PagesTimeline);

// import '@blueprintjs/core/lib/css/blueprint.css';

// load default translations
setTranslations(en);

// 清空默认sections，按照新的顺序重新添加
DEFAULT_SECTIONS.length = 0;

// 按照指定顺序添加sections (排除Videos, Layers等):
// 1. My Designs
DEFAULT_SECTIONS.push(MyDesignsSection);
// 2. My Elements (我的元素)
DEFAULT_SECTIONS.push(MyElementsSection);
// 3. My Templates (我的模板)
DEFAULT_SECTIONS.push(MyTemplatesSection);
// 4. Upload (上传)
DEFAULT_SECTIONS.push(UploadSection);
// 5. Text (文字) - 使用Polotno SDK原生TextSection
DEFAULT_SECTIONS.push(TextSection);
// 6. My Fonts (我的字体) - 自定义字体库管理
DEFAULT_SECTIONS.push(MyFontsSection);
// 7. Photos (图片)
DEFAULT_SECTIONS.push(PhotosSection);
// 8. Shapes (形状)
DEFAULT_SECTIONS.push(ShapesSection);
// 9. Resize (尺寸调整)
DEFAULT_SECTIONS.push(ResizeSection);

// 注意：明确不添加 VideosSection，确保视频按钮不显示

const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone
  );
};

const getOffsetHeight = () => {
  let safeAreaInsetBottom = 0;

  if (isStandalone()) {
    // Try to get the safe area inset using env() variables
    const safeAreaInsetBottomString = getComputedStyle(
      document.documentElement
    ).getPropertyValue('env(safe-area-inset-bottom)');
    if (safeAreaInsetBottomString) {
      safeAreaInsetBottom = parseFloat(safeAreaInsetBottomString);
    }

    // Fallback values for specific devices if env() is not supported
    if (!safeAreaInsetBottom) {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      if (/iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream) {
        // This is an approximation; you might need to adjust this value based on testing
        safeAreaInsetBottom = 20; // Example fallback value for iPhone
      }
    }
  }

  return window.innerHeight - safeAreaInsetBottom;
};

const useHeight = () => {
  const [height, setHeight] = React.useState(getOffsetHeight());
  React.useEffect(() => {
    window.addEventListener('resize', () => {
      setHeight(getOffsetHeight());
    });
  }, []);
  return height;
};

const App = observer(({ store }) => {
  const project = useProject();
  const height = useHeight();
  const [isLayersPanelOpen, setIsLayersPanelOpen] = React.useState(true);
  const [rightPanelWidth, setRightPanelWidth] = React.useState(320);

  // 移除未使用的 workspaceWrapRef
  const resizeTimeoutRef = React.useRef(null);

  // 监听右侧面板宽度变化，动态调整画布
  React.useEffect(() => {
    const newWidth = isLayersPanelOpen ? 320 : 50;
    console.log('🎨 右侧面板宽度变化:', newWidth, 'px, 图层面板', isLayersPanelOpen ? '展开' : '折叠');
    setRightPanelWidth(newWidth);
  }, [isLayersPanelOpen]);

  // 监听右侧面板宽度变化，触发 Polotno 画布重新计算大小
  React.useEffect(() => {
    console.log('📐 PolotnoContainer 宽度计算: calc(100% -', rightPanelWidth, 'px)');

    // 清除之前的定时器
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    // 立即触发一次 resize
    console.log('🔄 触发 resize 事件 (立即)');
    window.dispatchEvent(new Event('resize'));

    // 在过渡期间多次触发 resize 确保平滑更新
    const resizeIntervals = [50, 100, 150, 200, 250, 300, 350];
    resizeIntervals.forEach(delay => {
      setTimeout(() => {
        console.log(`🔄 触发 resize 事件 (${delay}ms)`);
        window.dispatchEvent(new Event('resize'));
      }, delay);
    });

    // 设置最终的清理定时器
    resizeTimeoutRef.current = setTimeout(() => {
      // 过渡完成后最终触发
      console.log('🔄 触发 resize 事件 (最终)');
      window.dispatchEvent(new Event('resize'));
      resizeTimeoutRef.current = null;
    }, 400);

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [rightPanelWidth]);

  React.useEffect(() => {
    if (project.language.startsWith('fr')) {
      setTranslations(fr, { validate: true });
    } else if (project.language.startsWith('id')) {
      setTranslations(id, { validate: true });
    } else if (project.language.startsWith('ru')) {
      setTranslations(ru, { validate: true });
    } else if (project.language.startsWith('pt')) {
      setTranslations(ptBr, { validate: true });
    } else if (project.language.startsWith('zh')) {
      setTranslations(zhCh, { validate: true });
    } else {
      setTranslations(en, { validate: true });
    }
  }, [project.language]);

  React.useEffect(() => {
    // 加载项目（字体已经在 index.jsx 中预加载）
    project.firstLoad();

    // 初始化自定义字体系统 - 注册已保存的字体
    initializeCustomFonts().then(() => {
      console.log('✅ 自定义字体系统初始化完成');
    });

    // 延迟应用字体选择器样式修复，确保 Polotno 完全渲染
    let cleanupFontStyles;
    setTimeout(() => {
      console.log('🚀 开始应用字体选择器样式修复...');
      cleanupFontStyles = applyFontSelectStyles();
    }, 2000);

    // 添加右键菜单功能 - 保存元素到我的元素库
    const handleContextMenu = (e) => {
      const selectedElements = store.selectedElements;
      if (selectedElements.length === 1) {
        const element = selectedElements[0];

        // 创建自定义右键菜单项
        const existingMenu = document.querySelector('.custom-context-menu');
        if (existingMenu) {
          existingMenu.remove();
        }

        e.preventDefault();

        const menu = document.createElement('div');
        menu.className = 'custom-context-menu';
        menu.style.cssText = `
          position: fixed;
          top: ${e.clientY}px;
          left: ${e.clientX}px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 4px 0;
          z-index: 10000;
          min-width: 180px;
        `;

        const saveButton = document.createElement('div');
        saveButton.textContent = '⭐ 保存到我的元素';
        saveButton.style.cssText = `
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          transition: background 0.2s;
        `;
        saveButton.onmouseover = () => {
          saveButton.style.backgroundColor = '#f5f5f5';
        };
        saveButton.onmouseout = () => {
          saveButton.style.backgroundColor = 'transparent';
        };
        saveButton.onclick = async () => {
          const success = await saveElement(element, store);
          if (success) {
            // 显示成功提示
            const toast = document.createElement('div');
            const elementName = element.name || element.text || element.type;
            toast.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>✅</span>
                <span>"${elementName}" 已保存到我的元素库</span>
              </div>
            `;
            toast.style.cssText = `
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: #4CAF50;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              z-index: 10001;
              font-size: 14px;
              animation: slideDown 0.3s ease-out;
            `;
            document.body.appendChild(toast);

            // 添加动画样式
            if (!document.getElementById('toast-animation-style')) {
              const style = document.createElement('style');
              style.id = 'toast-animation-style';
              style.textContent = `
                @keyframes slideDown {
                  from {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                  }
                  to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                  }
                }
              `;
              document.head.appendChild(style);
            }

            setTimeout(() => {
              toast.style.transition = 'opacity 0.3s ease-out';
              toast.style.opacity = '0';
              setTimeout(() => toast.remove(), 300);
            }, 2000);
          }
          menu.remove();
        };

        menu.appendChild(saveButton);
        document.body.appendChild(menu);

        // 点击其他地方关闭菜单
        const closeMenu = (e) => {
          if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
          }
        };
        setTimeout(() => {
          document.addEventListener('click', closeMenu);
        }, 0);
      }
    };

    // 监听 workspace 的右键事件
    const workspace = document.querySelector('.polotno-workspace-container');
    if (workspace) {
      workspace.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      if (workspace) {
        workspace.removeEventListener('contextmenu', handleContextMenu);
      }
      // 清理字体样式监听器
      if (cleanupFontStyles) {
        cleanupFontStyles();
      }
    };
  }, [store]);

  const handleDrop = (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    // skip the case if we dropped DOM element from side panel
    // in that case Safari will have more data in "items"
    if (ev.dataTransfer.files.length !== ev.dataTransfer.items.length) {
      return;
    }
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      loadFile(ev.dataTransfer.files[i], store);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: height + 'px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onDrop={handleDrop}
    >
      <Topbar store={store} />
      <div style={{
        height: 'calc(100% - 50px)',
        position: 'relative',
        display: 'flex',
        overflow: 'hidden'
      }}>
        <PolotnoContainer
          className="polotno-app-container"
          style={{
            width: `calc(100% - ${rightPanelWidth}px)`,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <SidePanelWrap>
            <SidePanel store={store} sections={DEFAULT_SECTIONS} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <MemoizedToolbar store={store} />
            <MemoizedWorkspace store={store} />
            <MemoizedZoomButtons store={store} />
            <MemoizedPagesTimeline store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
        <RightLayersPanel
          store={store}
          isOpen={isLayersPanelOpen}
          onToggle={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
        />
      </div>
      {project.status === 'loading' && (
        <div
          className="glass-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(250, 250, 250, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="premium-card"
            style={{
              background: 'white',
              padding: '48px',
              borderRadius: '16px',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              minWidth: '300px',
            }}
          >
            <Spinner />
            <div style={{
              marginTop: '24px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#424242'
            }}>
              Loading...
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default App;
