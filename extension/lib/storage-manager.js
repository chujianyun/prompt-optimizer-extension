/**
 * 配置存储管理模块
 * 负责管理用户配置的存储和读取
 */

class StorageManager {
  constructor() {
    this.defaultConfig = {
      activeService: 'deepseek',
      deepseekApiKey: '',
      deepseekModel: 'deepseek-chat',
      kimiApiKey: '',
      kimiModel: 'kimi-k2-turbo-preview',
      openrouterApiKey: '',
      openrouterModel: 'anthropic/claude-sonnet-4.5',
      // 阿里云百炼
      aliyunApiKey: '',
      aliyunModel: 'qwen-turbo',
      // 硅基流动
      siliconflowApiKey: '',
      siliconflowModel: 'deepseek-ai/DeepSeek-V3.2',
      // CherryIN
      cherryinApiKey: '',
      cherryinModel: 'google/gemini-3-pro-preview',
      // 火山引擎
      volcengineApiKey: '',
      volcengineModel: 'doubao-pro-32k',
      // OpenAI 兼容服务配置
      customApiKey: '',
      customModel: '',
      customEndpoint: ''
    };
  }

  /**
   * 保存配置
   * @param {Object} config - 配置对象
   * @returns {Promise<boolean>}
   */
  async saveConfig(config) {
    try {
      await chrome.storage.sync.set({ userConfig: config });
      console.log('配置保存成功', config);
      return true;
    } catch (error) {
      console.error('配置保存失败:', error);
      return false;
    }
  }

  /**
   * 读取配置
   * @returns {Promise<Object>}
   */
  async loadConfig() {
    try {
      const result = await chrome.storage.sync.get('userConfig');
      const config = result.userConfig || this.defaultConfig;
      console.log('配置加载成功', config);
      return config;
    } catch (error) {
      console.error('配置加载失败:', error);
      return this.defaultConfig;
    }
  }

  /**
   * 更新部分配置
   * @param {Object} partialConfig - 部分配置对象
   * @returns {Promise<boolean>}
   */
  async updateConfig(partialConfig) {
    try {
      const currentConfig = await this.loadConfig();
      const newConfig = { ...currentConfig, ...partialConfig };
      return await this.saveConfig(newConfig);
    } catch (error) {
      console.error('配置更新失败:', error);
      return false;
    }
  }

  /**
   * 检查配置是否完整
   * @param {Object} config - 配置对象
   * @returns {Object} { isValid: boolean, missingFields: Array }
   */
  validateConfig(config) {
    const activeService = config.activeService;
    const missingFields = [];

    if (!activeService) {
      return { isValid: false, missingFields: ['activeService'] };
    }

    // 检查当前激活服务的配置
    if (activeService === 'deepseek') {
      if (!config.deepseekApiKey) missingFields.push('deepseekApiKey');
      if (!config.deepseekModel) missingFields.push('deepseekModel');
    } else if (activeService === 'kimi') {
      if (!config.kimiApiKey) missingFields.push('kimiApiKey');
      if (!config.kimiModel) missingFields.push('kimiModel');
    } else if (activeService === 'openrouter') {
      if (!config.openrouterApiKey) missingFields.push('openrouterApiKey');
      if (!config.openrouterModel) missingFields.push('openrouterModel');
    } else if (activeService === 'aliyun') {
      if (!config.aliyunApiKey) missingFields.push('aliyunApiKey');
      if (!config.aliyunModel) missingFields.push('aliyunModel');
    } else if (activeService === 'siliconflow') {
      if (!config.siliconflowApiKey) missingFields.push('siliconflowApiKey');
      if (!config.siliconflowModel) missingFields.push('siliconflowModel');
    } else if (activeService === 'cherryin') {
      if (!config.cherryinApiKey) missingFields.push('cherryinApiKey');
      if (!config.cherryinModel) missingFields.push('cherryinModel');
    } else if (activeService === 'volcengine') {
      if (!config.volcengineApiKey) missingFields.push('volcengineApiKey');
      if (!config.volcengineModel) missingFields.push('volcengineModel');
    } else if (activeService === 'custom') {
      if (!config.customApiKey) missingFields.push('customApiKey');
      if (!config.customModel) missingFields.push('customModel');
      if (!config.customEndpoint) missingFields.push('customEndpoint');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * 获取当前激活服务的配置
   * @returns {Promise<Object>}
   */
  async getActiveServiceConfig() {
    const config = await this.loadConfig();
    const service = config.activeService;

    if (service === 'deepseek') {
      return {
        service: 'deepseek',
        apiKey: config.deepseekApiKey,
        model: config.deepseekModel
      };
    } else if (service === 'kimi') {
      return {
        service: 'kimi',
        apiKey: config.kimiApiKey,
        model: config.kimiModel
      };
    } else if (service === 'openrouter') {
      return {
        service: 'openrouter',
        apiKey: config.openrouterApiKey,
        model: config.openrouterModel
      };
    } else if (service === 'aliyun') {
      return {
        service: 'aliyun',
        apiKey: config.aliyunApiKey,
        model: config.aliyunModel
      };
    } else if (service === 'siliconflow') {
      return {
        service: 'siliconflow',
        apiKey: config.siliconflowApiKey,
        model: config.siliconflowModel
      };
    } else if (service === 'cherryin') {
      return {
        service: 'cherryin',
        apiKey: config.cherryinApiKey,
        model: config.cherryinModel
      };
    } else if (service === 'volcengine') {
      return {
        service: 'volcengine',
        apiKey: config.volcengineApiKey,
        model: config.volcengineModel
      };
    } else if (service === 'custom') {
      return {
        service: 'custom',
        apiKey: config.customApiKey,
        model: config.customModel,
        endpoint: config.customEndpoint
      };
    }

    return null;
  }

  /**
   * 重置配置为默认值
   * @returns {Promise<boolean>}
   */
  async resetConfig() {
    return await this.saveConfig(this.defaultConfig);
  }

  /**
   * 导出配置(不包含敏感信息)
   * @returns {Promise<Object>}
   */
  async exportConfig() {
    const config = await this.loadConfig();
    return {
      activeService: config.activeService,
      deepseekModel: config.deepseekModel,
      kimiModel: config.kimiModel,
      openrouterModel: config.openrouterModel,
      aliyunModel: config.aliyunModel,
      siliconflowModel: config.siliconflowModel,
      cherryinModel: config.cherryinModel,
      volcengineModel: config.volcengineModel,
      customModel: config.customModel,
      customEndpoint: config.customEndpoint
    };
  }

  /**
   * 导入配置(合并而非覆盖)
   * @param {Object} importedConfig - 导入的配置
   * @returns {Promise<boolean>}
   */
  async importConfig(importedConfig) {
    return await this.updateConfig(importedConfig);
  }
}

// 导出单例
const storageManager = new StorageManager();
