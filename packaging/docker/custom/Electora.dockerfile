ARG GRAFANA_VERSION

FROM node:22-alpine AS frontend-build

ENV YARN_VERSION=4.6.0

RUN apk add --no-cache curl && \
    corepack enable && \
    corepack prepare yarn@$YARN_VERSION --activate

WORKDIR /app

# COPY packages ./packages
# COPY package.json yarn.lock ./

COPY . .

RUN yarn install --immutable

RUN yarn build

FROM grafana/grafana:${GRAFANA_VERSION}

WORKDIR /usr/share/grafana

COPY --from=frontend-build /app/public/build ./public/build

# entrypoint und CMD are defined in base image
