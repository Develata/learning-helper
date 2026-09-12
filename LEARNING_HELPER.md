# Learning Helper 运行壳

本仓库是 DeepSeek Harness 的薄 fork，负责固定 runtime、默认 Learning Helper profile 与本机 Docker 发行。学习业务、产品范围与 Agent 文档统一在 [dsh-learning-helper](https://github.com/Develata/dsh-learning-helper/tree/958cf67627736232d06a9eeee70cdcb2c0369248)。

v0.1 提供 TXT/Markdown → Evidence → 真实 Agent 问答/outline/plan/quiz → 学生作答 → 确定性评分 → Weak/ReviewQueue → PlanRevision 的学习闭环。Harness 原生 Learning 面板支持课程设置、资料导入、练习与反馈、进度、当前计划和修改原因。普通 UI 提交前隐藏答案；原始 session/debug/export 不是考试安全边界。

从 [部署说明](deploy/learning-helper/README.zh.md) 开始：`docker compose up --build -d`，取得官方本机登录地址后在 Harness 设置中配置模型。启动无需临时安装插件；版本固定、状态持久化、认证与 Origin 校验保留。源码运行见 [Harness integration](https://github.com/Develata/dsh-learning-helper/blob/958cf67627736232d06a9eeee70cdcb2c0369248/docs/operations/harness-integration.md)。

兼容版本与交付验证由 [UPSTREAM_BASE](UPSTREAM_BASE.md) 拥有，runtime patch 清单见 [UPSTREAM_PATCHES](UPSTREAM_PATCHES.md)。产品证明、真实模型范围与已知依赖风险见 [插件最终验收](https://github.com/Develata/dsh-learning-helper/blob/958cf67627736232d06a9eeee70cdcb2c0369248/docs/acceptance/final-delivery.md)；2–3 分钟演示见 [DEMO](https://github.com/Develata/dsh-learning-helper/blob/958cf67627736232d06a9eeee70cdcb2c0369248/docs/DEMO.md)。P5 后停止功能开发。
