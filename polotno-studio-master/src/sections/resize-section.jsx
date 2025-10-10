import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, InputGroup, Checkbox, Collapse, Icon } from '@blueprintjs/core';
import MdFullscreen from '@meronex/icons/md/MdFullscreen';

// 预设尺寸分类
const PRESET_CATEGORIES = {
  social: {
    name: '📱 社交媒体',
    icon: '📱',
    sizes: [
      { name: 'Instagram Post', width: 1080, height: 1080, ratio: '1:1', tags: ['instagram', 'ig', 'square'] },
      { name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16', tags: ['instagram', 'ig', 'story', 'vertical'] },
      { name: 'Facebook Post', width: 1200, height: 630, ratio: '1.91:1', tags: ['facebook', 'fb'] },
      { name: 'Twitter Post', width: 1200, height: 675, ratio: '16:9', tags: ['twitter', 'x'] },
      { name: 'YouTube Thumbnail', width: 1280, height: 720, ratio: '16:9', tags: ['youtube', 'video'] },
      { name: 'LinkedIn Post', width: 1200, height: 627, ratio: '1.91:1', tags: ['linkedin'] },
    ]
  },
  print: {
    name: '📄 打印文档',
    icon: '📄',
    sizes: [
      { name: 'A4 (Portrait)', width: 2480, height: 3508, ratio: '√2:1', tags: ['a4', 'print', 'portrait'] },
      { name: 'A4 (Landscape)', width: 3508, height: 2480, ratio: '√2:1', tags: ['a4', 'print', 'landscape'] },
      { name: 'US Letter', width: 2550, height: 3300, ratio: '1.29:1', tags: ['letter', 'print'] },
      { name: 'A3 (Portrait)', width: 3508, height: 4961, ratio: '√2:1', tags: ['a3', 'print', 'portrait'] },
      { name: 'A5 (Portrait)', width: 1748, height: 2480, ratio: '√2:1', tags: ['a5', 'print', 'portrait'] },
    ]
  },
  screen: {
    name: '🖥️ 屏幕显示',
    icon: '🖥️',
    sizes: [
      { name: '4K Ultra HD', width: 3840, height: 2160, ratio: '16:9', tags: ['4k', 'uhd', 'screen'] },
      { name: 'Full HD', width: 1920, height: 1080, ratio: '16:9', tags: ['hd', '1080p', 'screen'] },
      { name: '2K QHD', width: 2560, height: 1440, ratio: '16:9', tags: ['2k', 'qhd', 'screen'] },
      { name: 'HD Ready', width: 1280, height: 720, ratio: '16:9', tags: ['hd', '720p', 'screen'] },
    ]
  }
};

// LocalStorage 键名
const HISTORY_KEY = 'polotno_resize_history';
const FAVORITES_KEY = 'polotno_resize_favorites';

// 获取历史记录
const getHistory = () => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (e) {
    return [];
  }
};

// 保存到历史记录
const saveToHistory = (width, height, name = null) => {
  try {
    const history = getHistory();
    const newEntry = {
      width,
      height,
      name: name || `${width}×${height}`,
      timestamp: Date.now()
    };

    // 去重：如果已存在相同尺寸，则移除旧的
    const filtered = history.filter(item => !(item.width === width && item.height === height));

    // 添加到开头，保留最近5个
    const updated = [newEntry, ...filtered].slice(0, 5);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save history:', e);
    return [];
  }
};

// 获取收藏夹
const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (e) {
    return [];
  }
};

// 添加到收藏夹
const addToFavorites = (width, height, name) => {
  try {
    const favorites = getFavorites();
    const newEntry = { width, height, name };

    // 检查是否已存在
    const exists = favorites.some(item => item.width === width && item.height === height);
    if (exists) {
      return favorites;
    }

    const updated = [...favorites, newEntry];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save favorite:', e);
    return favorites;
  }
};

// 从收藏夹移除
const removeFromFavorites = (width, height) => {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(item => !(item.width === width && item.height === height));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return favorites;
  }
};

