/**
 * 强制所有 option 元素使用黑色文字
 * 这个脚本会持续监控并强制应用样式
 */

export const forceOptionBlack = () => {
  const forceBlackStyle = () => {
    // 获取所有 option 元素
    const allOptions = document.querySelectorAll('option');

    if (allOptions.length === 0) {
      return;
    }

    allOptions.forEach((option, index) => {
      // 完全移除内联样式
      option.removeAttribute('style');

      // 移除可能导致颜色变化的 class
      const classList = Array.from(option.classList);
      classList.forEach(className => {
        if (className.includes('color') || className.includes('font')) {
          option.classList.remove(className);
        }
      });

      // 使用最强的方式设置样式
      const styleText = `
        color: #000000 !important;
        -webkit-text-fill-color: #000000 !important;
        -moz-text-fill-color: #000000 !important;
        background-color: #ffffff !important;
        background: #ffffff !important;
        background-image: none !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        font-weight: 700 !important;
        font-size: 14px !important;
        padding: 10px 12px !important;
        opacity: 1 !important;
        text-shadow: none !important;
      `;

      option.setAttribute('style', styleText);

      // 再次使用 style.setProperty 确保覆盖
      option.style.setProperty('color', '#000000', 'important');
      option.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
      option.style.setProperty('-moz-text-fill-color', '#000000', 'important');
      option.style.setProperty('background-color', '#ffffff', 'important');
      option.style.setProperty('background', '#ffffff', 'important');
      option.style.setProperty('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 'important');
      option.style.setProperty('font-weight', '700', 'important');
    });
  };

  // 立即执行
  forceBlackStyle();

  // 延迟执行几次，确保覆盖动态加载的内容
  setTimeout(forceBlackStyle, 100);
  setTimeout(forceBlackStyle, 500);
  setTimeout(forceBlackStyle, 1000);

  // 监听 select 元素的变化（使用节流）
  let observerTimeout = null;
  const observer = new MutationObserver(() => {
    if (observerTimeout) return;

    observerTimeout = setTimeout(() => {
      forceBlackStyle();
      observerTimeout = null;
    }, 200);
  });

  // 只监听特定的侧边栏容器，而不是整个 body
  const targetNode = document.querySelector('.polotno-panel-container') || document.body;
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: false  // 禁用属性监听以提高性能
  });

  // 监听 select 的焦点事件（优化后只执行一次）
  document.addEventListener('focus', (e) => {
    if (e.target.tagName === 'SELECT') {
      forceBlackStyle();
      setTimeout(forceBlackStyle, 50);
    }
  }, true);

  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'SELECT' || e.target.closest('select')) {
      forceBlackStyle();
    }
  }, true);

  return () => {
    observer.disconnect();
  };
};
