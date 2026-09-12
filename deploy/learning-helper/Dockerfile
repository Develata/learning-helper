FROM node:24.18.0-bookworm@sha256:5711a0d445a1af54af9589066c646df387d1831a608226f4cd694fc59e745059 AS build
RUN npm install --global pnpm@11.7.0
WORKDIR /build
COPY versions.lock.json scripts/build.mjs ./
RUN node build.mjs
COPY scripts/provision-profile.mjs ./
RUN node provision-profile.mjs

FROM node:24.18.0-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d
ENV NODE_ENV=production DSH_HOME=/data
COPY --from=build /opt/runtime /opt/runtime
COPY --from=build /usr/local/lib/node_modules/pnpm /usr/local/lib/node_modules/pnpm
RUN ln -s /usr/local/lib/node_modules/pnpm/bin/pnpm.cjs /usr/local/bin/pnpm && mkdir /data && chown node:node /data
COPY scripts/runtime.mjs scripts/bridge.mjs scripts/health.mjs scripts/open.mjs /opt/learning-helper/
COPY versions.lock.json /opt/learning-helper/versions.lock.json
USER node
WORKDIR /data
EXPOSE 3001
ENTRYPOINT ["node", "/opt/learning-helper/runtime.mjs"]
