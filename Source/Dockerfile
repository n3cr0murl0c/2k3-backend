FROM imbios/bun-node:1.1-20.12.2-slim AS base-stage
ENV NODE_OPTIONS --max-old-space-size=512
ENV NODE_OPTIONS --max_semi_space_size=128

WORKDIR /app/medusaBackend
# COPY yarn.lock .
COPY package.json .
COPY bun.lockb .
# RUN bun config set network-timeout 600000 -g
RUN bun add global @medusajs/medusa-cli@latest
# RUN bun config set network-timeout 600000 -g
RUN bun install --frozen-lockfile
###############################################################
FROM imbios/bun-node:latest-20.12.2-slim AS builder-stage

WORKDIR /app/medusaBackend
COPY . .
COPY --from=base-stage /app/medusaBackend/node_modules ./node_modules
RUN yarn run build:production
###############################################################
FROM imbios/bun-node:latest-20.12.2-slim AS production-final
 
RUN addgroup --system --gid 1002 nodejs && adduser --system --uid 1002 medusajs && addgroup medusajs nodejs

WORKDIR /app/medusaBackend
#Set the correct permission for prerender cache
COPY --from=base-stage --chown=medusajs:nodejs /app/medusaBackend/node_modules ./node_modules
COPY --from=builder-stage --chown=medusajs:nodejs  /app/medusaBackend/dist /app/medusaBackend/dist
# COPY --from=builder-stage --chown=medusajs:nodejs  /app/medusaBackend/build /app/medusaBackend/build
RUN mkdir -p /usr/local/lib/node_modules && chmod 777 /usr/local/lib/node_modules
RUN mkdir -p /app/medusaBackend/uploads && chmod 0764 /app/medusaBackend/uploads
COPY ./package.json .
COPY ./medusa-config.js .
COPY develop.sh .
RUN chown medusajs:nodejs /app/medusaBackend -R
COPY --chown=medusajs:nodejs ./uploads /app/medusaBackend/uploads
RUN chmod 0764 /app/medusaBackend/uploads -R
RUN chmod +x ./develop.sh
EXPOSE 9000
RUN bun install -g @medusajs/medusa-cli
USER medusajs
ENTRYPOINT [ "bash","develop.sh", "start:dev" ]
##########################################################################


