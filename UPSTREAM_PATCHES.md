# Upstream patches

当前 Harness runtime patches：**0**。`packages/` 与 `apps/` 相对 [固定基线](UPSTREAM_BASE.md) 无变更。

本批次增加独立 tag-only Release workflow、镜像验收/发布与 pull-only Compose；不修改Harness实现。CI 将已测试镜像原样推送 GHCR，运行记录和digest随Release发布；日常实例不会自动升级。源码pin与镜像验收范围由 [UPSTREAM_BASE](UPSTREAM_BASE.md) 说明。

v0.2只调整发行层：固定Workspace插件版本、按实际版本安装预构建tgz、Workspace持久化与显式v1迁移说明、独立Docker/Chromium/重启验收。构建获取exact SHA，保留外部依赖版本与integrity；profile通过公开package manifest补齐required peers，不修改Harness implementation。

容器内Harness保持loopback监听；TCP bridge保留Host/Origin/cookie/WebSocket语义，宿主默认127.0.0.1:3010。没有trust-all或auth bypass，runtime不安装/clone/update。

`.codegraph/`由本地`.git/info/exclude`忽略；不修改upstream `.gitignore`，不使用submodule。学习业务、Workspace解析、PDF/vision/MinerU、UI与grounding全部位于独立插件。已有独立branding worktree未合入本分支。

未来core patch仍须先证明bundle/profile/Host/client/slot的公开扩展点不足，并记录位置、理由、upstream SHA和维护方式。
