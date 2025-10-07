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

    // 隐藏 Polotno 默认的字体选择器
    const hideDefaultFontSelector = () => {
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
          console.log('🔍 找到默认字体选择器，准备隐藏');
          // 隐藏整个字体选择器容器
          const container = select.closest('div');
          if (container) {
            container.style.display = 'none';
            console.log('✅ 已隐藏默认字体选择器');
          }
        }
      });
    };

    // 延迟执行以确保 Polotno Toolbar 已渲染
    const timer = setTimeout(hideDefaultFontSelector, 500);

    // 使用 MutationObserver 监听 DOM 变化（当选择不同元素时工具栏会重新渲染）
    const observer = new MutationObserver(() => {
      hideDefaultFontSelector();
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

  return (
    <div ref={toolbarRef} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {/* Polotno 默认工具栏 */}
      <Toolbar store={store} />

      {/* 自定义字体选择器 - 放在工具栏右侧 */}
      <div style={{
        marginLeft: 'auto',
        paddingRight: '16px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <CustomFontSelector store={store} />
      </div>
    </div>
  );
});
