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
import { UserTemplatesSection } from './sections/user-templates-section';
import { ResizeSection } from './sections/resize-section';
import { MyElementsSection } from './sections/my-elements-section';

import { useProject } from './project';
import { saveElement } from './utils/my-elements-manager';

import fr from './translations/fr';
import en from './translations/en';
import id from './translations/id';
import ru from './translations/ru';
import ptBr from './translations/pt-br';
import zhCh from './translations/zh-ch';

import Topbar from './topbar/topbar';
import { RightLayersPanel } from './components/RightLayersPanel';

// 优化的 Toolbar - 防止不必要的重渲染
const MemoizedToolbar = React.memo(Toolbar);
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
// 3. Upload (上传)
DEFAULT_SECTIONS.push(UploadSection);
// 4. Templates (模板)
DEFAULT_SECTIONS.push(UserTemplatesSection);
// 5. Text (文字) - 使用Polotno SDK原生TextSection (包含我的字体功能)
DEFAULT_SECTIONS.push(TextSection);
// 6. Photos (图片)
DEFAULT_SECTIONS.push(PhotosSection);
// 7. Shapes (形状)
DEFAULT_SECTIONS.push(ShapesSection);
// 8. Resize (尺寸调整)
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

  // 使用 ref 避免不必要的重渲染
  const workspaceWrapRef = React.useRef(null);

  // 使用 useEffect 更新 margin，避免重渲染导致抖动
  React.useEffect(() => {
    if (workspaceWrapRef.current) {
      const marginRight = isLayersPanelOpen ? '320px' : '50px';
      workspaceWrapRef.current.style.marginRight = marginRight;
    }
  }, [isLayersPanelOpen]);

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
    project.firstLoad();

    // 预加载自定义字体
    const customFonts = [
      { fontFamily: '華康POP1體W5', url: '/fonts/華康POP1體W5.ttf' },
      { fontFamily: '華康POP1體W9', url: '/fonts/華康POP1體W9.ttf' },
      { fontFamily: '華康超特圓體', url: '/fonts/華康超特圓體.ttf' }
    ];

    // 延迟添加字体以确保UI已经渲染
    setTimeout(() => {
      customFonts.forEach(font => {
        store.addFont(font);
        console.log(`✅ 字体已添加到面板: ${font.fontFamily}`);
      });
    }, 1000);

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
            toast.textContent = '✅ 元素已保存到我的元素库';
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
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
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
      <div style={{ height: 'calc(100% - 50px)', position: 'relative' }}>
        <PolotnoContainer className="polotno-app-container">
          <SidePanelWrap>
            <SidePanel store={store} sections={DEFAULT_SECTIONS} />
          </SidePanelWrap>
          <WorkspaceWrap
            ref={workspaceWrapRef}
          >
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
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
            }}
          >
            <Spinner />
          </div>
        </div>
      )}
    </div>
  );
});

export default App;
