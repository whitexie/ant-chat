## [0.2.1](https://github.com/whitexie/ant-chat/compare/v0.2.0...v0.2.1) (2025-02-14)


### Bug Fixes

* 改进系统提示词和用户消息的展示效果 ([5c5732f](https://github.com/whitexie/ant-chat/commit/5c5732f52919f12fa9ee076c89e4bfa142f2b445))
* 系统提示词消息不支持删除 ([71ade30](https://github.com/whitexie/ant-chat/commit/71ade3039fd466c0f25b84acf2646e9a605197e2))
* 修复AI回答时无法中止 ([94d961b](https://github.com/whitexie/ant-chat/commit/94d961b7786522739af75856095e6d0fd279c79a))
* 修复temperature不生效 ([ce5196f](https://github.com/whitexie/ant-chat/commit/ce5196f135e2b1afcf23eb1124e7c6d61592f311))
* add onPressEnter handler to ConversationsTitle input ([1dc6591](https://github.com/whitexie/ant-chat/commit/1dc65911c9a4e6161301c5092bda8eff43c09bfc))
* decryptData 现在返回原始字符串，不再进行 JSON 解析 ([1e3cc50](https://github.com/whitexie/ant-chat/commit/1e3cc5007d2803cecc5fb1071a30c05046630122))


### Features

* 通过语法高亮和改进的代码块支持增强 Markdown 渲染 ([cf077bf](https://github.com/whitexie/ant-chat/commit/cf077bf46c80b5f6e7b1238fae3886c5b91b1daa))



# [0.2.0](https://github.com/whitexie/ant-chat/compare/v0.1.0...v0.2.0) (2025-02-04)


### Bug Fixes

* 调整ChatMessage ([b615596](https://github.com/whitexie/ant-chat/commit/b6155961ce42039f7b22faefbba63a022d29b867))
* improve conversation title generation robustness ([86a4092](https://github.com/whitexie/ant-chat/commit/86a4092ca85852e379bce3d2f71130ac39002333))
* stream 支持自定义分隔符 ([951a4ff](https://github.com/whitexie/ant-chat/commit/951a4ff0ad9305ee5aff8ab6aea7651a815b6aa4))


### Features

* 加密存储模型配置 ([86f1d38](https://github.com/whitexie/ant-chat/commit/86f1d38dd9fea2250eb81b600b880ed2e0d6a92e))
* 添加基于 Dexie 的 IndexedDB 数据库以存储Conversations 和 Messages ([ae54643](https://github.com/whitexie/ant-chat/commit/ae54643d654729ee6ff7e7280a0757af52a4ce50))
* 增加OpenAIService ([bc8a7b9](https://github.com/whitexie/ant-chat/commit/bc8a7b9fb179b8f1f06036af5c4adbd5c6369e72))
* 支持多AI提供商配置 ([5f7d7b0](https://github.com/whitexie/ant-chat/commit/5f7d7b06fc74f788435b59e36c4faa1ae52d536a))
* 支持设置系统提示词 ([409a607](https://github.com/whitexie/ant-chat/commit/409a607a694ca491d781474d06c57173ae355d38))
* 自动生成会话标题功能 ([93223a7](https://github.com/whitexie/ant-chat/commit/93223a787a7f7629fc958a81888b9cf7247acc61))
* add google gemini services ([2b7174c](https://github.com/whitexie/ant-chat/commit/2b7174c2383fb2a45484e016cbfd0641fecada50))



# [0.1.0](https://github.com/whitexie/ant-chat/compare/v0.0.2...v0.1.0) (2025-01-23)


### Bug Fixes

* 修复ai回复的内容混乱问题 ([487bd4c](https://github.com/whitexie/ant-chat/commit/487bd4cb16f9c478d74fce04373ff3da33d57886))
* 修复Settings的model字段选中值不生效问题 ([82c9de9](https://github.com/whitexie/ant-chat/commit/82c9de9a1b5d38f1c4fee50d13a02bbf056995ca))


### Features

* 根据对话上下文自动生成标题 ([10169e0](https://github.com/whitexie/ant-chat/commit/10169e0b8283ac055baf7680d2f1f5e9543604b7))
* 使用react-markdown 替换markdown-it. 抽离RenameModal组件.优化首屏渲染 ([7db5db6](https://github.com/whitexie/ant-chat/commit/7db5db639dc818c34f6192ee7db458df70747d60))



## [0.0.2](https://github.com/whitexie/ant-chat/compare/v0.0.1...v0.0.2) (2025-01-21)


### Bug Fixes

* 处理聊天消息处理中的错误 ([e6bdb03](https://github.com/whitexie/ant-chat/commit/e6bdb0379aa024fd07a50fb4a98cd1d17ddb698f))
* 发送消息时，同步关闭sender.header窗口 ([4bc16e4](https://github.com/whitexie/ant-chat/commit/4bc16e4e77281660b9d2dd664037b683aaa03d1a))
* 优化发送消息逻辑 ([d79524b](https://github.com/whitexie/ant-chat/commit/d79524b2db2aaf42c336a8a7aec9f343a902bbeb))
* modelConfigStore 增加reset函数 ([f667ce5](https://github.com/whitexie/ant-chat/commit/f667ce5baf4228694e935f669afde90b0055182e))


### Features

* 侧边栏增加版本信息入口 ([cf0ae62](https://github.com/whitexie/ant-chat/commit/cf0ae621fbbf27c7c0e5b858afff6af5528406df))
* 对话气泡增加复制、刷新和删除功能 ([388c49c](https://github.com/whitexie/ant-chat/commit/388c49c60bf916b1672380fa97dd76ed5e59c918))
* 消息气泡增加格式化时间显示 ([2f1deb0](https://github.com/whitexie/ant-chat/commit/2f1deb03b608a3a0402c093ca84450337eb6696b))
* 增加Github的跳转Button ([435a22f](https://github.com/whitexie/ant-chat/commit/435a22fb6f9ec5f759cd8d3c8ea66b2fe4afc4ba))
* conversationStore 状态优化 ([a54fac1](https://github.com/whitexie/ant-chat/commit/a54fac15ef8bd5728dfb461272f1a2b952a2c531))
* convesationsStore 增加 reset 方法，重置Store ([ec5a429](https://github.com/whitexie/ant-chat/commit/ec5a4292b2234358af9cdf4762552ab8fd800b01))
* store初步实现 ([58d9c15](https://github.com/whitexie/ant-chat/commit/58d9c15ad91fb94470fe888aaf6c52bfe7655a35))



## 0.0.1 (2025-01-16)


### Bug Fixes

* 对话列表溢出 ([3eee011](https://github.com/whitexie/ant-chat/commit/3eee0111739561071c419debadbc1df33e567c77))
* 对话数据同步 ([8b29442](https://github.com/whitexie/ant-chat/commit/8b29442db463c0a6cb7a1eacbdd7c9ef36f31361))
* 修复切换新对话时，对话数据更新异常问题 ([9ebaf4d](https://github.com/whitexie/ant-chat/commit/9ebaf4d4620b76354cca5fd00eee1698974782ae))
* 优化发送消息 ([c452d0f](https://github.com/whitexie/ant-chat/commit/c452d0f5314ac41387265dc856351c8785f88d0a))


### Features

* 对话功能支持发送图片 ([a4b8320](https://github.com/whitexie/ant-chat/commit/a4b8320f69fc4afe7b334f32f1f37daf25979a60))
* 对话管理和黑暗模式 ([d070a27](https://github.com/whitexie/ant-chat/commit/d070a2739a820504f6112de0abcf07d6ce692b35))
* 对话管理增加清空功能 ([482c7d9](https://github.com/whitexie/ant-chat/commit/482c7d9192622743c6103d72ba1975fd1341b762))
* 对话数据 导入/导出 功能 ([1fcd9ea](https://github.com/whitexie/ant-chat/commit/1fcd9ea4853a303dd966200942c1d4c6e9e167f1))
* 对话重命名、删除功能 ([a4d14d2](https://github.com/whitexie/ant-chat/commit/a4d14d2b4e068c5291e78f5931f5aaf74e6398d3))
* 更换图标方案 ([624568c](https://github.com/whitexie/ant-chat/commit/624568cf8e84ca98663cdf497094e46c8a9193d8))
* 更换新logo ([d3636db](https://github.com/whitexie/ant-chat/commit/d3636dbc75459515f46fef3f850c47cf877c2c4e))
* 开启gzip压缩 ([8d6bf92](https://github.com/whitexie/ant-chat/commit/8d6bf9291d2735ef3bd71f55fb9eb97c1e76ac9f))
* 模型支持配置 ([87fcb14](https://github.com/whitexie/ant-chat/commit/87fcb14a6c9efae474d392a5370b0759c6ddbcfb))
* 图标方案使用 @ant-design/icons ([793cd4b](https://github.com/whitexie/ant-chat/commit/793cd4b7971dc666d615f49fc83273a39a6c088b))
* add file system access utilities and update type definitions ([f045b21](https://github.com/whitexie/ant-chat/commit/f045b21bea3f499445b6b903d6b9f77632ef88f2))
* add immer and use-immer dependencies ([6604839](https://github.com/whitexie/ant-chat/commit/66048398619a234d03c2e11990de46b8815f36c7))
* add vitest ([557e836](https://github.com/whitexie/ant-chat/commit/557e836af51e68b4ba59492dace26ba11bdb2d2d))
* first commit ([7fbc120](https://github.com/whitexie/ant-chat/commit/7fbc12020c88b27fe94637cb14e4b4aaa8dec4b5))
* lazy load RenderMarkdown and SettingsModal components ([dc5bc6b](https://github.com/whitexie/ant-chat/commit/dc5bc6be37187a1a2b80a276ddaac2f9f4e33ce6))



