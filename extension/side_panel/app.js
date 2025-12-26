/**
 * 侧边栏应用主控制器
 */

class PromptOptimizerApp {
  constructor() {
    // 状态管理
    this.state = {
      currentStage: 'initial', // initial, matching, clarifying, generating, complete
      userInput: '',
      recommendedFrameworks: [],
      selectedFramework: null,
      clarificationRound: 0, // 澄清轮数计数器，最多 3 轮
      maxClarificationRounds: 3, // 最大澄清轮数
      clarificationData: {
        originalInput: '',
        goal: '',
        audience: '',
        context: '',
        formatRequirements: '',
        constraints: '',
        additionalInfo: ''
      },
      conversationHistory: [],
      generatedPrompt: '',
      serviceConfig: null
    };

    // DOM 元素引用
    this.elements = {};
    
    // 初始化
    this.init();
  }

  /**
   * 初始化应用
   */
  async init() {
    try {
      // 获取 DOM 元素
      this.cacheElements();
      
      // 绑定事件
      this.bindEvents();
      
      // 初始化框架引擎
      await frameworkEngine.initialize();
      
      // 检查配置
      await this.checkConfiguration();
      
      console.log('应用初始化完成');
    } catch (error) {
      console.error('应用初始化失败:', error);
      this.showToast('应用初始化失败', 'error');
    }
  }

  /**
   * 缓存 DOM 元素
   */
  cacheElements() {
    this.elements = {
      // 主要区域
      configGuide: document.getElementById('configGuide'),
      mainContent: document.getElementById('mainContent'),
      chatContainer: document.getElementById('chatContainer'),
      frameworksContainer: document.getElementById('frameworksContainer'),
      resultContainer: document.getElementById('resultContainer'),
      
      // 按钮
      newChatBtn: document.getElementById('newChatBtn'),
      settingsBtn: document.getElementById('settingsBtn'),
      startConfigBtn: document.getElementById('startConfigBtn'),
      sendBtn: document.getElementById('sendBtn'),
      
      // 输入
      userInput: document.getElementById('userInput'),
      
      // 配置对话框
      settingsModal: document.getElementById('settingsModal'),
      closeSettingsBtn: document.getElementById('closeSettingsBtn'),
      saveConfigBtn: document.getElementById('saveConfigBtn'),
      testConfigBtn: document.getElementById('testConfigBtn'),
      
      // 加载和提示
      loadingOverlay: document.getElementById('loadingOverlay'),
      toast: document.getElementById('toast')
    };
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 新对话
    this.elements.newChatBtn.addEventListener('click', () => this.startNewChat());
    
    // 设置
    this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
    this.elements.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    this.elements.saveConfigBtn.addEventListener('click', () => this.saveConfiguration());
    this.elements.testConfigBtn.addEventListener('click', () => this.testConnection());
    
    // 配置引导
    this.elements.startConfigBtn.addEventListener('click', () => this.openSettings());
    
    // 发送消息
    this.elements.sendBtn.addEventListener('click', () => this.handleSend());
    this.elements.userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
    
    // 配置对话框服务选择
    document.getElementById('activeService').addEventListener('change', (e) => {
      this.updateServiceConfigVisibility(e.target.value);
    });
  }

  /**
   * 检查配置
   */
  async checkConfiguration() {
    const config = await storageManager.loadConfig();
    const validation = storageManager.validateConfig(config);
    
    if (!validation.isValid) {
      // 显示配置引导
      this.elements.configGuide.classList.remove('hidden');
      this.elements.mainContent.classList.add('hidden');
    } else {
      // 显示主界面
      this.elements.configGuide.classList.add('hidden');
      this.elements.mainContent.classList.remove('hidden');
      
      // 获取当前服务配置
      this.state.serviceConfig = await storageManager.getActiveServiceConfig();
    }
  }

