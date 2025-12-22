/**
 * AI 服务适配器层
 * 统一封装不同 AI 服务的接口调用
 */

class AIService {
  constructor() {
    this.endpoints = {
      deepseek: 'https://api.deepseek.com/chat/completions',
      kimi: 'https://api.moonshot.cn/v1/chat/completions',
      openrouter: 'https://openrouter.ai/api/v1/chat/completions',
      aliyun: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      siliconflow: 'https://api.siliconflow.cn/v1/chat/completions',
      cherryin: 'https://open.cherryin.cc/v1/chat/completions',
      volcengine: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    };
    this.maxRetries = 3;
    this.timeout = 30000; // 30秒超时
  }

  /**
   * 发送聊天请求
   * @param {Array} messages - 消息数组
   * @param {Object} config - 服务配置 { service, apiKey, model }
   * @returns {Promise<string>} - AI 响应文本
   */
  async chat(messages, config) {
    const { service, apiKey, model, endpoint } = config;
    
    if (!apiKey || !model) {
      throw new Error('API Key 或模型配置缺失');
    }

    // 获取 endpoint，custom 服务使用配置的 endpoint
    let targetEndpoint;
    if (service === 'custom') {
      if (!endpoint) {
        throw new Error('OpenAI 兼容服务需要配置 API URL');
      }
      targetEndpoint = endpoint;
    } else {
      targetEndpoint = this.endpoints[service];
      if (!targetEndpoint) {
        throw new Error(`不支持的服务: ${service}`);
      }
    }

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this._makeRequest(targetEndpoint, {
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 4000
        }, apiKey, service);

        return this._extractResponse(response, service);
      } catch (error) {
        lastError = error;
        console.warn(`请求失败 (尝试 ${attempt}/${this.maxRetries}):`, error.message);
        
        // 如果是速率限制，等待后重试
        if (error.message.includes('rate limit') && attempt < this.maxRetries) {
          await this._delay(2000 * attempt);
          continue;
        }
        
        // 其他错误直接抛出
        if (attempt === this.maxRetries) {
          throw this._handleError(error);
        }
      }
    }

    throw lastError;
  }

  /**
   * 发送 HTTP 请求
   * @private
   */
  async _makeRequest(endpoint, body, apiKey, service) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    // OpenRouter 需要额外的头
    if (service === 'openrouter') {
      headers['HTTP-Referer'] = 'https://prompt-optimizer-extension';
      headers['X-Title'] = 'Prompt Optimizer';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 从响应中提取文本
   * @private
   */
  _extractResponse(response, service) {
    try {
      if (response.choices && response.choices.length > 0) {
        const message = response.choices[0].message;
        return message.content || '';
      }
      throw new Error('响应格式异常: 缺少 choices');
    } catch (error) {
      console.error('响应解析失败:', response);
      throw new Error('无法解析 AI 响应');
    }
  }

  /**
   * 错误处理
   * @private
   */
  _handleError(error) {
    if (error.name === 'AbortError') {
      return new Error('请求超时,请检查网络连接');
    }

    const message = error.message.toLowerCase();
    
    if (message.includes('api key') || message.includes('unauthorized') || message.includes('401')) {
      return new Error('API Key 无效,请检查配置');
    }
    
    if (message.includes('rate limit') || message.includes('429')) {
      return new Error('请求频率过高,请稍后再试');
    }
    
    if (message.includes('quota') || message.includes('insufficient')) {
      return new Error('余额不足,请充值或更换服务');
    }
    
    if (message.includes('model') || message.includes('404')) {
      return new Error('模型不存在,请检查模型名称');
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return new Error('网络错误,请检查网络连接');
    }

    return error;
  }

  /**
   * 延迟函数
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 验证配置有效性
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @param {string} service - 服务名称
   * @param {string} endpoint - 自定义端点 (custom 服务使用)
   * @returns {Promise<boolean>}
   */
  async validateConfig(apiKey, model, service, endpoint) {
    try {
      const testMessages = [
        { role: 'user', content: 'Hello' }
      ];
      
      await this.chat(testMessages, { service, apiKey, model, endpoint });
      return true;
    } catch (error) {
      console.error('配置验证失败:', error.message);
      return false;
    }
  }

  /**
   * 估算 token 数量(简单估算)
   * @param {string} text - 文本
   * @returns {number}
   */
  estimateTokens(text) {
    // 简单估算: 中文约1.5字符/token,英文约4字符/token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }

  /**
   * 构建系统提示词
   * @param {string} role - 角色描述
   * @param {string} task - 任务描述
   * @param {string} format - 输出格式要求
   * @returns {Object} - 系统消息对象
   */
  buildSystemPrompt(role, task, format) {
    const content = `你是${role}。

任务: ${task}

输出格式: ${format}

请严格按照要求完成任务。`;

    return {
      role: 'system',
      content: content
    };
  }

  /**
   * 框架匹配阶段的系统提示词
   * @returns {Object}
   */
  getFrameworkMatchingSystemPrompt() {
    return this.buildSystemPrompt(
      '一位提示词工程专家',
      '分析用户需求,从提供的框架列表中推荐最适合的 2 个提示词框架',
      '请以 JSON 格式返回推荐结果,包含框架名称、推荐理由、复杂度和元素数量。排序规则：更推荐的或难度更高的框架放第一位。格式如下:\n```json\n{\n  "frameworks": [\n    {\n      "name": "框架名称",\n      "nameEn": "Framework Name",\n      "reason": "推荐理由",\n      "complexity": "简单/中等/复杂",\n      "elements": 5\n    }\n  ]\n}\n```'
    );
  }

  /**
   * 需求澄清阶段的系统提示词
   * @param {number} currentRound - 当前轮数
   * @param {number} maxRounds - 最大轮数
   * @returns {Object}
   */
  getClarificationSystemPrompt(currentRound = 1, maxRounds = 2) {
    const remainingRounds = maxRounds - currentRound;
    const isLastRound = remainingRounds <= 0;
    
    let taskDescription = '根据选定的提示词框架,提出澄清问题帮助用户完善需求';
    let formatInstruction;
    
    if (isLastRound) {
      // 最后一轮，必须设置 isComplete 为 true
      formatInstruction = `这是最后一轮确认，请将 isComplete 设置为 true。以 JSON 格式返回:
\`\`\`json
{
  "questions": [],
  "isComplete": true
}
\`\`\``;
    } else {
      // 还有剩余轮数
      taskDescription += `。当前是第 ${currentRound} 轮，还剩 ${remainingRounds} 轮确认机会`;
      formatInstruction = `每次提出 1-3 个最关键的简洁问题，优先问最重要的信息。以 JSON 格式返回:
\`\`\`json
{
  "questions": [
    {
      "dimension": "目标明确性/目标受众/上下文完整性/格式要求/约束条件",
      "question": "具体问题",
      "hint": "问题意图说明"
    }
  ],
  "isComplete": false
}
\`\`\`
当信息已完全足够时，设置 isComplete 为 true。注意：最多只有 ${maxRounds} 轮确认机会，请高效利用。`;
    }
    
    return this.buildSystemPrompt(
      '一位友好的需求分析师',
      taskDescription,
      formatInstruction
    );
  }

  /**
   * 提示词生成阶段的系统提示词
   * @returns {Object}
   */
  getPromptGenerationSystemPrompt() {
    return this.buildSystemPrompt(
      '一位提示词优化专家',
      '严格按照指定的提示词框架结构,生成优化的提示词',
      '请按照框架的各个元素组织提示词,确保结构清晰、内容完整。以 markdown 格式输出最终的提示词。'
    );
  }
}

// 导出单例
const aiService = new AIService();
