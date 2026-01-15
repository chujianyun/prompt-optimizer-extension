# Prompt Optimizer
![](https://mingmingruyue-hz.oss-cn-hangzhou.aliyuncs.com/2025/20260115214735190.png)

当前很多提示词优化工具缺乏用户核对，而且给出的提示词虽然很结构化和详细，但是多为通用框架。

本工具是基于 57 个知名的专业提示词框架的 Chrome 浏览器智能提示词优化助手。


特色：会根据你的描述或原始提示词，匹配最适合的框架，对描述进行澄清，最终产出专业的提示词。

## 演示视频

参见：`resources/video/提示词优化插件使用演示.mp4` 

## 功能特性

- **智能框架匹配** - 根据需求自动推荐最适合的提示词框架
- **多 AI 服务支持** - DeepSeek、Kimi、OpenRouter、阿里云百炼、硅基流动、CherryIN、火山引擎灵活切换
- **交互式澄清** - 通过对话式交互完善需求细节
- **一键复制** - 生成的提示词可直接复制使用
- **57 个框架** - 涵盖营销、决策、教育、产品开发等多个领域

## 快速开始

### 1. 安装扩展

```bash
1. 打开 Chrome 浏览器，访问 chrome://extensions/
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 extension 文件夹
```

### 2. 配置 AI 服务

推荐使用 **DeepSeek**（性价比高，速度快）

| 服务 | API 端点 | 推荐模型 | 获取 Key |
|------|---------|---------|----------|
| DeepSeek | api.deepseek.com | deepseek-chat | [官网](https://platform.deepseek.com/) |
| Kimi | api.moonshot.cn | kimi-k2-turbo-preview | [官网](https://platform.moonshot.cn/) |
| OpenRouter | openrouter.ai | google/gemini-3-flash-preview | [官网](https://openrouter.ai/) |
| 阿里云百炼 | dashscope.aliyuncs.com | qwen3-max | [官网](https://www.aliyun.com/product/bailian) |
| 硅基流动 | api.siliconflow.cn | deepseek-ai/DeepSeek-V3.2 | [官网](https://cloud.siliconflow.cn/) |
| CherryIN | open.cherryin.cc | gpt-4o | [官网](https://open.cherryin.ai/console) |
| 火山引擎 | ark.cn-beijing.volces.com |doubao-seed-1-6-flash-250828 | [官网](https://console.volcengine.com/ark) |
| AntChat | antchat.alipay.com | Kimi-K2-Instruct-0905 | - |
| OpenAI 兼容 | 自定义 | 自定义 | - |

注：Chrome 扩展默认受同源策略限制，无法跨域请求外部 API. OpenAI 兼容如果不支持，需要再 manifest.json 的 host_permissions 中增加对应的 url

### 3. 使用流程

```
输入需求 → 系统推荐框架 → 选择框架 → 回答澄清问题 → 获取优化提示词 → 复制使用
```

## 项目结构

```
prompt-optimizer-extension/
├── extension/                    # Chrome 扩展主目录
│   ├── manifest.json            # 扩展配置
│   ├── background/              # 后台服务
│   ├── side_panel/              # 侧边栏界面
│   ├── lib/                     # 核心库
│   │   ├── storage-manager.js   # 配置存储
│   │   ├── ai-service.js        # AI 服务适配器
│   │   └── framework-engine.js  # 框架匹配引擎
│   └── resources/               # 资源文件
│       └── frameworks/          # 57 个框架文件
├── PROJECT_SUMMARY.md           # 项目完成总结
└── QUICK_START.md               # 快速启动指南
```

## 技术栈

- Vanilla JavaScript（无框架依赖）
- Chrome Extension Manifest V3
- Chrome Storage Sync API
- Chrome Side Panel API

## 框架分类

| 复杂度 | 框架示例 |
|-------|---------|
| 简单 (≤3要素) | APE、ERA、TAG、RTF、BAB、ELI5 |
| 中等 (4-5要素) | RACE、CIDI、SPEAR、SMART、FOCUS |
| 复杂 (6+要素) | RACEF、CRISPE、SCAMPER、Six Thinking Hats |

| 应用领域 | 推荐框架 |
|---------|---------|
| 营销内容 | BAB、SPEAR、Challenge-Solution-Benefit |
| 决策分析 | RICE、Pros and Cons、Six Thinking Hats |
| 教育培训 | Bloom's Taxonomy、ELI5、Socratic Method |
| 产品开发 | SCAMPER、HMW、CIDI、3Cs Model |

## 文档

- [快速启动指南](QUICK_START.md)
- [项目完成总结](PROJECT_SUMMARY.md)
- [扩展详细说明](extension/README.md)
- [测试指南](extension/TESTING.md)

## 相关项目

- [Claude Skill 版本](https://github.com/chujianyun/skills) - 基于同一套提示词优化思路的 Claude Skill 实现

## 许可证

本项目基于 CC-BY-NC-SA 许可证开源。框架资源详见 `extension/resources/LICENSE.txt`。

## 作者

悟鸣
