# PSD 自动缩放功能说明

## 功能概述

PSD 导入时会自动适配当前画布尺寸，保持所有图层的相对位置和比例关系不变。

## 实现方式

### 缩放策略：智能适配（保持宽高比）

使用 `Math.min()` 选择较小的缩放比例，确保整个 PSD 内容完整显示在画布中：

```javascript
const scale = Math.min(
  currentCanvasWidth / psdWidth,
  currentCanvasHeight / psdHeight
);
```

### 缩放范围

所有图层元素都会按相同比例缩放，包括：

1. **位置坐标**：`x`, `y`
2. **尺寸**：`width`, `height`
3. **文字属性**：
   - `fontSize` - 字体大小
   - `strokeWidth` - 描边宽度
4. **文字效果**（如果存在）：
   - 描边（stroke）的 `size`
   - 外发光（outerGlow）的 `size`
   - 投影（dropShadow）的 `distance`, `size`, `spread`
   - 内阴影（innerShadow）的 `distance`, `size`
   - 斜面和浮雕（bevelEmboss）的 `depth`, `size`
5. **其他属性**：
   - `cornerRadius` - 圆角半径

## 使用示例

### 场景 1：导入大尺寸 PSD 到小画布

```
当前画布：1080 × 1080 px
PSD 文件：3000 × 2000 px

自动缩放比例：1080 / 3000 = 0.36 (36%)
适配后尺寸：1080 × 720 px
```

### 场景 2：导入小尺寸 PSD 到大画布

```
当前画布：3840 × 2160 px (4K)
PSD 文件：1920 × 1080 px (Full HD)

自动缩放比例：1920 / 1920 = 1.0 (100%)
或：2160 / 1080 = 2.0 (200%)
取较小值：1.0 (保持原始尺寸)
```

### 场景 3：宽高比不同的 PSD

```
当前画布：1080 × 1080 px (正方形)
PSD 文件：1920 × 1080 px (16:9)

X 轴缩放：1080 / 1920 = 0.5625 (56.25%)
Y 轴缩放：1080 / 1080 = 1.0 (100%)
实际缩放：取较小值 0.5625 (56.25%)

适配后尺寸：1080 × 607.5 px
```

## 功能特点

### ✅ 优点

1. **保持布局结构**：所有图层的相对位置和比例关系完全保持不变
2. **完整显示**：整个 PSD 内容都会显示在画布中，不会被裁剪
3. **自动计算**：无需手动调整，系统自动选择最佳缩放比例
4. **效果同步**：文字效果（描边、阴影等）也会同步缩放
5. **保持画布**：不改变当前画布尺寸，PSD 适应画布

### 📝 注意事项

1. **画布尺寸**：确保在导入 PSD 前设置好目标画布尺寸
2. **图片质量**：
   - 缩小（scale < 1）：图像质量保持良好
   - 放大（scale > 1）：可能出现模糊，建议 PSD 尺寸不要小于画布
3. **极端比例**：
   - 如果 PSD 比画布大很多（>10倍），可能导致细节丢失
   - 如果 PSD 比画布小很多（<0.1倍），可能导致锯齿

## 调试信息

导入 PSD 时，控制台会输出详细的缩放信息：

```
当前画布尺寸: 1080 x 1080
PSD文件尺寸: 3000 x 2000
🎯 PSD自动缩放比例: 0.360 (36.0%)
   原始尺寸: 3000 × 2000 px
   适配后尺寸: 1080 × 720 px
```

每个文字图层还会显示字号缩放信息：

```
📝 文字字号缩放: 48.0 → 17.3 px
✨ 文字效果已缩放
```

## 代码位置

实现位置：`src/file.js` - `loadPSDFile()` 函数

核心代码段：
```javascript
// 计算缩放比例
const scale = Math.min(
  currentCanvasWidth / psdWidth,
  currentCanvasHeight / psdHeight
);

// 应用到每个元素
element.x = (element.x || 0) * scale;
element.y = (element.y || 0) * scale;
element.width *= scale;
element.height *= scale;
if (element.fontSize) {
  element.fontSize *= scale;
}
```

## 与原有功能的对比

### 之前（修改前）

```javascript
// 设置画布为 PSD 原始尺寸
store.setSize(psd.width, psd.height);

// 图层按原始坐标和尺寸导入
store.activePage.addElement(element);
```

结果：画布尺寸被 PSD 覆盖，如果 PSD 很大，画布也会变得很大。

### 现在（修改后）

```javascript
// 保持当前画布尺寸不变
// 计算缩放比例
const scale = Math.min(
  currentCanvasWidth / psdWidth,
  currentCanvasHeight / psdHeight
);

// 所有图层按比例缩放后导入
element.x *= scale;
element.y *= scale;
element.width *= scale;
element.height *= scale;
```

结果：画布尺寸不变，PSD 自动适配画布，保持原始布局结构。

## 未来扩展建议

如果需要更多导入模式，可以考虑添加：

1. **填充模式**：使用 `Math.max()` 填充整个画布（可能裁剪）
2. **拉伸模式**：X 和 Y 轴分别缩放（不保持宽高比）
3. **居中模式**：缩放后在画布中居中显示
4. **原始尺寸**：不缩放，调整画布为 PSD 尺寸（恢复原有行为）
5. **用户选择**：导入前弹出对话框让用户选择模式

这些扩展可以参考设计方案文档中的"方案一"实现。
