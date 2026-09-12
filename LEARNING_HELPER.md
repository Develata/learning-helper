# Learning Helper 运行壳

本仓库是 DeepSeek Harness 的薄 fork，负责运行壳、upstream pin 与后续发行配置。学习业务、产品范围与 Agent 开工文档统一在 [dsh-learning-helper](https://github.com/Develata/dsh-learning-helper)；本地对应 `../dsh-learning-helper`。

已验证并发布的插件支持课程资料驱动的 backend 学习闭环：TXT/Markdown Evidence → grounded outline → 初始 StudyPlan → Quiz → 确定性评分 → weak/review/PlanRevision。P3 提供七个正式 DSH tools，支持发布验证与幂等恢复；真实 LLM 语义验收仍缺模型凭证。运行方法见固定版本的 [Harness integration](https://github.com/Develata/dsh-learning-helper/blob/6eeaf75f6e364546829141bdd50396933c49050f/docs/operations/harness-integration.md)，能力与验收缺口见 [CURRENT](https://github.com/Develata/dsh-learning-helper/blob/6eeaf75f6e364546829141bdd50396933c49050f/docs/CURRENT.md)。

版本基线由 [UPSTREAM_BASE](UPSTREAM_BASE.md) 拥有，core patch 清单由 [UPSTREAM_PATCHES](UPSTREAM_PATCHES.md) 拥有。默认 Learning Helper profile、Docker 与完整 MVP 发行尚未实现；本仓 upstream Web 构建/启动已在插件 smoke 中验证。