// 计算缩放信息
const calculateScaleInfo = (currentWidth, currentHeight, targetWidth, targetHeight) => {
  const scaleX = targetWidth / currentWidth;
  const scaleY = targetHeight / currentHeight;
  const scale = Math.min(scaleX, scaleY);
  const scalePercent = (scale * 100).toFixed(1);

  let warning = null;
  let warningType = 'safe'; // 'safe', 'warning', 'danger'

  if (scale > 2) {
    warning = '⚠️ 内容将放大超过200%，可能导致图片模糊';
    warningType = 'warning';
  } else if (scale > 3) {
    warning = '⛔ 内容将放大超过300%，图片质量可能严重下降';
    warningType = 'danger';
  } else if (scale < 0.5) {
    warning = '⚠️ 内容将缩小超过50%，细节可能丢失';
    warningType = 'warning';
  } else if (scale < 0.3) {
    warning = '⛔ 内容将缩小超过70%，大量细节将丢失';
    warningType = 'danger';
  }

  const currentRatio = currentWidth / currentHeight;
  const targetRatio = targetWidth / targetHeight;
  const ratioDiff = Math.abs(currentRatio - targetRatio);

  if (ratioDiff > 0.5 && !warning) {
    warning = '⚠️ 目标比例与当前差异较大，可能需要调整布局';
    warningType = 'warning';
  }

  return {
    scale,
    scalePercent,
    scaleX,
    scaleY,
    warning,
    warningType,
    isEnlarging: scale > 1,
    isShrinking: scale < 1,
  };
};

// 智能推荐尺寸
const getRecommendations = (currentWidth, currentHeight) => {
  const currentRatio = currentWidth / currentHeight;
  const recommendations = [];

  // 收集所有预设尺寸
  const allSizes = [];
  Object.values(PRESET_CATEGORIES).forEach(category => {
    category.sizes.forEach(size => {
      allSizes.push({ ...size, category: category.name });
    });
  });

  // 计算每个尺寸与当前比例的匹配度
  const scored = allSizes.map(size => {
    const ratio = size.width / size.height;
    const ratioDiff = Math.abs(ratio - currentRatio);
    const sizeDiff = Math.abs(size.width - currentWidth) + Math.abs(size.height - currentHeight);
    const score = 1 / (1 + ratioDiff * 10 + sizeDiff / 10000);

    return { ...size, score, ratioDiff };
  });

  // 排序并取前3个
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3);
};

