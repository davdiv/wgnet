# syntax=docker/dockerfile:1.2
FROM docker.io/library/node:24-alpine
WORKDIR /usr/app
COPY dist/package.json package-lock.json ./
RUN npm ci
COPY dist/ ./
USER node
ENV WGNET_HOST=::
ENTRYPOINT ["./wgnet"]
CMD ["server"]
