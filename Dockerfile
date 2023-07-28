#
#   This sets up the NodeJS base to use
#
FROM node:20-alpine as base
RUN npm i -g pnpm

#
#   This installs the dependencies
#
FROM base as dependencyInstall
WORKDIR /app
# Copy package.json and pnpm-lock.yaml into the work directory
COPY package.json pnpm-lock.yaml ./
# Install dependencies
RUN pnpm install

#
#   This builds the TypeScript files
#
FROM base as build
WORKDIR /app
# Copy all project files
COPY . .
# Copy dependencies from the last stage
COPY --from=dependencyInstall /app/node_modules ./node_modules
# Compile the typescript files
RUN pnpm build

#
#   This runs the deployment process
#
FROM base as deploy
WORKDIR /app
# Copy the built files into our container
COPY --from=build ./app/dist ./dist
# Copy the node modules
COPY --from=dependencyInstall /app/node_modules ./node_modules
# Run the project
CMD ["node", "dist/index.js"]