export const ResizePanel = observer(({ store }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedCategories, setExpandedCategories] = React.useState({
    social: true,
    print: false,
    screen: false,
    favorites: true,
    history: true,
  });

  const [selectedSize, setSelectedSize] = React.useState(null);
  const [customWidth, setCustomWidth] = React.useState(store.width.toString());
  const [customHeight, setCustomHeight] = React.useState(store.height.toString());

  const [keepAspectRatio, setKeepAspectRatio] = React.useState(false); // 默认关闭，让PSD内容完全充满画布
  const [maintainQuality, setMaintainQuality] = React.useState(false); // 默认关闭，允许图片缩放

  const [history, setHistory] = React.useState(getHistory());
  const [favorites, setFavorites] = React.useState(getFavorites());

  const [showPreview, setShowPreview] = React.useState(true);
  const [isResizing, setIsResizing] = React.useState(false); // 防止连续操作导致抖动

  // 当 store 尺寸变化时，更新自定义输入框
  React.useEffect(() => {
    setCustomWidth(store.width.toString());
    setCustomHeight(store.height.toString());
  }, [store.width, store.height]);

  // 键盘快捷键支持
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter: 应用调整
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && selectedSize && !isResizing) {
        e.preventDefault();
        handleApplyResize();
      }
      // Esc: 清除选择
      if (e.key === 'Escape' && selectedSize) {
        e.preventDefault();
        setSelectedSize(null);
      }
      // Ctrl/Cmd + F: 聚焦搜索框
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="搜索尺寸"]');
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSize, isResizing]);

  // 切换分类展开/折叠
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // 获取比例显示
  const getRatio = (width, height) => {
    const ratio = width / height;
    if (Math.abs(ratio - 1) < 0.01) return '1:1';
    if (Math.abs(ratio - 16/9) < 0.01) return '16:9';
    if (Math.abs(ratio - 9/16) < 0.01) return '9:16';
    if (Math.abs(ratio - 4/3) < 0.01) return '4:3';
    if (Math.abs(ratio - 3/2) < 0.01) return '3:2';
    return ratio.toFixed(2) + ':1';
  };

  // 获取预览尺寸信息
  const getPreviewInfo = () => {
    if (!selectedSize) return null;

    return calculateScaleInfo(
      store.width,
      store.height,
      selectedSize.width,
      selectedSize.height
    );
  };

  // 进度状态
  const [resizeProgress, setResizeProgress] = React.useState(0);
  const [resizeStatus, setResizeStatus] = React.useState('');

  // 应用尺寸调整（含内容缩放）
  const handleApplyResize = async () => {
    if (!selectedSize || isResizing) return;

    // 设置正在调整状态，防止连续点击
    setIsResizing(true);
    setResizeProgress(0);
    setResizeStatus('准备调整...');

    const { width, height } = selectedSize;
    const originalWidth = store.width;
    const originalHeight = store.height;

    // 计算画布缩放比例
    const scaleX = width / originalWidth;
    const scaleY = height / originalHeight;

    console.log(`🎨 画布缩放: ${originalWidth}×${originalHeight} → ${width}×${height}`);
    console.log(`📐 缩放比例: X=${scaleX.toFixed(3)}, Y=${scaleY.toFixed(3)}`);
    console.log(`✅ 保持元素宽高比: ${keepAspectRatio ? '是' : '否'}`);
    console.log(`🖼️ 保护图片质量: ${maintainQuality ? '是' : '否'}`);

    // 短暂延迟，显示初始状态
    await new Promise(resolve => setTimeout(resolve, 100));
    setResizeProgress(10);
    setResizeStatus('正在缩放元素...');

    let totalElements = 0;
    let imageElements = 0;
    let textElements = 0;
    let psdTextElements = 0;

    // 缩放所有元素
    store.pages.forEach((page) => {
      page.children.forEach((element) => {
        totalElements++;

        // 🔥 关键改进：位置和尺寸都按照画布实际比例缩放，确保内容完全充满画布
        const updates = {
          x: element.x * scaleX,
          y: element.y * scaleY,
        };

        // 处理元素尺寸
        if (maintainQuality && element.type === 'image') {
          // 保护图片质量：保持原始尺寸，仅调整位置
          updates.width = element.width;
          updates.height = element.height;
          imageElements++;
        } else if (keepAspectRatio) {
          // 保持元素宽高比模式（推荐）
          // 但为了充满画布，使用较大的缩放比例，内容可能会被裁剪
          const uniformScale = Math.max(scaleX, scaleY);
          updates.width = element.width * uniformScale;
          updates.height = element.height * uniformScale;
          if (element.type === 'image') {
            imageElements++;
          }
        } else {
          // 自由缩放模式（默认）：元素宽高分别按照画布比例拉伸
          // 这样可以完全充满画布，但元素可能变形
          updates.width = element.width * scaleX;
          updates.height = element.height * scaleY;
          if (element.type === 'image') {
            imageElements++;
          }
        }

        // 处理文字元素
        if (element.type === 'text') {
          textElements++;

          // 文字大小：如果保持宽高比用统一比例，否则用最小比例避免过大
          const textScale = keepAspectRatio ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

          if (element.fontSize) {
            updates.fontSize = element.fontSize * textScale;
          }
          if (element.lineHeight && typeof element.lineHeight === 'number' && element.lineHeight > 2) {
            updates.lineHeight = element.lineHeight * textScale;
          }
          if (element.letterSpacing) {
            updates.letterSpacing = element.letterSpacing * textScale;
          }

          // 处理PSD文字效果
          if (element.custom?.textEffects) {
            psdTextElements++;
            const scaledEffects = JSON.parse(JSON.stringify(element.custom.textEffects));

            // 缩放描边
            if (scaledEffects.stroke?.size) {
              scaledEffects.stroke.size *= textScale;
            }

            // 缩放外发光
            if (scaledEffects.outerGlow) {
              if (scaledEffects.outerGlow.size) scaledEffects.outerGlow.size *= textScale;
              if (scaledEffects.outerGlow.spread) scaledEffects.outerGlow.spread *= textScale;
            }

            // 缩放投影
            if (scaledEffects.dropShadow) {
              if (scaledEffects.dropShadow.distance) scaledEffects.dropShadow.distance *= textScale;
              if (scaledEffects.dropShadow.size) scaledEffects.dropShadow.size *= textScale;
              if (scaledEffects.dropShadow.spread) scaledEffects.dropShadow.spread *= textScale;
            }

            // 缩放内阴影
            if (scaledEffects.innerShadow) {
              if (scaledEffects.innerShadow.distance) scaledEffects.innerShadow.distance *= textScale;
              if (scaledEffects.innerShadow.size) scaledEffects.innerShadow.size *= textScale;
            }

            // 缩放斜面和浮雕
            if (scaledEffects.bevelEmboss) {
              if (scaledEffects.bevelEmboss.size) scaledEffects.bevelEmboss.size *= textScale;
              if (scaledEffects.bevelEmboss.depth) scaledEffects.bevelEmboss.depth *= textScale;
            }

            updates.custom = { ...element.custom, textEffects: scaledEffects };
          }
        }

        // 处理PSD图片文字（栅格化的文字）
        if (element.type === 'image' && element.custom?.isPSDText) {
          psdTextElements++;
          // 保持PSD文字图片的所有自定义属性
          if (element.custom) {
            updates.custom = { ...element.custom };
          }
        }

        // 保持其他属性
        if (element.rotation !== undefined) {
          updates.rotation = element.rotation;
        }
        if (element.opacity !== undefined) {
          updates.opacity = element.opacity;
        }

        element.set(updates);
      });
    });

    setResizeProgress(60);
    setResizeStatus('正在调整画布...');

    // 先更新画布尺寸
    store.setSize(width, height);

    setResizeProgress(80);
    setResizeStatus('正在完成布局...');

    // 延迟触发 resize 事件，避免抖动
    // 使用 requestAnimationFrame 确保在下一帧渲染
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));

      // 再等待一帧确保 Polotno 完成布局计算
      requestAnimationFrame(() => {
        console.log(`✅ 画布缩放完成:`);
        console.log(`   - 总元素: ${totalElements}`);
        console.log(`   - 图片元素: ${imageElements} ${maintainQuality ? '(质量保护已启用)' : ''}`);
        console.log(`   - 文字元素: ${textElements}`);
        console.log(`   - PSD文字效果: ${psdTextElements}`);

        setResizeProgress(100);
        setResizeStatus('完成！');

        // 完成后解除锁定，延迟400ms显示完成动画
        setTimeout(() => {
          setIsResizing(false);
          setResizeProgress(0);
          setResizeStatus('');
        }, 400);
      });
    });

    // 保存到历史记录
    const newHistory = saveToHistory(width, height, selectedSize.name);
    setHistory(newHistory);

    // 显示成功提示
    const scaleInfo = scaleX === scaleY ?
      `${(scaleX * 100).toFixed(0)}%` :
      `横向${(scaleX * 100).toFixed(0)}%, 纵向${(scaleY * 100).toFixed(0)}%`;

    showToast(`✅ 已调整为 ${width}×${height} (缩放${scaleInfo})`, 'success');
  };

  // 仅调整画布（不缩放内容）
  const handleResizeCanvasOnly = () => {
    if (!selectedSize) return;

    store.setSize(selectedSize.width, selectedSize.height);

    // 延迟触发 resize 事件，避免抖动
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // 保存到历史记录
    const newHistory = saveToHistory(selectedSize.width, selectedSize.height, selectedSize.name);
    setHistory(newHistory);

    showToast(`✅ 画布已调整为 ${selectedSize.width}×${selectedSize.height}`, 'success');
  };

  // 快捷操作：横竖转换
  const handleRotateCanvas = () => {
    const newWidth = store.height;
    const newHeight = store.width;

    store.setSize(newWidth, newHeight);
    setCustomWidth(newWidth.toString());
    setCustomHeight(newHeight.toString());

    // 延迟触发 resize 事件
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });

    showToast(`✅ 已旋转为 ${newWidth}×${newHeight}`, 'success');
  };

  // 快捷操作：2倍放大
  const handleDoubleSize = () => {
    const newWidth = store.width * 2;
    const newHeight = store.height * 2;

    if (newWidth > 10000 || newHeight > 10000) {
      showToast('⚠️ 尺寸超出最大限制 (10000px)', 'warning');
      return;
    }

    console.log('🔍 2倍放大开始...');

    // 缩放所有内容
    store.pages.forEach((page) => {
      page.children.forEach((element) => {
        const updates = {
          x: element.x * 2,
          y: element.y * 2,
          width: element.width * 2,
          height: element.height * 2,
        };

        // 处理文字元素
        if (element.type === 'text') {
          updates.fontSize = (element.fontSize || 14) * 2;
          if (element.letterSpacing) {
            updates.letterSpacing = element.letterSpacing * 2;
          }
          if (element.lineHeight && typeof element.lineHeight === 'number' && element.lineHeight > 2) {
            updates.lineHeight = element.lineHeight * 2;
          }

          // 处理PSD文字效果
          if (element.custom?.textEffects) {
            const scaledEffects = JSON.parse(JSON.stringify(element.custom.textEffects));
            if (scaledEffects.stroke?.size) scaledEffects.stroke.size *= 2;
            if (scaledEffects.outerGlow?.size) scaledEffects.outerGlow.size *= 2;
            if (scaledEffects.outerGlow?.spread) scaledEffects.outerGlow.spread *= 2;
            if (scaledEffects.dropShadow?.distance) scaledEffects.dropShadow.distance *= 2;
            if (scaledEffects.dropShadow?.size) scaledEffects.dropShadow.size *= 2;
            if (scaledEffects.innerShadow?.distance) scaledEffects.innerShadow.distance *= 2;
            if (scaledEffects.innerShadow?.size) scaledEffects.innerShadow.size *= 2;
            if (scaledEffects.bevelEmboss?.size) scaledEffects.bevelEmboss.size *= 2;
            if (scaledEffects.bevelEmboss?.depth) scaledEffects.bevelEmboss.depth *= 2;

            updates.custom = { ...element.custom, textEffects: scaledEffects };
          }
        }

        // 保持旋转和透明度
        if (element.rotation !== undefined) {
          updates.rotation = element.rotation;
        }
        if (element.opacity !== undefined) {
          updates.opacity = element.opacity;
        }

        element.set(updates);
      });
    });

    store.setSize(newWidth, newHeight);

    // 延迟触发 resize 事件，避免抖动
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      console.log(`✅ 2倍放大完成: ${newWidth}×${newHeight}`);
    });

    showToast(`✅ 已放大为 ${newWidth}×${newHeight}`, 'success');
  };

  // Toast 提示
  const showToast = (message, type = 'info') => {
    const colors = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    };

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors[type]};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10001;
      font-size: 14px;
      font-weight: 500;
      animation: slideDown 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease-out';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  // 搜索过滤 - 使用 useMemo 优化性能
  const filterSizes = React.useCallback((sizes) => {
    if (!searchQuery) return sizes;
    const query = searchQuery.toLowerCase().trim();
    return sizes.filter(size =>
      size.name.toLowerCase().includes(query) ||
      size.tags?.some(tag => tag.includes(query)) ||
      `${size.width}x${size.height}`.includes(query) ||
      `${size.width}×${size.height}`.includes(query) ||
      size.ratio?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 收藏/取消收藏
  const toggleFavorite = (size) => {
    const isFavorited = favorites.some(f => f.width === size.width && f.height === size.height);

    if (isFavorited) {
      const newFavorites = removeFromFavorites(size.width, size.height);
      setFavorites(newFavorites);
      showToast('已从收藏夹移除', 'info');
    } else {
      const newFavorites = addToFavorites(size.width, size.height, size.name);
      setFavorites(newFavorites);
      showToast('✨ 已添加到收藏夹', 'success');
    }
  };

  // 渲染尺寸卡片
  const renderSizeCard = (size, category = null) => {
    const isSelected = selectedSize?.width === size.width && selectedSize?.height === size.height;
    const isFavorited = favorites.some(f => f.width === size.width && f.height === size.height);

    return (
      <div
        key={`${size.width}-${size.height}-${size.name}`}
        onClick={() => setSelectedSize(size)}
        style={{
          padding: '10px',
          cursor: 'pointer',
          borderRadius: '8px',
          border: isSelected ? '2px solid #667eea' : '1px solid #e5e7eb',
          backgroundColor: isSelected ? '#f0f4ff' : 'white',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          transform: 'translateY(0)',
          boxShadow: isSelected ? '0 2px 8px rgba(102, 126, 234, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
          }
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '4px'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#1f2937',
            lineHeight: '1.3',
            flex: 1
          }}>
            {size.name}
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(size);
            }}
            style={{
              fontSize: '16px',
              cursor: 'pointer',
              padding: '0 4px',
              opacity: isFavorited ? 1 : 0.3,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => {
              if (!isFavorited) e.currentTarget.style.opacity = '0.3';
            }}
          >
            {isFavorited ? '⭐' : '☆'}
          </div>
        </div>
        <div style={{
          fontSize: '11px',
          color: '#6b7280',
          marginBottom: '2px'
        }}>
          {size.width} × {size.height}
        </div>
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          fontWeight: '500'
        }}>
          {size.ratio || getRatio(size.width, size.height)}
        </div>
      </div>
    );
  };

  // 智能推荐 - 使用 useMemo 缓存计算结果
  const recommendations = React.useMemo(() =>
    getRecommendations(store.width, store.height),
    [store.width, store.height]
  );

  // 预览信息 - 实时计算并缓存
  const previewInfo = React.useMemo(() => {
    if (!selectedSize) return null;
    return calculateScaleInfo(
      store.width,
      store.height,
      selectedSize.width,
      selectedSize.height
    );
  }, [selectedSize, store.width, store.height]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* 当前画布尺寸 */}
        <div style={{
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '16px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        }}>
          <div style={{
            fontSize: '11px',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: '500',
            opacity: 0.9
          }}>
            当前画布
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            marginBottom: '6px',
          }}>
            {store.width} × {store.height}
            <span style={{ fontSize: '12px', fontWeight: '500', marginLeft: '4px', opacity: 0.8 }}>px</span>
          </div>
          <div style={{
            fontSize: '11px',
            display: 'inline-block',
            background: 'rgba(255,255,255,0.25)',
            padding: '3px 10px',
            borderRadius: '10px',
            fontWeight: '500'
          }}>
            📐 {getRatio(store.width, store.height)}
          </div>
        </div>

        {/* 搜索框 */}
        <div style={{ marginBottom: '16px' }}>
          <InputGroup
            leftIcon="search"
            placeholder="搜索尺寸 (如: instagram, 1080, 16:9)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: '13px' }}
            rightElement={
              searchQuery ? (
                <Button
                  minimal
                  small
                  icon="cross"
                  onClick={() => setSearchQuery('')}
                  style={{ marginRight: '4px' }}
                />
              ) : (
                <span style={{
                  fontSize: '10px',
                  color: '#9ca3af',
                  marginRight: '8px',
                  fontWeight: '500'
                }}>
                  Ctrl+F
                </span>
              )
            }
          />
        </div>

        {/* 智能推荐 */}
        {!searchQuery && recommendations.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>💡</span>
              <span>智能推荐</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {recommendations.map(size => renderSizeCard(size))}
            </div>
          </div>
        )}

        {/* 收藏夹 */}
        {favorites.length > 0 && !searchQuery && (
          <div style={{ marginBottom: '16px' }}>
            <div
              onClick={() => toggleCategory('favorites')}
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '6px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a'
              }}
            >
              <span>⭐ 收藏夹 ({favorites.length})</span>
              <Icon icon={expandedCategories.favorites ? 'chevron-up' : 'chevron-down'} size={14} />
            </div>
            <Collapse isOpen={expandedCategories.favorites}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '8px' }}>
                {favorites.map(size => renderSizeCard(size))}
              </div>
            </Collapse>
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && !searchQuery && (
          <div style={{ marginBottom: '16px' }}>
            <div
              onClick={() => toggleCategory('history')}
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6'
              }}
            >
              <span>📜 最近使用 ({history.length})</span>
              <Icon icon={expandedCategories.history ? 'chevron-up' : 'chevron-down'} size={14} />
            </div>
            <Collapse isOpen={expandedCategories.history}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '8px' }}>
                {history.map((size, index) => {
                  const timeAgo = Date.now() - size.timestamp;
                  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
                  const daysAgo = Math.floor(timeAgo / (1000 * 60 * 60 * 24));
                  const timeText = daysAgo > 0 ? `${daysAgo}天前` : hoursAgo > 0 ? `${hoursAgo}小时前` : '刚刚';

                  return (
                    <div key={index} style={{ position: 'relative' }}>
                      {renderSizeCard(size)}
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        fontSize: '9px',
                        color: '#9ca3af',
                        backgroundColor: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {timeText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Collapse>
          </div>
        )}

        {/* 预设尺寸分类 */}
        {Object.entries(PRESET_CATEGORIES).map(([key, category]) => {
          const filteredSizes = filterSizes(category.sizes);
          if (filteredSizes.length === 0) return null;

          return (
            <div key={key} style={{ marginBottom: '16px' }}>
              <div
                onClick={() => toggleCategory(key)}
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#f3f4f6'
                }}
              >
                <span>{category.name} ({filteredSizes.length})</span>
                <Icon icon={expandedCategories[key] ? 'chevron-up' : 'chevron-down'} size={14} />
              </div>
              <Collapse isOpen={expandedCategories[key]}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '8px' }}>
                  {filteredSizes.map(size => renderSizeCard(size, category.name))}
                </div>
              </Collapse>
            </div>
          );
        })}

        {/* 自定义尺寸 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px',
          }}>
            ✏️ 自定义尺寸
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '8px',
            alignItems: 'center'
          }}>
            <InputGroup
              type="number"
              value={customWidth}
              onChange={(e) => {
                setCustomWidth(e.target.value);
                const w = parseInt(e.target.value);
                const h = parseInt(customHeight);
                if (w > 0 && h > 0) {
                  setSelectedSize({ width: w, height: h, name: '自定义' });
                }
              }}
              placeholder="宽度"
              min="1"
              max="10000"
              style={{ fontSize: '13px' }}
            />
            <Button
              minimal
              icon="swap-horizontal"
              onClick={handleRotateCanvas}
              title="交换宽高"
              style={{ minWidth: '32px', padding: '5px' }}
            />
            <InputGroup
              type="number"
              value={customHeight}
              onChange={(e) => {
                setCustomHeight(e.target.value);
                const w = parseInt(customWidth);
                const h = parseInt(e.target.value);
                if (w > 0 && h > 0) {
                  setSelectedSize({ width: w, height: h, name: '自定义' });
                }
              }}
              placeholder="高度"
              min="1"
              max="10000"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* 快捷操作 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px',
          }}>
            ⚡ 快捷操作
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              small
              icon="refresh"
              onClick={handleRotateCanvas}
              style={{ fontSize: '12px' }}
            >
              横竖转换
            </Button>
            <Button
              small
              icon="zoom-in"
              onClick={handleDoubleSize}
              style={{ fontSize: '12px' }}
            >
              2倍放大
            </Button>
          </div>
        </div>

        {/* 实时预览 */}
        {selectedSize && showPreview && previewInfo && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: previewInfo.warningType === 'danger' ? '#fef2f2' :
                           previewInfo.warningType === 'warning' ? '#fffbeb' : '#f0fdf4',
            borderRadius: '8px',
            border: `1px solid ${previewInfo.warningType === 'danger' ? '#fecaca' :
                                 previewInfo.warningType === 'warning' ? '#fde68a' : '#bbf7d0'}`
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>🔍 预览效果</span>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>
                {previewInfo.isEnlarging ? '放大' : previewInfo.isShrinking ? '缩小' : '不变'} {previewInfo.scalePercent}%
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
              {store.width} × {store.height} → {selectedSize.width} × {selectedSize.height}
            </div>
            {previewInfo.warning && (
              <div style={{
                fontSize: '11px',
                color: previewInfo.warningType === 'danger' ? '#dc2626' : '#d97706',
                marginTop: '8px',
                fontWeight: '500',
                lineHeight: '1.4'
              }}>
                {previewInfo.warning}
              </div>
            )}
          </div>
        )}

        {/* 缩放选项 */}
        <div style={{
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '10px'
          }}>
            ⚙️ 缩放选项
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <Checkbox
                checked={keepAspectRatio}
                onChange={(e) => setKeepAspectRatio(e.target.checked)}
                label={
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                    保持元素宽高比
                  </span>
                }
              />
              <div style={{ fontSize: '10px', color: '#6b7280', marginLeft: '24px', marginTop: '2px' }}>
                {keepAspectRatio ?
                  '✅ 元素不会变形，但可能被裁剪或留空白' :
                  '⚠️ 元素随画布比例拉伸，完全充满画布（推荐PSD）'}
              </div>
            </div>
            <div>
              <Checkbox
                checked={maintainQuality}
                onChange={(e) => setMaintainQuality(e.target.checked)}
                label={
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                    保护图片质量
                  </span>
                }
              />
              <div style={{ fontSize: '10px', color: '#6b7280', marginLeft: '24px', marginTop: '2px' }}>
                图片保持原始尺寸，仅调整位置（可能留空白）
              </div>
            </div>
          </div>

          {/* 说明提示 */}
          <div style={{
            marginTop: '10px',
            padding: '8px',
            backgroundColor: keepAspectRatio ? '#fffbeb' : '#ecfdf5',
            borderRadius: '6px',
            borderLeft: `2px solid ${keepAspectRatio ? '#f59e0b' : '#10b981'}`
          }}>
            <div style={{ fontSize: '10px', color: keepAspectRatio ? '#92400e' : '#065f46', lineHeight: '1.5' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {keepAspectRatio ? '⚠️ 保持宽高比模式' : '✅ 自由缩放模式（推荐PSD）'}
              </div>
              {keepAspectRatio ? (
                <>
                  <div>• 元素按统一比例缩放，不会变形</div>
                  <div>• 可能会有空白区域或内容被裁剪</div>
                  <div>• 适合保持设计完整性</div>
                </>
              ) : (
                <>
                  <div>• 所有元素严格按画布比例缩放</div>
                  <div>• 内容完全充满画布，无空白区域</div>
                  <div>• 文字效果同步缩放，保持原始布局</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* 进度指示器 */}
        {isResizing && (
          <div style={{
            marginBottom: '8px',
            padding: '10px',
            backgroundColor: '#f0f9ff',
            borderRadius: '6px',
            border: '1px solid #bfdbfe',
            animation: 'fadeIn 0.2s ease-in'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#1e40af' }}>
                {resizeStatus}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#1e40af' }}>
                {resizeProgress}%
              </span>
            </div>
            <div style={{
              height: '4px',
              backgroundColor: '#dbeafe',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
                width: `${resizeProgress}%`,
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: resizeProgress === 100 ? '0 0 8px rgba(59, 130, 246, 0.6)' : 'none'
              }} />
            </div>
          </div>
        )}

        <Button
          fill
          disabled={!selectedSize || isResizing}
          onClick={handleApplyResize}
          intent="primary"
          loading={isResizing}
          style={{
            height: '36px',
            fontWeight: '500',
            fontSize: '13px',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          {isResizing ? '调整中...' : selectedSize ? `调整为 ${selectedSize.width}×${selectedSize.height}` : '请选择尺寸'}
          {!isResizing && selectedSize && (
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '9px',
              opacity: 0.7,
              fontWeight: '400'
            }}>
              Ctrl+⏎
            </span>
          )}
        </Button>
        <Button
          fill
          disabled={!selectedSize || isResizing}
          onClick={handleResizeCanvasOnly}
          style={{
            height: '32px',
            fontSize: '12px',
            transition: 'all 0.2s ease',
          }}
        >
          仅调整画布（不缩放内容）
        </Button>
      </div>
    </div>
  );
});

export const ResizeSection = {
  name: 'resize',
  Tab: observer((props) => (
    <SectionTab name="尺寸调整" {...props}>
      <MdFullscreen />
    </SectionTab>
  )),
  Panel: ResizePanel,
};
