# Workspace 调试指南

## 问题：页面编辑区看不到任何元素

### 请按以下步骤检查：

## 1. 打开浏览器控制台

访问 http://localhost:3002 并按 F12 打开开发者工具，然后：

### 检查控制台日志

应该看到以下日志：
```
📝 准备加载自定义字体
🔍 App mounted with store: [Object]
📄 Store pages: [Array]
📄 Active page: [Object]
📐 Store dimensions: { width: ..., height: ... }
✅ Active page found: { width: ..., height: ..., children: ... }
📄 Adding test element to page...
✅ Test element added. Page children: 1
```

### 检查DOM结构

在 Elements 标签中检查：
1. `.polotno-workspace-wrap` - 应该存在
2. `.polotno-workspace-container` - 应该存在
3. `.konvajs-content` - Konva 画布容器
4. `canvas` 元素 - 实际的画布

### 运行调试命令

在控制台中运行：
```javascript
// 检查 store
console.log('Store:', window.store);
console.log('Pages:', window.store.pages);
console.log('Active page:', window.store.activePage);
console.log('Elements:', window.store.activePage?.children);

// 检查 DOM
const workspace = document.querySelector('.polotno-workspace-container');
console.log('Workspace:', workspace);
console.log('Workspace computed style:', workspace ? window.getComputedStyle(workspace) : null);

// 检查 Canvas
const canvas = document.querySelector('.konvajs-content');
console.log('Konva canvas:', canvas);
console.log('Canvas dimensions:', canvas ? { width: canvas.offsetWidth, height: canvas.offsetHeight } : null);

// 检查画布是否有内容
const canvasElement = document.querySelector('canvas');
console.log('Canvas element:', canvasElement);
if (canvasElement) {
  console.log('Canvas size:', canvasElement.width, 'x', canvasElement.height);
}
```

## 2. 检查 CSS 样式

### 关键的 CSS 选择器

在 Elements 标签中选中 `.polotno-workspace-container`，检查 Computed 样式：

- `display`: 应该是 `flex`
- `overflow`: 应该是 `visible`
- `width`: 应该有值
- `height`: 应该有值
- `opacity`: 应该是 `1`
- `visibility`: 应该是 `visible`

## 3. 常见问题排查

### 问题A: 看不到测试文字元素
- 检查是否有黑色文字在白色背景上（可能不可见）
- 尝试添加彩色元素：
  ```javascript
  window.store.activePage.addElement({
    type: 'text',
    x: 200,
    y: 200,
    fontSize: 60,
    text: '🎨 彩色测试',
    fill: '#FF0000', // 红色
  });
  ```

### 问题B: Canvas 大小为 0
- 检查父容器的高度
- 运行：
  ```javascript
  const wrap = document.querySelector('.polotno-workspace-wrap');
  console.log('Workspace Wrap dimensions:', wrap.offsetWidth, 'x', wrap.offsetHeight);
  ```

### 问题C: Konva 未初始化
- 检查是否有 JavaScript 错误
- 检查 Polotno 版本和兼容性

## 4. 强制刷新

如果修改了 CSS 但没有生效：
1. 按 Ctrl+Shift+R（Windows/Linux）或 Cmd+Shift+R（Mac）强制刷新
2. 清除浏览器缓存
3. 在无痕模式中打开

## 5. 临时禁用所有 CSS 优化

在浏览器控制台运行：
```javascript
// 移除可能影响的 CSS
const style = document.createElement('style');
style.textContent = `
  .polotno-workspace-wrap,
  .polotno-workspace-container,
  .konvajs-content {
    all: unset !important;
    display: flex !important;
    flex: 1 !important;
    width: 100% !important;
    height: 100% !important;
  }
`;
document.head.appendChild(style);
```

## 6. 检查页面结构

预期的 DOM 结构：
```
.polotno-app-container
  .polotno-side-panel-wrap
    (侧边栏内容)
  .polotno-workspace-wrap
    .polotno-toolbar-container
      (工具栏)
    .polotno-workspace-container
      .konvajs-content
        canvas (画布)
    .polotno-zoom-buttons-container
      (缩放按钮)
    .polotno-pages-timeline
      (页面时间轴)
```

## 下一步

根据上述检查结果，将信息反馈给我，我会针对性地修复问题。
