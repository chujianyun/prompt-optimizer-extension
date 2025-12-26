# Prompt Optimizer - Chrome 扩展

一个基于 57 个成熟提示词框架的智能提示词优化助手,支持 DeepSeek、Kimi、OpenRouter、阿里云百炼、硅基流动、CherryIN、火山引擎等多种 AI 服务。

## 功能特性

✨ **智能框架匹配** - 根据您的需求自动推荐最适合的 2 个提示词框架
🤖 **多 AI 服务支持** - 支持 DeepSeek、Kimi、OpenRouter、阿里云百炼、硅基流动、CherryIN、火山引擎,可灵活切换
💬 **交互式澄清** - 通过对话式交互帮助您完善需求细节
📋 **一键复制** - 生成的提示词可直接复制使用
🎯 **57 个框架** - 涵盖营销、决策、教育、产品开发等多个领域

## 安装方法

### 方式一:开发者模式加载(推荐)

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 打开右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目的 `extension` 文件夹
6. 插件安装完成!

### 方式二:打包安装

```bash
# 进入项目目录
cd extension

# 压缩为 zip 文件
zip -r prompt-optimizer.zip *

# 在 Chrome 扩展页面选择"打包扩展程序"
# 选择 extension 目录进行打包
```

## 使用指南

### 1. 首次配置

1. 点击浏览器工具栏中的插件图标,打开侧边栏
2. 首次使用会提示配置 AI 服务
3. 选择您要使用的 AI 服务(DeepSeek/Kimi/OpenRouter/阿里云百炼/硅基流动/CherryIN/火山引擎/OpenAI 兼容)
4. 输入对应的 API Key 和模型名称
5. 点击"测试连接"确保配置正确
6. 保存配置

### 2. 生成优化提示词

1. 在输入框中描述您的需求,例如:
   - "我需要为一个健身应用写营销文案"
   - "帮我分析如何提高网站转化率"
   - "如何设计一个教学课程"

2. 系统会分析您的需求并推荐 2 个最适合的框架

3. 选择其中一个框架,系统会提出澄清问题

4. 回答问题,完善需求细节

5. 系统自动生成优化后的提示词

6. 点击"复制"按钮,将提示词用于您的 AI 助手

### 3. 支持的 AI 服务配置

