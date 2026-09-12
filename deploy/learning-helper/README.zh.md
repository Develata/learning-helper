# Learning Helper 本机部署

[English](README.md) | 中文

这是发行层；学习业务与产品 authority 在 [插件 docs](https://github.com/Develata/dsh-learning-helper/tree/main/docs)。需要 Docker Engine 28+ / Docker Desktop、Compose、约 8 GiB 可用构建内存。目标平台 linux/amd64，实际验收状态见插件 CURRENT。

```bash
git clone https://github.com/Develata/learning-helper.git
cd learning-helper/deploy/learning-helper
docker compose up --build -d
docker compose exec learning-helper node /opt/learning-helper/open.mjs
```

最后一条输出 Harness 官方临时登录 URL，打开后换取 HttpOnly cookie。不要截图、分享或持久保存 token；容器日志将它隐去。首次进入在 Harness 模型设置配置 provider。无凭证时仍可创建课程、上传资料和查看状态，但 Agent 不生成新学习内容。

## 构建与运行

[versions.lock.json](versions.lock.json) 是构建输入 authority：Node/pnpm、两仓 SHA、upstream baseline、基础镜像 digest。`harnessForkSha` 指获取 Harness 源码的已发布输入提交，不是包含这个 JSON 的元数据提交，避免自引用 SHA；发行 HEAD 由 Git 追踪。插件 SHA 固定到已经推送的验收提交。

Docker build 获取 exact SHA，使用 frozen lockfile；构建 Harness 后以其 upstream runtime closure 为基础，按公开 package.json 补齐插件与 Web 所需的 required workspace peers，再用 pnpm deploy 导出生产依赖。构建阶段的 manifest overlay 不改 Harness 实现；只补入 workspace importer 的相对 link 记录，不重新解析外部 semver，并断言全部外部包版本/integrity 与原 lockfile 完全一致。只在 build stage 为同一个已审核的 subprocess-local postinstall 补充绝对路径许可。插件独立 build/pack 后通过正式 `dsh plugin` 安装，peer 复用固定 Harness runtime。runtime 不 install/clone/update，不带 Git history、构建缓存或测试源码。

预构建 profile 在 image 内，插件所需 peer 显式链接到固定 runtime。Harness vendored schemastery 为 3.18.2，而插件锁定 3.18.1；后者连同其小型依赖集合从插件 frozen install 复制，不替换 Harness 版本，也不放宽 peer 声明。运行集合没有顶层 React 时，同样从插件锁定安装复制 React 18.3.1 及其依赖；浏览器仍使用 Harness 共享的 React。首次启动原子复制到 `/data/profiles/learning-helper-<插件SHA前12位>`，由 Harness 自己维护模块链接。相同版本重启复用，不安装依赖；新版本使用独立 profile，学习 DB/设置仍共用 DSH_HOME，旧 profile 保留。不要在交付 profile 安装/改写包；自定义组合使用源码开发流程。

## 网络与状态

Harness 只监听容器内 127.0.0.1:3000。TCP bridge 监听容器 3001；Compose 仅发布 **127.0.0.1:3000 → 3001**。桥接不改写 Host/Origin/cookie/WebSocket，Harness 仍检查信任与认证。没有 trust-all、auth bypass 或写死 token。参考 [Docker localhost port publishing](https://docs.docker.com/engine/network/port-publishing/)；低于 28 的旧 Docker 不在此部署支持范围内。

`learning-data` volume 挂载 DSH_HOME=/data，保存学习 DB、Evidence DB、会话、设置与运行时凭证；uid/gid 1000 的 node 用户拥有新 volume。已有 bind mount 由操作者准备权限，程序不递归 chown 用户目录。不要将 .env 或 key COPY/ARG 进入镜像。

healthcheck 用本进程官方 launch token 换取 cookie，再请求受保护的 `/learning-helper/v1/health`，总限时 7 秒，输出不含 token。bridge 限定连接数、连接等待和空闲时间；停止时转发信号并有界等待。Docker 日志最多 3×10 MiB。

```bash
docker compose ps
docker compose logs --tail 100
docker compose restart
docker compose stop
```

stop/restart 保留 volume；不要用 `down --volumes` 处理日常数据。独立演示重置见 [DEMO](https://github.com/Develata/dsh-learning-helper/blob/main/docs/DEMO.md)。

## 最终验收

```bash
node --test scripts/bridge.test.mjs
node scripts/acceptance.mjs /absolute/path/to/dsh-learning-helper
```

验收执行 build --no-cache，使用唯一 project/new volume，挂载仅测试用 observer（正常 image/profile 没有）；真实 Chromium 创建/上传/练习/Weak/v2/刷新，容器重启后核对学习和 Source。结束只移除本次 fixture project/volume。浏览器复用固定 Harness checkout 的 Playwright；sanitized 回执在插件 artifacts/docker-result.json。排障可设置 `LH_DOCKER_USE_CACHE=1` 复用构建层，回执会明确记录；最终验收不设置该变量，必须 no-cache。

端口占用时先停止其他演示 project；volume profile 路径冲突时明确退出，不覆盖用户文件。远程公网、额外 auth、多用户不属于 v0.1。
