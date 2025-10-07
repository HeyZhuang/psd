/**
 * 字体选择器样式修复工具
 * 确保所有 select 下拉框使用黑底白字
 */

export const applyFontSelectStyles = () => {
  console.log('%c🎨 字体选择器样式修复工具启动', 'background: #4CAF50; color: white; padding: 8px; font-weight: bold;');

  // 1. 注入全局样式
  const styleId = 'font-select-black-bg-fix';

  // 移除旧样式
  const oldStyle = document.getElementById(styleId);
  if (oldStyle) {
    oldStyle.remove();
  }

  // 创建新样式
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    /* 强制所有 select 使用白底黑字 - 超级优先级 */
    body select,
    body .bp5-select select,
    body .bp5-html-select select,
    body .polotno-toolbar select,
    body nav select,
    body div select,
    #root select,
    #root .polotno-toolbar select,
    #root nav select,
    select[class],
    select[style] {
      background-color: #ffffff !important;
      background-image: none !important;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-text-fill-color: #000000 !important;
      -moz-text-fill-color: #000000 !important;
      text-shadow: none !important;
      border: 2px solid #cccccc !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      padding: 6px 10px !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    }

    /* option 元素 - 超级强制黑色文字 */
    * option,
    html option,
    body option,
    body select option,
    #root select option,
    select[class] option,
    select[style] option,
    html body select > option,
    html body * option {
      background-color: #ffffff !important;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-text-fill-color: #000000 !important;
      -moz-text-fill-color: #000000 !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      padding: 10px 12px !important;
      line-height: 1.5 !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    }

    /* 悬停和选中状态 */
    * option:hover,
    * option:checked,
    * option:focus,
    body select option:hover,
    body select option:checked,
    body select option:focus,
    #root select option:hover,
    #root select option:checked,
    html body select > option:hover,
    html body select > option:checked {
      background-color: #1764EA !important;
      background: #1764EA !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      -moz-text-fill-color: #ffffff !important;
    }
  `;

  document.head.appendChild(style);

  // 2. 直接修改所有现有的 select 元素
  let lastSelectCount = 0;
  const applyToSelects = () => {
    const selects = document.querySelectorAll('select');

    // 只在数量变化时记录日志
    if (selects.length !== lastSelectCount) {
      console.log(`%c🔧 找到 ${selects.length} 个 select 元素，正在应用样式...`, 'background: #2196F3; color: white; padding: 4px;');
      lastSelectCount = selects.length;
    }

    if (selects.length === 0) {
      return;
    }

    selects.forEach((select, index) => {
      // 不移除 class，保留 Polotno 功能
      // 使用 setProperty 强制覆盖内联样式 - 白色背景，黑色文字
      select.style.setProperty('background-color', '#ffffff', 'important');
      select.style.setProperty('background', '#ffffff', 'important');
      select.style.setProperty('background-image', 'none', 'important');
      select.style.setProperty('color', '#000000', 'important');
      select.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
      select.style.setProperty('-moz-text-fill-color', '#000000', 'important');
      select.style.setProperty('border', '2px solid #cccccc', 'important');
      select.style.setProperty('font-weight', '700', 'important');
      select.style.setProperty('font-size', '14px', 'important');
      select.style.setProperty('text-shadow', 'none', 'important');
      select.style.setProperty('opacity', '1', 'important');
      select.style.setProperty('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 'important');

      // 修改所有 option - 白色背景，黑色文字
      const options = select.querySelectorAll('option');

      options.forEach((option, optIndex) => {
        // 移除所有内联样式，确保CSS优先级生效
        option.removeAttribute('style');

        // 强制设置样式属性
        option.style.cssText = `
          background-color: #ffffff !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          -moz-text-fill-color: #000000 !important;
          font-weight: 700 !important;
          padding: 10px !important;
          opacity: 1 !important;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        `;

        // 再次使用 setProperty 确保生效
        option.style.setProperty('background-color', '#ffffff', 'important');
        option.style.setProperty('background', '#ffffff', 'important');
        option.style.setProperty('color', '#000000', 'important');
        option.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
        option.style.setProperty('-moz-text-fill-color', '#000000', 'important');
        option.style.setProperty('font-weight', '700', 'important');
        option.style.setProperty('padding', '10px', 'important');
        option.style.setProperty('opacity', '1', 'important');
        option.style.setProperty('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 'important');
      });
    });
  };

  // 立即应用
  applyToSelects();

  // 延迟再次应用，确保Polotno渲染完成后也能覆盖
  setTimeout(applyToSelects, 100);
  setTimeout(applyToSelects, 300);
  setTimeout(applyToSelects, 500);
  setTimeout(applyToSelects, 1000);
  setTimeout(applyToSelects, 2000);
  setTimeout(applyToSelects, 3000);

  // 减少刷新频率以提高性能
  setInterval(applyToSelects, 2000);

  // 3. 使用 MutationObserver 监听新添加的 select 元素和属性变化
  const observer = new MutationObserver((mutations) => {
    let needsUpdate = false;

    mutations.forEach(mutation => {
      // 监听新增的节点
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'SELECT') {
              needsUpdate = true;
            } else if (node.querySelectorAll) {
              const selects = node.querySelectorAll('select');
              if (selects.length > 0) {
                needsUpdate = true;
              }
            }
          }
        });
      }

      // 监听属性变化（比如style属性被Polotno修改）
      if (mutation.type === 'attributes' && mutation.target.tagName === 'SELECT') {
        if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
          needsUpdate = true;
        }
      }
    });

    if (needsUpdate) {
      // 立即应用，不等待
      applyToSelects();
      // 再次延迟应用，确保覆盖
      setTimeout(applyToSelects, 10);
      setTimeout(applyToSelects, 50);
    }
  });

  // 开始监听
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // 4. 监听所有 select 的点击和焦点事件
  const addSelectListeners = () => {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      if (!select.dataset.listenerAdded) {
        select.addEventListener('focus', () => {
          applyToSelects();
          setTimeout(applyToSelects, 10);
        });
        select.addEventListener('click', () => {
          applyToSelects();
          setTimeout(applyToSelects, 10);
        });
        select.addEventListener('mousedown', () => {
          applyToSelects();
          setTimeout(applyToSelects, 10);
        });
        select.dataset.listenerAdded = 'true';
      }
    });
  };

  // 立即添加监听器
  addSelectListeners();
  // 定期检查并添加监听器到新的 select 元素（减少频率）
  setInterval(addSelectListeners, 3000);

  console.log('✅ 字体选择器样式修复已启动');

  return () => {
    observer.disconnect();
  };
};
