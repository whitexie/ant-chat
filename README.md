<div align="center">

<img height="180" src="./packages/electron/src/renderer/public/logo.svg" />

# Ant Chat

基于 Electron 和 `ant-design-x` 的现代化 AI 聊天桌面应用，支持多模型提供商、MCP协议集成和本地数据加密存储

[![codecov](https://codecov.io/gh/whitexie/ant-chat/branch/main/graph/badge.svg?token=ZF0U1B9XI1)](https://codecov.io/gh/whitexie/ant-chat)
[![CI](https://github.com/whitexie/ant-chat/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/whitexie/ant-chat/actions/workflows/ci.yml)

[下载应用](https://github.com/whitexie/ant-chat/releases) | [功能特性](#功能特性-) | [开发指南](#开发指南-)

</div>

## 功能特性 ✨

### 🤖 多AI提供商支持

- **OpenAI** - GPT系列模型
- **Google Gemini** - Gemini Pro/Flash 系列，支持联网搜索
- **DeepSeek** - DeepSeek系列模型，支持深度思考过程显示
- **自定义 API** - 支持兼容OpenAI格式的API

### 💬 智能聊天体验

- 🔤 **实时打字效果** - 模拟真实对话体验
- 📝 **Markdown 渲染** - 支持语法高亮、表格、列表等
- 🎨 **代码块预览** - HTML代码块实时预览
- 📊 **Mermaid图表** - 支持流程图、时序图等可视化图表
- 🎤 **语音输入** - 语音转文字功能
- 📎 **附件上传** - 支持图片和文件上传（Gemini模型）
- 🌐 **联网搜索** - 实时获取网络信息（仅Gemini支持）

### 💾 数据管理

- 📦 **本地存储** - 基于SQLite的本地数据库存储
- 🔐 **数据加密** - 模型配置和敏感数据AES加密
- 📂 **会话管理** - 对话历史管理、分组、导入/导出
- ♾️ **无限滚动** - 大量消息的高效加载

### 🎨 用户界面

- 🌙 **主题切换** - 暗黑/亮色主题，支持跟随系统
- ⚡ **性能优化** - React 19 + 现代化构建工具
- 🎯 **智能交互** - 消息状态显示、中断生成等

### 🔌 MCP协议支持

- **Model Context Protocol** - 扩展AI能力的标准协议
- **插件生态** - 支持各种MCP工具和服务
- **动态配置** - 灵活的MCP服务配置管理

## 技术栈 🛠️

### 核心框架

- **Electron** - 跨平台桌面应用框架
- **React 19** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具

### UI组件

- **Ant Design X** - 专为AI应用设计的组件库
- **Ant Design** - 企业级UI设计语言
- **TailwindCSS** - 原子化CSS框架

### 状态管理与存储

- **Zustand** - 轻量级状态管理
- **Drizzle ORM** - TypeScript优先的ORM
- **Better-SQLite3** - 高性能SQLite数据库

### 开发工具

- **ESLint** - 代码质量检查
- **Vitest** - 单元测试框架
- **Husky** - Git hooks工具
- **Electron Builder** - 应用打包工具

## 安装使用 📦

### 预编译版本

1. 前往 [Releases](https://github.com/whitexie/ant-chat/releases) 页面
2. 下载适合你操作系统的安装包
3. 安装并启动应用

### 系统要求

- **macOS**: 10.15+ (Intel/Apple Silicon)
- **Windows**: Windows 10+ (x64)
- **Linux**: Ubuntu 18.04+ / 同等版本

## 开发指南 🚀

### 环境要求

- Node.js 22+
- pnpm 10+
- Python 3.x (用于node-gyp)

### 快速开始

```bash
# 克隆项目
git clone https://github.com/whitexie/ant-chat.git
cd ant-chat

# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 构建应用
pnpm build:mac    # macOS
pnpm build:win    # Windows
pnpm build:linux  # Linux
```

### 项目结构

```
ant-chat/
├── packages/
│   ├── electron/           # Electron主应用
│   │   ├── src/
│   │   │   ├── main/      # 主进程
│   │   │   ├── preload/   # 预加载脚本
│   │   │   └── renderer/  # 渲染进程
│   │   └── migrations/    # 数据库迁移
│   ├── mcp-client-hub/    # MCP客户端
│   └── shared/            # 共享类型和工具
├── .github/               # GitHub Actions
└── docs/                  # 文档
```

### 开发脚本

```bash
# 开发
pnpm dev                  # 启动开发环境
pnpm type-check          # 类型检查
pnpm test:unit           # 运行单元测试

# 数据库
pnpm db:generate         # 生成数据库迁移
pnpm db:migrate          # 执行数据库迁移

# 构建
pnpm build:mac           # 构建macOS版本
pnpm build:win           # 构建Windows版本
```

## 贡献指南 🤝

我们欢迎任何形式的贡献！

### 提交问题

- 使用 GitHub Issues 报告bug或提出功能建议
- 提供详细的复现步骤和环境信息

### 代码贡献

1. Fork 项目仓库
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交修改: `git commit -m 'feat: add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 开发规范

- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 确保代码通过 ESLint 检查
- 添加必要的单元测试
- 更新相关文档

## 许可证 📄

本项目采用 [MIT 许可证](./LICENSE) - 查看 LICENSE 文件了解详情

## 致谢 🙏

感谢以下优秀的开源项目：

- [Ant Design X](https://github.com/ant-design/x) - AI应用组件库
- [Electron](https://electronjs.org/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - 用户界面库

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！**

[报告问题](https://github.com/whitexie/ant-chat/issues) · [功能建议](https://github.com/whitexie/ant-chat/issues) · [参与讨论](https://github.com/whitexie/ant-chat/discussions)

</div>