  /**
   * 打开设置
   */
  async openSettings() {
    const config = await storageManager.loadConfig();
    
    // 填充表单
    document.getElementById('activeService').value = config.activeService;
    document.getElementById('deepseekApiKey').value = config.deepseekApiKey || '';
    document.getElementById('deepseekModel').value = config.deepseekModel || 'deepseek-chat';
    document.getElementById('kimiApiKey').value = config.kimiApiKey || '';
    document.getElementById('kimiModel').value = config.kimiModel || 'kimi-k2-turbo-preview';
    document.getElementById('openrouterApiKey').value = config.openrouterApiKey || '';
    document.getElementById('openrouterModel').value = config.openrouterModel || 'google/gemini-3-flash-preview';
    document.getElementById('aliyunApiKey').value = config.aliyunApiKey || '';
    document.getElementById('aliyunModel').value = config.aliyunModel || 'qwen3-max';
    document.getElementById('siliconflowApiKey').value = config.siliconflowApiKey || '';
    document.getElementById('siliconflowModel').value = config.siliconflowModel || 'deepseek-ai/DeepSeek-V3.2';
    document.getElementById('cherryinApiKey').value = config.cherryinApiKey || '';
    document.getElementById('cherryinModel').value = config.cherryinModel || 'google/gemini-3-pro-preview';
    document.getElementById('volcengineApiKey').value = config.volcengineApiKey || '';
    document.getElementById('volcengineModel').value = config.volcengineModel || 'doubao-seed-1-6-flash-250828';
    document.getElementById('antchatApiKey').value = config.antchatApiKey || '';
    document.getElementById('antchatModel').value = config.antchatModel || 'Kimi-K2-Instruct-0905';
    document.getElementById('customEndpoint').value = config.customEndpoint || '';
    document.getElementById('customApiKey').value = config.customApiKey || '';
    document.getElementById('customModel').value = config.customModel || '';
    
    this.updateServiceConfigVisibility(config.activeService);
    this.elements.settingsModal.classList.remove('hidden');
  }

  /**
   * 关闭设置
   */
  closeSettings() {
    this.elements.settingsModal.classList.add('hidden');
  }

  /**
   * 更新服务配置显示
   */
  updateServiceConfigVisibility(activeService) {
    const configs = ['deepseekConfig', 'kimiConfig', 'openrouterConfig', 'aliyunConfig', 'siliconflowConfig', 'cherryinConfig', 'volcengineConfig', 'antchatConfig', 'customConfig'];
    configs.forEach(id => {
      const element = document.getElementById(id);
      element.style.display = id.startsWith(activeService) ? 'block' : 'none';
    });
  }

  /**
   * 保存配置
   */
  async saveConfiguration() {
    const config = {
      activeService: document.getElementById('activeService').value,
      deepseekApiKey: document.getElementById('deepseekApiKey').value,
      deepseekModel: document.getElementById('deepseekModel').value,
      kimiApiKey: document.getElementById('kimiApiKey').value,
      kimiModel: document.getElementById('kimiModel').value,
      openrouterApiKey: document.getElementById('openrouterApiKey').value,
      openrouterModel: document.getElementById('openrouterModel').value,
      aliyunApiKey: document.getElementById('aliyunApiKey').value,
      aliyunModel: document.getElementById('aliyunModel').value,
      siliconflowApiKey: document.getElementById('siliconflowApiKey').value,
      siliconflowModel: document.getElementById('siliconflowModel').value,
      cherryinApiKey: document.getElementById('cherryinApiKey').value,
      cherryinModel: document.getElementById('cherryinModel').value,
      volcengineApiKey: document.getElementById('volcengineApiKey').value,
      volcengineModel: document.getElementById('volcengineModel').value,
      antchatApiKey: document.getElementById('antchatApiKey').value,
      antchatModel: document.getElementById('antchatModel').value,
      customEndpoint: document.getElementById('customEndpoint').value,
      customApiKey: document.getElementById('customApiKey').value,
      customModel: document.getElementById('customModel').value
    };
    
    const validation = storageManager.validateConfig(config);
    if (!validation.isValid) {
      this.showToast(`配置不完整: ${validation.missingFields.join(', ')}`, 'warning');
      return;
    }
    
    const success = await storageManager.saveConfig(config);
    if (success) {
      this.showToast('配置保存成功', 'success');
      this.closeSettings();
      await this.checkConfiguration();
    } else {
      this.showToast('配置保存失败', 'error');
    }
  }

