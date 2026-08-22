FROM node:18-alpine

WORKDIR /app

# 1) Copy manifests + the Prisma schema BEFORE installing.
#    The `postinstall: prisma generate` script runs during `npm install`, so the
#    schema MUST already be present or it generates a wrong/empty client.
#    (Previously the schema was only copied later via `COPY . .`, so production
#    ran a stale client and every query threw "Invalid ... invocation".)
COPY package*.json ./
COPY prisma ./prisma

# 2) Install production deps. postinstall -> `prisma generate` now finds the
#    schema and builds the correct Linux (musl) client inside the image.
RUN npm install --production

# 3) Copy the rest of the source. Thanks to .dockerignore, the host's
#    node_modules is NOT copied, so the freshly generated client is preserved.
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
