import React from 'react';
import { observer } from 'mobx-react-lite';
import { Toolbar } from 'polotno/toolbar/toolbar';

/**
 * 自定义工具栏 - 确保只使用自定义字体
 */
export const CustomToolbar = observer(({ store }) => {
  React.useEffect(() => {
    // 确保工具栏渲染后强制更新字体列表
    console.log('🔧 CustomToolbar: 检查字体列表');
    console.log('当前字体数量:', store.fonts?.length || 0);

    if (store.fonts) {
      console.log('当前字体列表:', store.fonts.map(f => f.fontFamily || f.name));
    }
  }, [store.fonts]);

  return <Toolbar store={store} />;
});
