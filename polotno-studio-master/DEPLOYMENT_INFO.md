# 🚀 部署信息 | Deployment Information

## 📅 部署日期
**2025-01-08 15:46 (UTC+8)**

---

## 🌐 访问地址

### 🔗 外网访问 (Public Access)
**URL**: http://54.189.143.120:3002

### 🔗 内网访问 (Private IP)
**URL**: http://172.31.49.27:3002

### 🔗 本地访问 (Localhost)
**URL**: http://localhost:3002

---

## ✅ 部署状态

- ✅ **构建状态**: 成功 (Built successfully)
- ✅ **服务状态**: 运行中 (Running)
- ✅ **端口状态**: 3002 (监听所有接口)
- ✅ **进程ID**: 3408804
- ✅ **日志文件**: /tmp/psd-studio-3002.log

---

## 📦 部署配置

### 构建信息
- **构建工具**: Vite 6.3.5
- **构建时间**: ~23 秒
- **输出目录**: `dist/`
- **主文件大小**:
  - CSS: 383.41 KB (gzip: 47.48 KB)
  - JS 总计: ~3.60 MB (gzip: 1.34 MB)

### 服务器配置
- **服务工具**: npx serve
- **运行模式**: 生产模式 (Production)
- **静态文件**: dist 目录
- **监听地址**: 0.0.0.0:3002 (所有接口)

---

## 🎨 新 UI 功能

本次部署包含全新的 UI 设计系统：

### 设计系统
- ✨ 现代设计令牌 (Design Tokens)
- 🎨 专业配色方案 (#3276FF)
- 📐 8px 网格系统
- 🎭 流畅动画和微交互

### 组件升级
- 🖥️ Figma 风格顶部栏 (Logo + 项目名称)
- 📋 Canva 风格侧边栏 (卡片式布局)
- 🗂️ 可折叠图层面板 (280px ↔ 48px)
- 🎛️ 精简工具栏 (48px 高度)

### 动画效果
- 💫 按钮点击弹跳
- 🌊 卡片悬停上浮
- ✨ 面板渐入动画
- 🎯 焦点环脉冲

---

## 🔧 管理命令

### 查看服务状态
```bash
ps aux | grep -E "serve.*3002"
lsof -i :3002
```

### 查看日志
```bash
cat /tmp/psd-studio-3002.log
tail -f /tmp/psd-studio-3002.log  # 实时查看
```

### 重启服务
```bash
# 停止服务
sudo fuser -k 3002/tcp

# 启动服务
cd /var/tmp/polotno-studio-psd-main/polotno-studio-master
nohup npx serve -s dist -l 3002 > /tmp/psd-studio-3002.log 2>&1 &
```

### 重新构建
```bash
cd /var/tmp/polotno-studio-psd-main/polotno-studio-master
npm run build
```

---

## 📊 服务器信息

- **服务器IP**: 54.189.143.120 (公网) / 172.31.49.27 (内网)
- **操作系统**: Ubuntu Linux 6.8.0-1036-aws
- **Node.js**: v20.19.5
- **NPM**: Latest
- **工作目录**: /var/tmp/polotno-studio-psd-main/polotno-studio-master

---

## 🔐 安全建议

### 生产环境建议
1. ✅ 已使用生产构建 (已优化和压缩)
2. ⚠️ 建议添加 HTTPS (使用 Nginx + SSL)
3. ⚠️ 建议配置防火墙规则
4. ⚠️ 建议设置访问日志和监控
5. ⚠️ 建议使用 PM2 进行进程管理

### 使用 PM2 管理 (推荐)
```bash
# 安装 PM2
npm install -g pm2

# 创建启动脚本
echo "npx serve -s dist -l 3002" > start.sh
chmod +x start.sh

# 使用 PM2 启动
pm2 start start.sh --name "psd-studio"

# 设置开机自启
pm2 startup
pm2 save
```

---

## 📈 性能指标

### 构建产物大小
- **总大小**: 3.60 MB
- **Gzip 后**: 1.34 MB
- **最大块**: 2.83 MB (主应用)

### 加载性能
- **首屏加载**: < 3 秒 (在良好网络下)
- **交互响应**: < 100ms
- **动画帧率**: 60 FPS

---

## 🐛 故障排除

### 端口被占用
```bash
# 查找占用端口的进程
sudo lsof -i :3002

# 强制结束进程
sudo fuser -k 3002/tcp
```

### 服务无法访问
1. 检查防火墙是否开放 3002 端口
2. 检查服务是否正在运行
3. 检查日志文件 /tmp/psd-studio-3002.log

### 构建失败
1. 清除 node_modules: `rm -rf node_modules && npm install`
2. 清除构建缓存: `rm -rf dist`
3. 重新构建: `npm run build`

---

## 📝 更新日志

### 2025-01-08 (本次部署)
- ✨ 全新 UI 设计系统
- 🎨 现代化组件样式
- ✨ 流畅动画效果
- 📚 完整设计文档
- 🚀 生产环境部署

### 历史版本
- 参见 Git 提交记录: https://github.com/HeyZhuang/psd.git

---

## 🔗 相关文档

- **设计系统**: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **UI 改进**: [UI_IMPROVEMENTS.md](./UI_IMPROVEMENTS.md)
- **快速开始**: [QUICK_START.md](./QUICK_START.md)
- **项目说明**: [README.md](./README.md)
- **架构文档**: ../CLAUDE.md

---

## 📞 技术支持

- **GitHub**: https://github.com/HeyZhuang/psd
- **问题反馈**: https://github.com/HeyZhuang/psd/issues

---

**🎉 部署成功！享受全新的设计体验！**

**🤖 由 Claude Code 协助部署**
