import React from 'react';
import ReactDOM from 'react-dom/client';

import { createStore } from 'polotno/model/store';
import { unstable_setAnimationsEnabled } from 'polotno/config';
import { createProject, ProjectContext } from './project';

import '@blueprintjs/core/lib/css/blueprint.css';
import './index.css';
import './styles/psd-precision.css';
import './styles/font-select-override.css';
import App from './App';
import './logger';
import { ErrorBoundary } from 'react-error-boundary';
import { initializePrecisionRenderer } from './utils/PrecisionRenderer';
import { psdDebugger } from './utils/PSDDebugger';
import { initializePolotnoTextRenderer } from './utils/PolotnoTextRenderer';
import { forceOptionBlack } from './utils/force-option-black';

// if (window.location.host !== 'studio.polotno.com') {
//   console.log(
//     `%cWelcome to Polotno Studio! Thanks for your interest in the project!
// This repository has many customizations from the default version Polotno SDK.
// I don't recommend to use it as starting point.
// Instead, you can start from any official demos, e.g.: https://polotno.com/docs/full-canvas-editor
// or direct sandbox: https://codesandbox.io/s/github/polotno-project/polotno-site/tree/source/examples/polotno-demo?from-embed.
// But feel free to use this repository as a reference for your own project and to learn how to use Polotno SDK.`,
//     'background: rgba(54, 213, 67, 1); color: white; padding: 5px;'
//   );
// }

unstable_setAnimationsEnabled(true);

// 开发环境配置
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const store = createStore({
  key: 'JtaT2TQRl_EqM_V0SXL0',
  // 在开发环境中禁用域名验证
  ...(isDevelopment && { disableDomainCheck: true })
});

// 注意：不能直接清空 store.fonts，因为它受 MobX State Tree 保护
// 自定义字体会追加到默认字体列表中
console.log('📝 准备加载自定义字体（将追加到默认字体列表）');

window.store = store;
store.addPage();

// 加载所有自定义字体
const customFonts = [
  { fontFamily: '華康POP1體W5', url: '/fonts/華康POP1體W5.ttf' },
  { fontFamily: '華康POP1體W9', url: '/fonts/華康POP1體W9.ttf' },
  { fontFamily: '華康超特圓體', url: '/fonts/華康超特圓體.ttf' },
  { fontFamily: 'Altgotisch', url: '/fonts/Altgotisch.ttf' },
  { fontFamily: 'Boldgod Display', url: '/fonts/Boldgod Display.otf' },
  { fontFamily: 'Attack Graffiti', url: '/fonts/a Attack Graffiti.ttf' },
  { fontFamily: '3601 Brudoni Desktop', url: '/fonts/3601 Brudoni Desktop.otf' },
  { fontFamily: 'Aileron Black Italic', url: '/fonts/Aileron-BlackItalic-3.ttf' },
  { fontFamily: 'Alexbrush', url: '/fonts/Alexbrush Regular.ttf' },
  { fontFamily: 'At Askara', url: '/fonts/At Askara.otf' },
  { fontFamily: 'CAT Reporter', url: '/fonts/CAT Reporter.ttf' }
];

customFonts.forEach(font => {
  try {
    store.addFont(font);
    console.log(`✅ 已添加自定义字体: ${font.fontFamily}`);
  } catch (error) {
    console.error(`❌ 添加字体失败: ${font.fontFamily}`, error);
  }
});

console.log(`📝 已加载 ${customFonts.length} 个自定义字体`);

// 验证字体列表
setTimeout(() => {
  console.log('%c🔍 验证字体列表:', 'background: #ff6b6b; color: white; padding: 8px; font-weight: bold;');
  console.log('store.fonts 数量:', store.fonts?.length || 0);
  if (store.fonts && store.fonts.length > 0) {
    console.log('字体列表:', store.fonts.map(f => f.fontFamily || f.name));
  } else {
    console.warn('⚠️ 警告: store.fonts 为空!');
  }

  // 暴露到 window 方便调试
  window.debugFonts = () => {
    console.log('当前字体列表:', store.fonts);
    return store.fonts;
  };
  console.log('💡 提示: 在控制台输入 window.debugFonts() 可以查看当前字体列表');
}, 2000);

// 强制应用字体选择器样式
const injectFontSelectStyles = () => {
  const styleId = 'font-select-override-dynamic';

  // 移除旧样式（如果存在）
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // 创建新样式元素
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* 字体选择器动态注入样式 - 最高优先级 - 白底黑字 */
    select,
    .polotno-toolbar select,
    nav select,
    div select {
      background-color: #ffffff !important;
      background-image: none !important;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-text-fill-color: #000000 !important;
      text-shadow: none !important;
      border: 2px solid #cccccc !important;
      font-weight: 700 !important;
      font-size: 14px !important;
    }

    select option,
    .polotno-toolbar select option {
      background-color: #ffffff !important;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-text-fill-color: #000000 !important;
      font-weight: 700 !important;
      padding: 12px !important;
    }

    select option:hover,
    select option:checked {
      background-color: #1764EA !important;
      color: #ffffff !important;
    }
  `;

  document.head.appendChild(style);
  console.log('✅ 字体选择器样式已动态注入');
};

// 立即注入
injectFontSelectStyles();

// DOM加载完成后再次注入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectFontSelectStyles);
} else {
  setTimeout(injectFontSelectStyles, 100);
}

const project = createProject({ store });
window.project = project;

// 初始化完整的PSD精确系统
setTimeout(() => {
  // 1. 初始化精确渲染器
  const precisionRenderer = initializePrecisionRenderer(store);
  console.log('✅ 精确渲染器已初始化');

  // 2. 初始化Polotno文本渲染增强器
  const textRenderer = initializePolotnoTextRenderer(store);
  console.log('✅ Polotno文本渲染增强器已初始化');

  // 3. 调试器已在导入时自动初始化
  psdDebugger.log('PSD调试系统已启动');

  // 4. 强制所有 option 元素使用黑色文字
  forceOptionBlack();

  console.log('%c🎯 PSD超高精度导入系统已完全就绪', 'background: #4CAF50; color: white; padding: 8px; font-weight: bold;');
  console.log('%c📌 系统功能说明:', 'background: #2196F3; color: white; padding: 4px;');
  console.log('1. 🎨 自动应用精确样式到PSD导入元素');
  console.log('2. 🔧 深度集成Konva渲染引擎确保像素级精确');
  console.log('3. 🔍 按 Ctrl+Shift+D 开启详细调试模式');
  console.log('4. ⚡ 自动高精度字体大小、颜色、间距转换');
  console.log('%c准备导入PSD文件体验极致精确度！', 'background: #FF9800; color: white; padding: 4px;');
}, 1500);

const root = ReactDOM.createRoot(document.getElementById('root'));

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ textAlign: 'center', paddingTop: '40px' }}>
        <p>Something went wrong in the app.</p>
        <p>Try to reload the page.</p>
        <p>If it does not work, clear cache and reload.</p>
        <button
          onClick={async () => {
            await project.clear();
            window.location.reload();
          }}
        >
          Clear cache and reload
        </button>
      </div>
    </div>
  );
}

root.render(
  <ErrorBoundary
    FallbackComponent={Fallback}
    onReset={(details) => {
      // Reset the state of your app so the error doesn't happen again
    }}
    onError={(e) => {
      if (window.Sentry) {
        window.Sentry.captureException(e);
      }
    }}
  >
    <ProjectContext.Provider value={project}>
      <App store={store} />
    </ProjectContext.Provider>
  </ErrorBoundary>
);
