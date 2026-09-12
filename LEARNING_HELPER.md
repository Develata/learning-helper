# Learning Helper 运行壳

本仓库是 DeepSeek Harness 的薄 fork，负责运行壳、upstream pin 与后续发行配置。学习业务、产品范围与 Agent 开工文档统一在 [dsh-learning-helper](https://github.com/Develata/dsh-learning-helper)；本地对应 `../dsh-learning-helper`。

已验证并发布的插件支持 P1 确定性学习反馈/计划修订与 P2 TXT/Markdown 课程证据、检索/引用及真实 DSH 只读 Agent tools。运行方法见固定版本的 [Harness integration](https://github.com/Develata/dsh-learning-helper/blob/ea48e81f1b44c90ed5999fd0bb4ec78edc7e5713/docs/operations/harness-integration.md)，能力与验收缺口见 [CURRENT](https://github.com/Develata/dsh-learning-helper/blob/ea48e81f1b44c90ed5999fd0bb4ec78edc7e5713/docs/CURRENT.md)。

版本基线由 [UPSTREAM_BASE](UPSTREAM_BASE.md) 拥有，core patch 清单由 [UPSTREAM_PATCHES](UPSTREAM_PATCHES.md) 拥有。默认 Learning Helper profile、Docker 与完整 MVP 发行尚未实现；本仓 upstream Web 构建/启动已在插件 smoke 中验证。