  /**
   * 测试连接
   */
  async testConnection() {
    this.showLoading('测试连接中...');
    
    try {
      const activeService = document.getElementById('activeService').value;
      let apiKey, model;
      
      if (activeService === 'deepseek') {
        apiKey = document.getElementById('deepseekApiKey').value;
        model = document.getElementById('deepseekModel').value;
      } else if (activeService === 'kimi') {
        apiKey = document.getElementById('kimiApiKey').value;
        model = document.getElementById('kimiModel').value;
      } else if (activeService === 'openrouter') {
        apiKey = document.getElementById('openrouterApiKey').value;
        model = document.getElementById('openrouterModel').value;
      } else if (activeService === 'aliyun') {
        apiKey = document.getElementById('aliyunApiKey').value;
        model = document.getElementById('aliyunModel').value;
      } else if (activeService === 'siliconflow') {
        apiKey = document.getElementById('siliconflowApiKey').value;
        model = document.getElementById('siliconflowModel').value;
      } else if (activeService === 'cherryin') {
        apiKey = document.getElementById('cherryinApiKey').value;
        model = document.getElementById('cherryinModel').value;
      } else if (activeService === 'volcengine') {
        apiKey = document.getElementById('volcengineApiKey').value;
        model = document.getElementById('volcengineModel').value;
      } else if (activeService === 'antchat') {
        apiKey = document.getElementById('antchatApiKey').value;
        model = document.getElementById('antchatModel').value;
      } else if (activeService === 'custom') {
        apiKey = document.getElementById('customApiKey').value;
        model = document.getElementById('customModel').value;
      }
      
      // custom 服务需要传入 endpoint
      const serviceConfig = { apiKey, model, service: activeService };
      if (activeService === 'custom') {
        serviceConfig.endpoint = document.getElementById('customEndpoint').value;
      }
      
      const isValid = await aiService.validateConfig(serviceConfig.apiKey, serviceConfig.model, activeService, serviceConfig.endpoint);
      
      if (isValid) {
        this.showToast('连接测试成功', 'success');
      } else {
        this.showToast('连接测试失败,请检查配置', 'error');
      }
    } catch (error) {
      this.showToast('测试失败: ' + error.message, 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * 开始新对话
   */
  startNewChat() {
    // 重置状态
    this.state = {
      currentStage: 'initial',
      userInput: '',
      recommendedFrameworks: [],
      selectedFramework: null,
      clarificationRound: 0, // 重置澄清轮数
      maxClarificationRounds: 2,
      clarificationData: {
        originalInput: '',
        goal: '',
        audience: '',
        context: '',
        formatRequirements: '',
        constraints: '',
        additionalInfo: ''
      },
      conversationHistory: [],
      generatedPrompt: '',
      serviceConfig: this.state.serviceConfig
    };
    
    // 清空界面
    this.elements.chatContainer.innerHTML = `
      <div class="welcome-message">
        <h2>👋 您好!</h2>
        <p>我是您的提示词优化助手,基于 57 个成熟的提示词框架帮您生成高质量的 AI 提示词。</p>
        <p>请描述您的需求,我会为您推荐最合适的框架并帮您优化提示词。</p>
      </div>
    `;
    this.elements.frameworksContainer.classList.add('hidden');
    this.elements.resultContainer.classList.add('hidden');
    this.elements.userInput.value = '';
    this.elements.userInput.focus();
  }

  /**
   * 处理发送
   */
  async handleSend() {
    const input = this.elements.userInput.value.trim();
    if (!input) return;
    
    // 添加用户消息到对话
    this.addMessage('user', input);
    this.elements.userInput.value = '';
    
    // 根据当前阶段处理
    if (this.state.currentStage === 'initial') {
      await this.handleInitialInput(input);
    } else if (this.state.currentStage === 'clarifying') {
      await this.handleClarificationResponse(input);
    } else if (this.state.currentStage === 'complete') {
      await this.handleAdjustmentRequest(input);
    }
  }

  /**
   * 处理初始输入
   */
  async handleInitialInput(input) {
    this.state.userInput = input;
    this.state.clarificationData.originalInput = input;
    this.state.currentStage = 'matching';
    
    this.showLoading('分析需求中,匹配最佳框架...');
    
    try {
      // 调用框架匹配引擎
      const frameworks = await frameworkEngine.matchFrameworks(input, this.state.serviceConfig);
      
      this.state.recommendedFrameworks = frameworks;
      
      // 显示推荐框架
      this.displayRecommendedFrameworks(frameworks);
      
      this.addMessage('assistant', '我为您推荐了以下 2 个最适合的提示词框架,请选择一个继续:');
    } catch (error) {
      this.showToast('框架匹配失败: ' + error.message, 'error');
      this.state.currentStage = 'initial';
    } finally {
      this.hideLoading();
    }
  }

  /**
   * 显示推荐框架
   */
  displayRecommendedFrameworks(frameworks) {
    const container = this.elements.frameworksContainer;
    
    const html = `
      <h3 class="frameworks-title">💡 推荐框架</h3>
      ${frameworks.map((fw, index) => `
        <div class="framework-card" data-index="${index}">
          <div class="framework-card-header">
            <div>
              <div class="framework-name">${fw.name}</div>
              <div class="framework-name-en">${fw.nameEn}</div>
            </div>
            <span class="framework-badge badge-${this.getComplexityClass(fw.complexity)}">
              ${fw.complexity}
            </span>
          </div>
          <div class="framework-reason">${fw.reason}</div>
          <div class="framework-meta">
            <span>📦 ${fw.elements || '未知'} 个元素</span>
          </div>
          <div class="framework-actions">
            <button class="btn btn-primary select-framework" data-index="${index}">
              选择此框架
            </button>
          </div>
        </div>
      `).join('')}
    `;
    
    container.innerHTML = html;
    container.classList.remove('hidden');
    
    // 绑定选择事件
    container.querySelectorAll('.select-framework').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.selectFramework(index);
      });
    });
  }

  /**
   * 获取复杂度样式类
   */
  getComplexityClass(complexity) {
    if (complexity === '简单') return 'simple';
    if (complexity === '中等') return 'medium';
    return 'complex';
  }

  /**
   * 选择框架
   */
  async selectFramework(index) {
    const framework = this.state.recommendedFrameworks[index];
    
    this.showLoading('加载框架详情...');
    
    try {
      // 通过框架名称查找对应的框架ID
      const frameworkId = frameworkEngine.findFrameworkIdByName(framework.name, framework.nameEn);
      if (!frameworkId) {
        throw new Error(`无法找到框架: ${framework.name}`);
      }
      const detail = await frameworkEngine.loadFrameworkDetail(frameworkId);
      
      this.state.selectedFramework = detail;
      this.state.currentStage = 'clarifying';
      
      // 隐藏框架推荐区
      this.elements.frameworksContainer.classList.add('hidden');
      
      this.addMessage('assistant', `您选择了 ${detail.name} 框架。现在让我帮您完善需求细节,以便生成更准确的提示词。`);
      
      // 生成澄清问题
      await this.startClarification();
    } catch (error) {
      this.showToast('加载框架失败: ' + error.message, 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * 开始澄清流程
   */
  async startClarification() {
    // 增加澄清轮数
    this.state.clarificationRound++;
    
    this.showLoading('生成澄清问题...');
    
    try {
      const result = await frameworkEngine.generateClarificationQuestions(
        this.state.selectedFramework,
        this.state.userInput,
        this.state.clarificationData,
        this.state.serviceConfig,
        this.state.clarificationRound,
        this.state.maxClarificationRounds
      );
      
      // 如果已达到最大轮数或信息已完整,直接生成提示词
      if (result.isComplete || this.state.clarificationRound >= this.state.maxClarificationRounds) {
        if (this.state.clarificationRound >= this.state.maxClarificationRounds && !result.isComplete) {
          this.addMessage('assistant', '已收集足够信息，现在为您生成提示词...');
        }
        await this.generatePrompt();
      } else {
        // 显示澄清问题和剩余轮数提示
        const remainingRounds = this.state.maxClarificationRounds - this.state.clarificationRound;
        const questions = result.questions.map((q, i) => 
          `${i + 1}. ${q.question}${q.hint ? ` (${q.hint})` : ''}`
        ).join('\n\n');
        
        this.addMessage('assistant', `请回答以下问题（还剩 ${remainingRounds} 轮确认）:\n\n${questions}`);
      }
    } catch (error) {
      this.showToast('生成澄清问题失败: ' + error.message, 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * 处理澄清回答
   */
  async handleClarificationResponse(input) {
    // 更新澄清数据(简化处理,实际应该用 AI 解析)
    this.state.clarificationData.additionalInfo += input + '\n';
    
    // 增加澄清轮数
    this.state.clarificationRound++;
    
    // 检查是否已达到最大轮数
    if (this.state.clarificationRound >= this.state.maxClarificationRounds) {
      this.addMessage('assistant', '已收集足够信息，现在为您生成提示词...');
      await this.generatePrompt();
      return;
    }
    
    this.showLoading('分析回答...');
    
    try {
      // 再次生成澄清问题,判断是否需要继续
      const result = await frameworkEngine.generateClarificationQuestions(
        this.state.selectedFramework,
        this.state.userInput,
        this.state.clarificationData,
        this.state.serviceConfig,
        this.state.clarificationRound,
        this.state.maxClarificationRounds
      );
      
      if (result.isComplete) {
        // 信息完整,生成提示词
        await this.generatePrompt();
      } else {
        // 继续澄清，显示剩余轮数
        const remainingRounds = this.state.maxClarificationRounds - this.state.clarificationRound;
        const questions = result.questions.map((q, i) => 
          `${i + 1}. ${q.question}${q.hint ? ` (${q.hint})` : ''}`
        ).join('\n\n');
        
        this.addMessage('assistant', `感谢您的回答。继续回答（还剩 ${remainingRounds} 轮确认）:\n\n${questions}`);
      }
    } catch (error) {
      this.showToast('处理失败: ' + error.message, 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * 生成提示词
   */
  async generatePrompt() {
    this.state.currentStage = 'generating';
    this.showLoading('生成优化的提示词...');
    
    try {
      const prompt = await frameworkEngine.generateOptimizedPrompt(
        this.state.selectedFramework,
        this.state.clarificationData,
        this.state.serviceConfig
      );
      
      this.state.generatedPrompt = prompt;
      this.state.currentStage = 'complete';
      
      this.addMessage('assistant', '✅ 提示词生成完成!');
      
      // 显示结果
      this.displayGeneratedPrompt(prompt);
    } catch (error) {
      this.showToast('生成提示词失败: ' + error.message, 'error');
      this.state.currentStage = 'clarifying';
    } finally {
      this.hideLoading();
    }
  }

  /**
   * 显示生成的提示词
   */
  displayGeneratedPrompt(prompt) {
    const container = this.elements.resultContainer;
    
    // 清理 markdown 代码块标记
    const cleanedPrompt = this.cleanMarkdownCodeBlock(prompt);
    
    const html = `
      <div class="result-header">
        <div class="result-title">📝 优化后的提示词</div>
        <div class="result-actions">
          <button class="btn btn-secondary" id="regenerateBtn">🔄 重新生成</button>
          <button class="btn btn-primary" id="copyPromptBtn">📋 复制</button>
        </div>
      </div>
      <div class="result-content">${this.escapeHtml(cleanedPrompt)}</div>
      <div class="result-hint">
        💡 <strong>使用建议:</strong> 您可以直接将此提示词复制到 AI 助手中使用,也可以根据实际需要进行微调。
        如需修改,请在下方输入框说明您的调整需求。
      </div>
    `;
    
    container.innerHTML = html;
    container.classList.remove('hidden');
    
    // 绑定复制按钮（复制清理后的内容）
    document.getElementById('copyPromptBtn').addEventListener('click', () => {
      this.copyToClipboard(cleanedPrompt);
    });
    
    // 绑定重新生成按钮
    document.getElementById('regenerateBtn').addEventListener('click', () => {
      this.generatePrompt();
    });
  }

  /**
   * 清理 markdown 代码块标记
   * 去掉开头的 ```markdown 和结尾的 ```
   */
  cleanMarkdownCodeBlock(text) {
    if (!text) return text;
    
    let cleaned = text.trim();
    
    // 去掉开头的 ```markdown 或 ```
    cleaned = cleaned.replace(/^```(?:markdown)?\s*\n?/i, '');
    
    // 去掉结尾的 ```
    cleaned = cleaned.replace(/\n?```\s*$/i, '');
    
    return cleaned.trim();
  }

  /**
   * 处理调整请求
   */
  async handleAdjustmentRequest(input) {
    this.addMessage('assistant', '我会根据您的要求调整提示词...');
    
    // 将调整需求添加到澄清数据
    this.state.clarificationData.additionalInfo += '\n调整需求: ' + input;
    
    // 重新生成
    await this.generatePrompt();
  }

  /**
   * 添加消息到对话
   */
  addMessage(role, content) {
    const message = document.createElement('div');
    message.className = `message message-${role}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;
    
    message.appendChild(bubble);
    this.elements.chatContainer.appendChild(message);
    
    // 滚动到底部
    this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
    
    // 添加到历史
    this.state.conversationHistory.push({ role, content });
  }

  /**
   * 复制到剪贴板
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('✅ 已复制到剪贴板', 'success');
    } catch (error) {
      this.showToast('复制失败', 'error');
    }
  }

  /**
   * 显示加载提示
   */
  showLoading(text = '处理中...') {
    this.elements.loadingOverlay.querySelector('.loading-text').textContent = text;
    this.elements.loadingOverlay.classList.remove('hidden');
  }

  /**
   * 隐藏加载提示
   */
  hideLoading() {
    this.elements.loadingOverlay.classList.add('hidden');
  }

  /**
   * 显示 Toast 提示
   */
  showToast(message, type = 'info') {
    const toast = this.elements.toast;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  /**
   * HTML 转义
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 启动应用
const app = new PromptOptimizerApp();
