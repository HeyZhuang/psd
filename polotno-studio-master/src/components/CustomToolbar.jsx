import React from 'react';
import { observer } from 'mobx-react-lite';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { CustomFontSelector } from './CustomFontSelector';

/**
 * 自定义工具栏 - 替换默认字体选择器为自定义字体选择器
 */
export const CustomToolbar = observer(({ store }) => {
  const toolbarRef = React.useRef(null);

  React.useEffect(() => {
    console.log('🔧 CustomToolbar: 初始化自定义工具栏');

    // 替换 Polotno 默认的字体选择器为自定义选择器
    const replaceDefaultFontSelector = () => {
      // 查找工具栏中的字体选择器（select 元素）
      const selects = document.querySelectorAll('.polotno-toolbar select, nav select');

      selects.forEach(select => {
        // 检查是否是字体选择器（包含字体选项）
        const options = select.querySelectorAll('option');
        let isFontSelector = false;

        options.forEach(option => {
          const text = option.textContent || '';
          // 检测常见字体名称
          if (text.includes('Arial') || text.includes('Roboto') || text.includes('Open Sans')) {
            isFontSelector = true;
          }
        });

        if (isFontSelector) {
          console.log('🔍 找到默认字体选择器，选项数量:', options.length);
          console.log('📋 默认字体示例:', Array.from(options).slice(0, 3).map(o => o.textContent));

          // 找到字体选择器的父容器
          const container = select.closest('div');
          if (container && !container.querySelector('.custom-font-selector-injected')) {
            console.log('✅ 准备注入自定义字体选择器');

            // 完全移除原始 select（而不是隐藏）
            select.remove();
            console.log('🗑️ 已移除默认字体选择器');

            // 创建自定义字体选择器的容器
            const customSelectorContainer = document.createElement('div');
            customSelectorContainer.className = 'custom-font-selector-injected';
            customSelectorContainer.id = 'custom-font-selector-mount';
            customSelectorContainer.style.display = 'inline-block';

            // 将自定义选择器插入到原位置
            container.appendChild(customSelectorContainer);

            console.log('✅ 自定义字体选择器容器已注入到工具栏，ID:', customSelectorContainer.id);
          }
        }
      });
    };

    // 延迟执行以确保 Polotno Toolbar 已渲染
    const timer = setTimeout(replaceDefaultFontSelector, 500);

    // 使用 MutationObserver 监听 DOM 变化（当选择不同元素时工具栏会重新渲染）
    const observer = new MutationObserver(() => {
      replaceDefaultFontSelector();
    });

    const toolbar = document.querySelector('.polotno-toolbar-container, nav');
    if (toolbar) {
      observer.observe(toolbar, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // 使用 Portal 将自定义字体选择器注入到工具栏中
  React.useEffect(() => {
    let root = null;

    const renderCustomSelector = () => {
      const mountPoint = document.getElementById('custom-font-selector-mount');

      if (mountPoint) {
        console.log('🎯 找到挂载点，准备渲染自定义字体选择器');

        // 清空挂载点
        mountPoint.innerHTML = '';

        // 动态导入 ReactDOM 并渲染
        import('react-dom/client').then(({ createRoot }) => {
          root = createRoot(mountPoint);
          root.render(<CustomFontSelector store={store} />);
          console.log('✅ 自定义字体选择器已成功渲染');
        }).catch(err => {
          console.error('❌ 渲染失败:', err);
        });
      } else {
        console.warn('⚠️ 未找到挂载点 #custom-font-selector-mount');
      }
    };

    // 延迟渲染，确保挂载点已创建
    const timer = setTimeout(renderCustomSelector, 600);

    // 监听挂载点出现
    const observer = new MutationObserver(() => {
      if (document.getElementById('custom-font-selector-mount') && !root) {
        renderCustomSelector();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      if (root) {
        root.unmount();
      }
    };
  }, [store]);

  return (
    <div ref={toolbarRef} style={{ width: '100%' }}>
      {/* Polotno 默认工具栏 */}
      <Toolbar store={store} />
    </div>
  );
});
