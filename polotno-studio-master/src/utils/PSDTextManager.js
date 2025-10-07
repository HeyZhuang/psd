import React from 'react';
import ReactDOM from 'react-dom/client';
import { PSDTextEditor } from '../components/PSDTextEditor.jsx';

class PSDTextManager {
  constructor() {
    this.store = null;
    this.activeEditor = null;
    this.editorRoot = null;
    this.isInitialized = false;
  }

  // 初始化文字管理器
  initialize(store) {
    if (this.isInitialized) return;
    
    this.store = store;
    this.setupDoubleClickHandler();
    this.setupElementObserver();
    this.isInitialized = true;
    
    console.log('PSD文字管理器已初始化');
  }

  // 设置双击事件监听器
  setupDoubleClickHandler() {
    // 等待Polotno画布加载完成
    const waitForCanvas = () => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        this.setupCanvasDoubleClick(canvas);
      } else {
        setTimeout(waitForCanvas, 100);
      }
    };
    
    // 延迟等待画布创建
    setTimeout(waitForCanvas, 1000);
  }

  // 设置画布双击事件
  setupCanvasDoubleClick(canvas) {
    let clickCount = 0;
    let clickTimer = null;

    const handleCanvasClick = (event) => {
      clickCount++;
      
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 300);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        
        // 双击事件处理
        const selectedElement = this.store.selectedElements[0];
        if (selectedElement && selectedElement.type === 'text' && this.isPSDTextElement(selectedElement)) {
          this.openTextEditor(selectedElement);
        }
      }
    };

    canvas.addEventListener('click', handleCanvasClick);
    console.log('画布双击监听器已设置');
    
    // 添加快捷键支持 (Enter键)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
        const selectedElement = this.store.selectedElements[0];
        if (selectedElement && selectedElement.type === 'text' && this.isPSDTextElement(selectedElement)) {
          event.preventDefault();
          this.openTextEditor(selectedElement);
        }
      }
    });
  }

  // 设置元素观察器
  setupElementObserver() {
    if (!this.store) return;

    // 监听元素选择变化
    const checkSelectedElement = () => {
      const selectedElement = this.store.selectedElements[0];
      if (selectedElement && selectedElement.type === 'text' && this.isPSDTextElement(selectedElement)) {
        this.addTextEditHint(selectedElement);
      } else {
        this.removeTextEditHint();
      }
    };

    // 使用MobX的autorun来监听选择变化（性能更好）
    if (this.store.selectedElements) {
      const { autorun } = require('mobx');
      autorun(() => {
        // 访问selectedElements触发MobX的依赖追踪
        const selected = this.store.selectedElements.slice();
        checkSelectedElement();
      });
    }

    console.log('元素观察器已设置');
  }

  // 显示文字编辑提示
  addTextEditHint(element) {
    this.removeTextEditHint(); // 先移除已有的提示
    
    const isPSDText = element.custom?.fromPSD || element.custom?.fromTextLayer;
    if (!isPSDText) return; // 只为PSD文字显示提示

    const hint = document.createElement('div');
    hint.id = 'psd-text-edit-hint';
    hint.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 15000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    hint.innerHTML = '📝 双击或按Enter编辑PSD文字';
    hint.onclick = () => this.openTextEditor(element);
    
    hint.onmouseenter = () => {
      hint.style.transform = 'translateY(-2px)';
      hint.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
    };
    
    hint.onmouseleave = () => {
      hint.style.transform = 'translateY(0)';
      hint.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    };
    
    document.body.appendChild(hint);
    
    // 3秒后自动消失
    setTimeout(() => {
      this.removeTextEditHint();
    }, 3000);
  }

  // 移除文字编辑提示
  removeTextEditHint() {
    const hint = document.getElementById('psd-text-edit-hint');
    if (hint) {
      hint.remove();
    }
  }

  // 打开文字编辑器
  openTextEditor(element) {
    console.log('尝试打开文字编辑器:', {
      element: element,
      text: element.text,
      isPSD: this.isPSDTextElement(element),
      custom: element.custom
    });

    if (this.activeEditor) {
      console.log('关闭现有编辑器');
      this.closeTextEditor();
    }

    try {
      // 创建编辑器容器
      const editorContainer = document.createElement('div');
      editorContainer.id = 'psd-text-editor-container';
      
      // 添加遮罩层
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 19999;
      `;
      
      overlay.onclick = () => this.closeTextEditor();
      
      document.body.appendChild(overlay);
      document.body.appendChild(editorContainer);
      
      // 创建React根节点并渲染编辑器
      this.editorRoot = ReactDOM.createRoot(editorContainer);
      this.editorRoot.render(
        React.createElement(PSDTextEditor, {
          element: element,
          store: this.store,
          onClose: () => this.closeTextEditor()
        })
      );
      
      this.activeEditor = editorContainer;
      this.removeTextEditHint(); // 移除提示
      
      console.log('✅ 文字编辑器已打开:', element.text);
    } catch (error) {
      console.error('❌ 打开文字编辑器失败:', error);
      alert('打开文字编辑器失败: ' + error.message);
    }
  }

  // 关闭文字编辑器
  closeTextEditor() {
    if (this.editorRoot) {
      this.editorRoot.unmount();
      this.editorRoot = null;
    }
    
    if (this.activeEditor) {
      this.activeEditor.remove();
      this.activeEditor = null;
    }
    
    // 移除遮罩层
    const overlay = document.querySelector('div[style*="rgba(0,0,0,0.5)"]');
    if (overlay) {
      overlay.remove();
    }
    
    console.log('文字编辑器已关闭');
  }

  // 检查元素是否为PSD文字
  isPSDTextElement(element) {
    return element && 
           element.type === 'text' && 
           (element.custom?.fromPSD || element.custom?.fromTextLayer);
  }

  // 获取所有PSD文字元素
  getAllPSDTextElements() {
    if (!this.store || !this.store.pages) return [];
    
    const allElements = [];
    this.store.pages.forEach(page => {
      page.children.forEach(element => {
        if (this.isPSDTextElement(element)) {
          allElements.push(element);
        }
      });
    });
    
    return allElements;
  }

  // 批量编辑PSD文字
  batchEditPSDText() {
    const psdTextElements = this.getAllPSDTextElements();
    
    if (psdTextElements.length === 0) {
      alert('没有找到PSD文字元素');
      return;
    }

    // 显示批量编辑界面
    this.showBatchEditDialog(psdTextElements);
  }

  // 显示批量编辑对话框
  showBatchEditDialog(elements) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.6); z-index: 20000; display: flex; 
      align-items: center; justify-content: center;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white; padding: 20px; border-radius: 12px; 
      max-width: 600px; width: 90%; max-height: 80%; overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    `;
    
    dialog.innerHTML = `
      <h3 style="margin-top: 0;">批量编辑PSD文字 (${elements.length}个)</h3>
      <div id="text-list" style="margin: 20px 0;"></div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="cancel-batch" style="padding: 8px 16px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">
          取消
        </button>
        <button id="apply-batch" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          应用更改
        </button>
      </div>
    `;
    
    const textList = dialog.querySelector('#text-list');
    elements.forEach((element, index) => {
      const textItem = document.createElement('div');
      textItem.style.cssText = `
        border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-bottom: 8px;
        background: #f9f9f9;
      `;
      
      textItem.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 8px;">文字 ${index + 1}</div>
        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
          原始: ${element.custom?.originalText || element.text}
        </div>
        <textarea 
          data-index="${index}"
          style="width: 100%; height: 60px; padding: 6px; border: 1px solid #ccc; border-radius: 4px;"
        >${element.text}</textarea>
      `;
      
      textList.appendChild(textItem);
    });
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    // 事件处理
    dialog.querySelector('#cancel-batch').onclick = () => {
      document.body.removeChild(modal);
    };
    
    dialog.querySelector('#apply-batch').onclick = () => {
      const textareas = dialog.querySelectorAll('textarea');
      textareas.forEach((textarea, index) => {
        const newText = textarea.value;
        if (newText !== elements[index].text) {
          elements[index].set({ text: newText });
        }
      });
      
      document.body.removeChild(modal);
      console.log('批量文字编辑已应用');
    };
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    };
  }

  // 导出PSD文字信息
  exportPSDTextInfo() {
    const psdTextElements = this.getAllPSDTextElements();
    
    if (psdTextElements.length === 0) {
      alert('没有找到PSD文字元素');
      return;
    }

    const textInfo = psdTextElements.map((element, index) => ({
      index: index + 1,
      originalText: element.custom?.originalText || '',
      currentText: element.text,
      fontSize: element.fontSize,
      fontFamily: element.fontFamily,
      color: element.fill,
      position: { x: element.x, y: element.y },
      editHistory: element.custom?.editHistory || []
    }));

    // 创建下载链接
    const dataStr = JSON.stringify(textInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'psd-text-info.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    console.log('PSD文字信息已导出:', textInfo);
  }
}

// 创建全局实例
export const psdTextManager = new PSDTextManager();

// 自动初始化
export const initializePSDTextManager = (store) => {
  psdTextManager.initialize(store);
  
  // 添加到全局对象以便调试
  window.psdTextManager = psdTextManager;
  
  return psdTextManager;
};

export default psdTextManager;