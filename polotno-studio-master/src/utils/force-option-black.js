/**
 * 强制所有 option 元素使用黑色文字
 * 这个脚本会持续监控并强制应用样式
 */

export const forceOptionBlack = () => {
  console.log('%c🔨 强制 option 黑色文字工具启动', 'background: #dc3545; color: white; padding: 8px; font-weight: bold;');

  const forceBlackStyle = () => {
    // 获取所有 option 元素
    const allOptions = document.querySelectorAll('option');

    if (allOptions.length === 0) {
      return;
    }

    console.log(`🔍 找到 ${allOptions.length} 个 option 元素，正在强制应用黑色样式...`);

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

      if (index < 5) {
        console.log(`  ✅ Option #${index + 1}: "${option.textContent.trim().substring(0, 20)}..." - 强制黑色`);
      }
    });

    console.log(`✅ 已强制应用黑色样式到所有 ${allOptions.length} 个 option 元素`);
  };

  // 立即执行
  forceBlackStyle();

  // 延迟执行多次，确保覆盖动态加载的内容
  setTimeout(forceBlackStyle, 100);
  setTimeout(forceBlackStyle, 300);
  setTimeout(forceBlackStyle, 500);
  setTimeout(forceBlackStyle, 1000);
  setTimeout(forceBlackStyle, 2000);
  setTimeout(forceBlackStyle, 3000);

  // 每 300ms 持续强制应用
  setInterval(forceBlackStyle, 300);

  // 监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    let hasOptionChanges = false;

    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.tagName === 'OPTION' || node.tagName === 'SELECT') {
              hasOptionChanges = true;
            } else if (node.querySelectorAll) {
              const options = node.querySelectorAll('option');
              if (options.length > 0) {
                hasOptionChanges = true;
              }
            }
          }
        });
      }

      // 监听 option 元素的属性变化
      if (mutation.type === 'attributes' && mutation.target.tagName === 'OPTION') {
        hasOptionChanges = true;
      }
    });

    if (hasOptionChanges) {
      console.log('🔄 检测到 option 元素变化，立即重新应用样式');
      forceBlackStyle();
      setTimeout(forceBlackStyle, 50);
      setTimeout(forceBlackStyle, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // 监听所有 select 的焦点和点击事件
  document.addEventListener('focus', (e) => {
    if (e.target.tagName === 'SELECT') {
      console.log('🎯 Select 获得焦点，强制应用样式');
      forceBlackStyle();
      setTimeout(forceBlackStyle, 10);
      setTimeout(forceBlackStyle, 50);
    }
  }, true);

  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'SELECT' || e.target.closest('select')) {
      console.log('🎯 Select 被点击，强制应用样式');
      forceBlackStyle();
      setTimeout(forceBlackStyle, 10);
      setTimeout(forceBlackStyle, 50);
    }
  }, true);

  console.log('✅ 强制 option 黑色文字工具已启动并持续监控');

  return () => {
    observer.disconnect();
  };
};