#### DeepSeek
- API 端点: `https://api.deepseek.com/chat/completions`
- 推荐模型: `deepseek-chat`
- 获取 API Key: [DeepSeek 官网](https://platform.deepseek.com/)

#### Kimi
- API 端点: `https://api.moonshot.cn/v1/chat/completions`
- 推荐模型: `kimi-k2-turbo-preview`
- 获取 API Key: [Kimi 官网](https://platform.moonshot.cn/)

#### OpenRouter
- API 端点: `https://openrouter.ai/api/v1/chat/completions`
- 推荐模型: `anthropic/claude-3.5-sonnet`
- 获取 API Key: [OpenRouter 官网](https://openrouter.ai/)

#### 阿里云百炼
- API 端点: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
- 推荐模型: `qwen-turbo`
- 获取 API Key: [阿里云百炼官网](https://www.aliyun.com/product/bailian)

#### 硅基流动
- API 端点: `https://api.siliconflow.cn/v1/chat/completions`
- 推荐模型: `Qwen/Qwen2.5-7B-Instruct`
- 获取 API Key: [硅基流动官网](https://cloud.siliconflow.cn/i/98WfcWmQ)

#### CherryIN
- API 端点: `https://open.cherryin.cc/v1/chat/completions`
- 推荐模型: `google/gemini-3-pro-preview`
- 获取 API Key: [CherryIN 官网](https://open.cherryin.ai/console)

#### 火山引擎
- API 端点: `https://ark.cn-beijing.volces.com/api/v3/chat/completions`
- 推荐模型: `doubao-seed-1-8-251215`
- 获取 API Key: [火山引擎官网](https://console.volcengine.com/ark)

#### AntChat
- API 端点: `https://antchat.alipay.com/v1/chat/completions`
- 推荐模型: `Kimi-K2-Instruct-0905`
- 获取 API Key: 暂无官网

#### OpenAI 兼容服务
- 支持任意兼容 OpenAI API 格式的服务
- 需自行填写 API URL、API Key 和模型名称
- 适用于自建服务、其他第三方中转等场景

## 目录结构

```
extension/
├── manifest.json                 # 扩展配置文件
├── background/
│   └── service_worker.js        # 后台服务
├── side_panel/
│   ├── index.html               # 侧边栏界面
│   ├── styles.css               # 样式文件
│   └── app.js                   # 业务逻辑
├── lib/
│   ├── storage-manager.js       # 配置存储管理
│   ├── ai-service.js            # AI 服务适配器
│   └── framework-engine.js      # 框架匹配引擎
├── resources/
│   ├── Frameworks_Summary.md    # 框架摘要
│   ├── SKILL.md                 # 技能说明
│   └── frameworks/              # 57 个框架详细文件
└── icons/                       # 插件图标
```

## 框架分类

### 按复杂度
- **简单(≤3要素)**: APE、ERA、TAG、RTF、BAB、PEE、ELI5
- **中等(4-5要素)**: RACE、CIDI、SPEAR、SPAR、FOCUS、SMART、GOPA
- **复杂(6+要素)**: RACEF、CRISPE、SCAMPER、Six Thinking Hats、PROMPT

### 按应用领域
- **营销内容**: BAB、SPEAR、Challenge-Solution-Benefit、BLOG
- **决策分析**: RICE、Pros and Cons、Six Thinking Hats、Tree of Thought
- **教育培训**: Bloom's Taxonomy、ELI5、Socratic Method、PEE
- **产品开发**: SCAMPER、HMW、CIDI、RELIC、3Cs Model
- **写作创作**: BLOG、4S Method、Few-shot、RHODES

## 开发说明

### 技术栈
- Vanilla JavaScript (无框架依赖)
- Chrome Extension Manifest V3
- Chrome Storage API
- Chrome Side Panel API

### 本地开发

```bash
# 克隆项目
git clone <repository-url>

# 进入目录
cd prompt-export-plugin

# 在 Chrome 中加载扩展(开发者模式)
# 选择 extension 文件夹
```

### 修改框架

所有框架文件位于 `extension/resources/frameworks/` 目录:
- 可以添加新的框架 markdown 文件
- 需同步更新 `Frameworks_Summary.md`
- 框架文件遵循统一格式

### 调试

1. 打开 Chrome DevTools
2. 在 Sources 面板中找到扩展文件
3. 设置断点调试
4. 查看 Console 输出

## 常见问题

### Q: API Key 安全吗?
A: API Key 使用 Chrome Storage Sync API 存储,由浏览器加密保护,仅存储在本地。

### Q: 支持离线使用吗?
A: 框架资源打包在扩展中,可离线浏览。但生成提示词需要调用 AI 服务,需要网络连接。

### Q: 为什么推荐的框架不准确?
A: 框架匹配基于 AI 分析,准确度取决于:
- 您提供的需求描述是否清晰
- AI 服务的理解能力
- 您可以尝试重新描述需求或手动选择其他推荐框架

### Q: 如何更换 AI 服务?
A: 点击设置按钮,选择不同的服务,配置对应的 API Key 即可。

### Q: 生成的提示词可以修改吗?
A: 可以!在生成结果后,您可以在输入框中说明修改需求,系统会重新生成。

## 许可证

本项目基于 CC-BY-NC-SA 许可证开源。

框架资源来自 prompt-optimizer skill,详见 `extension/resources/LICENSE.txt`。

## 贡献

欢迎提交 Issue 和 Pull Request!

## 更新日志

### v1.1.0 (2024-12-22)
- 🆕 新增阿里云百炼、硅基流动、CherryIN、火山引擎 4 个 AI 服务

### v1.0.0 (2024-12-21)
- 🎉 首次发布
- ✨ 支持 57 个提示词框架
- 🤖 支持 DeepSeek、Kimi、OpenRouter
- 💬 智能框架匹配和需求澄清
- 📋 一键复制生成的提示词

## 联系方式

如有问题或建议,欢迎通过以下方式联系:
- 提交 GitHub Issue
- 发送邮件

---

**享受提示词优化的乐趣!** 🚀
