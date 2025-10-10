# 🚀 快速启动指南 | Quick Start Guide

## 查看新 UI 设计 | View New UI Design

### 启动开发服务器 | Start Development Server

```bash
cd polotno-studio-master
npm install  # 首次运行需要安装依赖
npm start
```

访问: **http://localhost:3002**

---

## 🎨 新 UI 特性预览 | New UI Features Preview

### 1. 现代化顶部栏
- ✨ 全新 Logo 和品牌标识
- 📝 可编辑的项目名称
- 🎯 清晰的功能分区布局

### 2. Canva 风格侧边栏
- 🎴 卡片式组件网格
- 🌊 流畅的悬停动效
- 🔍 现代化搜索框

### 3. Figma 风格图层面板
- 📂 可折叠设计 (280px ↔ 48px)
- 🌳 树状层级结构
- 🎯 快速定位和管理

### 4. 精致微动画
- 💫 按钮点击弹跳效果
- 🎭 卡片悬停上浮动画
- ✨ 面板渐入效果

---

## 📖 相关文档 | Documentation

- **设计系统**: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - 完整的设计令牌和组件规范
- **UI 改进**: [UI_IMPROVEMENTS.md](./UI_IMPROVEMENTS.md) - 详细的改进说明和对比
- **项目说明**: [README.md](./README.md) - 项目概述和功能介绍

---

## 🎯 核心改进亮点 | Key Highlights

### 设计理念
> **"比 Canva 更轻量，比普通编辑工具更专业"**

### 视觉升级
- 🎨 专业配色: 蓝色主题 (#3276FF)
- 📐 8px 网格系统
- 🌈 清爽的灰度色阶
- ✨ 柔和的阴影和圆角

### 交互升级
- ⚡ 流畅的 60fps 动画
- 🎯 精准的焦点状态
- 💡 直观的视觉反馈
- 📱 完整的响应式支持

---

## 🛠️ 自定义配置 | Customization

### 修改主题色

编辑 `src/styles/design-tokens.css`:

```css
:root {
  --primary-500: #3276FF;  /* 改为你的品牌色 */
}
```

### 调整间距

```css
:root {
  --space-4: 16px;  /* 标准间距 */
  --space-6: 24px;  /* 大间距 */
}
```

### 禁用动画

如果需要更快的性能，可以在 `src/styles/animations.css` 中注释掉不需要的动画。

---

## 💡 开发技巧 | Development Tips

### 使用设计令牌

```css
/* ❌ 不推荐 */
.my-component {
  padding: 16px;
  background: #FFFFFF;
  border-radius: 6px;
}

/* ✅ 推荐 */
.my-component {
  padding: var(--space-4);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}
```

### 应用动画类

```jsx
// 渐入动画
<div className="animate-fade-in">Content</div>

// 向上滑入
<div className="animate-fade-in-up delay-100">Content</div>

// 缩放动画
<div className="animate-scale-in">Content</div>
```

### 使用工具类

```jsx
// 圆角
<div className="rounded-lg">Content</div>

// 阴影
<div className="elevation-2">Content</div>

// 字体
<div className="font-semibold text-lg">Content</div>
```

---

## 🐛 故障排除 | Troubleshooting

### 样式未生效

1. 清除浏览器缓存 (Ctrl+Shift+R / Cmd+Shift+R)
2. 确认已导入所有样式文件 (检查 `src/index.jsx`)
3. 检查控制台是否有 CSS 错误

### 动画卡顿

1. 确认使用的是 transform 和 opacity (GPU 加速)
2. 避免动画 width/height 属性
3. 检查是否有大量 DOM 操作

### 响应式问题

1. 使用浏览器开发者工具测试不同尺寸
2. 检查媒体查询断点是否正确
3. 确认使用了弹性布局 (flexbox/grid)

---

## 📊 性能检查 | Performance Check

### Chrome DevTools

1. 打开开发者工具 (F12)
2. 切换到 Performance 标签
3. 录制页面交互
4. 检查 FPS 是否稳定在 60

### 动画性能

```javascript
// 在控制台运行
console.log('Animation FPS:',
  1000 / performance.now()
);
```

---

## 🎓 学习资源 | Learning Resources

### 设计系统参考
- [Figma Design](https://figma.com)
- [Canva Design](https://canva.com)
- [Material Design 3](https://m3.material.io/)

### CSS 技术
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Grid Layout](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [CSS Animations](https://web.dev/animations/)

### 工具
- [CSS Grid Generator](https://cssgrid-generator.netlify.app/)
- [Cubic Bezier](https://cubic-bezier.com/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 📞 获取帮助 | Get Help

### 问题反馈
- GitHub Issues: https://github.com/HeyZhuang/psd/issues
- 查看文档: [UI_IMPROVEMENTS.md](./UI_IMPROVEMENTS.md)

### 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交 Pull Request

---

## ✅ 检查清单 | Checklist

使用新 UI 前，请确认:

- [ ] Node.js 版本 >= 16
- [ ] 已运行 `npm install`
- [ ] 浏览器支持 CSS 变量 (Chrome 49+, Firefox 31+, Safari 9.1+)
- [ ] 已清除浏览器缓存

---

**🎉 享受全新的设计体验！**

**🤖 由 Claude Code 协助开发**
