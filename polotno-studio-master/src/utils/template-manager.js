import { storage } from '../storage';
import * as api from '../api';

export class TemplateManager {
  static STORAGE_KEY = 'user-templates';
  static CLOUD_PATH = 'templates/';

  // 生成唯一ID
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 保存模板（本地+云端）
  static async saveTemplate(template) {
    try {
      // 确保有ID
      if (!template.id) {
        template.id = this.generateId();
      }

      // 本地存储
      const templates = await this.getLocalTemplates();
      
      // 检查是否已存在相同ID的模板
      const existingIndex = templates.findIndex(t => t.id === template.id);
      if (existingIndex >= 0) {
        templates[existingIndex] = template; // 更新
      } else {
        templates.push(template); // 新增
      }
      
      await storage.setItem(this.STORAGE_KEY, templates);

      // 云端存储（如果可用）
      if (window.puter?.auth?.isSignedIn()) {
        try {
          const templateBlob = new Blob([JSON.stringify(template)], { 
            type: 'application/json' 
          });
          await api.uploadAsset(templateBlob, `${this.CLOUD_PATH}${template.id}.json`);
          console.log('模板已同步到云端:', template.name);
        } catch (cloudError) {
          console.warn('云端保存失败，但本地保存成功:', cloudError);
        }
      }

      return template;
    } catch (error) {
      console.error('保存模板失败:', error);
      throw error;
    }
  }

  // 获取本地模板
  static async getLocalTemplates() {
    try {
      const templates = await storage.getItem(this.STORAGE_KEY) || [];
      return Array.isArray(templates) ? templates : [];
    } catch (error) {
      console.error('获取本地模板失败:', error);
      return [];
    }
  }

  // 获取所有模板（仅从本地缓存加载，不自动同步云端）
  static async getAllTemplates() {
    try {
      // 只获取本地缓存的模板，不自动同步云端
      // 用户需要手动点击"同步"按钮来同步云端模板
      let templates = await this.getLocalTemplates();
      return templates;
    } catch (error) {
      console.error('获取模板失败:', error);
      return [];
    }
  }

  // 同步云端模板
  static async syncCloudTemplates() {
    if (!window.puter?.auth?.isSignedIn()) {
      return await this.getLocalTemplates();
    }

    try {
      // 获取云端模板文件列表
      const cloudAssets = await api.listAssets();
      const templateAssets = cloudAssets.filter(asset => 
        asset.name.startsWith(this.CLOUD_PATH) && asset.name.endsWith('.json')
      );
      
      const localTemplates = await this.getLocalTemplates();
      const cloudTemplates = [];
      
      // 下载并解析云端模板
      for (const asset of templateAssets) {
        try {
          const response = await fetch(asset.url);
          const templateData = await response.json();
          cloudTemplates.push(templateData);
        } catch (parseError) {
          console.warn('解析云端模板失败:', asset.name, parseError);
        }
      }
      
      // 合并本地和云端模板（云端优先）
      const mergedTemplates = this.mergeTemplates(localTemplates, cloudTemplates);
      
      // 保存合并结果到本地
      await storage.setItem(this.STORAGE_KEY, mergedTemplates);
      
      return mergedTemplates;
    } catch (error) {
      console.error('同步云端模板失败:', error);
      return await this.getLocalTemplates();
    }
  }

  // 合并模板（去重，云端优先）
  static mergeTemplates(localTemplates, cloudTemplates) {
    const templateMap = new Map();
    
    // 先添加本地模板
    localTemplates.forEach(template => {
      templateMap.set(template.id, template);
    });
    
    // 云端模板覆盖本地（如果ID相同）
    cloudTemplates.forEach(template => {
      templateMap.set(template.id, template);
    });
    
    return Array.from(templateMap.values()).sort((a, b) => 
      (b.metadata?.createdAt || 0) - (a.metadata?.createdAt || 0)
    );
  }

  // 删除模板
  static async deleteTemplate(templateId) {
    try {
      // 删除本地模板
      const templates = await this.getLocalTemplates();
      const filtered = templates.filter(t => t.id !== templateId);
      await storage.setItem(this.STORAGE_KEY, filtered);

      // 删除云端文件
      if (window.puter?.auth?.isSignedIn()) {
        try {
          await api.deleteAsset(`${this.CLOUD_PATH}${templateId}.json`);
          console.log('云端模板已删除:', templateId);
        } catch (cloudError) {
          console.warn('删除云端模板失败:', cloudError);
        }
      }

      return true;
    } catch (error) {
      console.error('删除模板失败:', error);
      throw error;
    }
  }

  // 根据ID获取模板
  static async getTemplateById(templateId) {
    const templates = await this.getAllTemplates();
    return templates.find(t => t.id === templateId);
  }

  // 更新模板
  static async updateTemplate(templateId, updates) {
    try {
      const templates = await this.getLocalTemplates();
      const templateIndex = templates.findIndex(t => t.id === templateId);
      
      if (templateIndex === -1) {
        throw new Error('模板未找到');
      }
      
      // 更新模板数据
      templates[templateIndex] = { ...templates[templateIndex], ...updates };
      
      // 保存到本地
      await storage.setItem(this.STORAGE_KEY, templates);
      
      // 更新云端（如果可用）
      if (window.puter?.auth?.isSignedIn()) {
        try {
          const templateBlob = new Blob([JSON.stringify(templates[templateIndex])], { 
            type: 'application/json' 
          });
          await api.uploadAsset(templateBlob, `${this.CLOUD_PATH}${templateId}.json`);
        } catch (cloudError) {
          console.warn('云端更新失败:', cloudError);
        }
      }
      
      return templates[templateIndex];
    } catch (error) {
      console.error('更新模板失败:', error);
      throw error;
    }
  }

  // 搜索模板
  static async searchTemplates(query) {
    const templates = await this.getAllTemplates();
    const lowerQuery = query.toLowerCase();
    
    return templates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      (template.metadata?.tags || []).some(tag => 
        tag.toLowerCase().includes(lowerQuery)
      )
    );
  }

  // 获取模板统计信息
  static async getTemplateStats() {
    const templates = await this.getAllTemplates();
    return {
      total: templates.length,
      local: (await this.getLocalTemplates()).length,
      cloud: window.puter?.auth?.isSignedIn() ? templates.length : 0
    };
  }
}