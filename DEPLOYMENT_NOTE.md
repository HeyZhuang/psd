# 部署更新说明 - 2025-10-07

## 🔧 最新修复

**问题**: localStorage QuotaExceededError
**解决**: 改用直接 URL 加载预设字体，不保存 Base64

## 📦 部署详情

- **部署时间**: 2025-10-07 08:12 UTC
- **构建文件**: index-BLUqPmbj.js (最新)
- **部署地址**: http://54.189.143.120:3002/

## ⚠️ 重要：需要清除浏览器缓存

由于浏览器可能缓存了旧的 JavaScript 文件，请按以下步骤操作：

### 方法 1：硬刷新（推荐）
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 方法 2：开发者工具
1. 按 `F12` 打开开发者工具
2. 切换到 `Network` 标签
3. 勾选 `Disable cache`
4. 刷新页面

### 方法 3：清除缓存
1. 浏览器设置 → 隐私与安全
2. 清除浏览数据
3. 选择"缓存的图片和文件"
4. 清除数据后重新访问

## ✅ 验证修复成功

打开浏览器控制台（F12），应该看到：
```
🎨 初始化自定义字体系统 (0 个字体)
🆕 首次启动检测到，开始自动加载预设字体...
📦 正在加载预设字体: Brudoni Desktop...
✅ Brudoni Desktop 加载成功 (预设)
...
✅ 自定义字体系统初始化完成
```

**不应该看到**：
- ❌ QuotaExceededError
- ❌ NetworkError (FileReader 相关)

## 📊 技术变更

| 项目 | 旧方案 | 新方案 |
|------|--------|--------|
| 预设字体存储 | Base64 → localStorage | 引用 → 从 /fonts 加载 |
| 存储空间 | >18MB | <100KB |
| 加载方式 | fetch + FileReader | 直接 URL |
| 用户上传 | Base64 → localStorage | Base64 → localStorage（不变）|

## 🔗 代码仓库

https://github.com/HeyZhuang/psd.git

最新提交: a0739b3
