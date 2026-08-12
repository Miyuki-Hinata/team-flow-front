# TeamFlow フロントエンドのイメージを作るレシピ（マルチステージビルド）。
#
# ステージ1（build）：Node + npm で dist/（静的ファイル一式）を作る「作業場」。
# ステージ2（配信）：nginx に dist/ だけを載せて配る「出荷箱」。
# バックエンドの Dockerfile と同じ構造（作業場は使い捨て、最終イメージは出荷箱のみ）。

# ---- ステージ1：ビルド ----
# Node は現行 LTS の 24（Node は偶数メジャーのみが LTS になる）。
# alpine は超軽量 Linux ベースの小型版タグ
FROM node:24-alpine AS build

WORKDIR /build

# 依存の定義だけを先にコピーして npm ci。
# レイヤキャッシュの理屈はバックエンドと同じ：ソースだけ変えた再ビルドで
# 依存の再ダウンロードを飛ばす。npm ci は package-lock.json どおりに
# まっさらから入れるモードで、ホストとコンテナの依存差を構造的に防ぐ
COPY package.json package-lock.json ./
RUN npm ci

# VITE_ 環境変数はビルド時に JS へ文字列として焼き込まれる（実行時には読めない。
# ビルド後の JS は訪問者のブラウザで動くため）。.env は持ち込まない方針なので、
# ビルド引数 ARG として受け取る。既定値はローカル動作用で、
# compose や本番ビルドでは --build-arg で差し替える
ARG VITE_API_BASE_URL=http://localhost:8080

# ソース一式を持ち込んでビルド（tsc -b の型検査 + vite build）。
# 不要物は .dockerignore が除外済み
COPY . .
RUN npm run build

# ---- ステージ2：配信 ----
# nginx の公式イメージ（alpine 版）。静的ファイル配信の定番
FROM nginx:1.29-alpine

# SPA 用のサイト設定（history fallback 入り）で既定設定を差し替える。
# これが無いと React Router のパスへの直リンク・リロードが 404 になる
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルド成果物だけをステージ1から受け取り、nginx の公開フォルダに置く。
# /usr/share/nginx/html は公式イメージの既定の配信元
COPY --from=build /build/dist /usr/share/nginx/html

# nginx の既定の待ち受けポート（表明。公開は compose 側の仕事）
EXPOSE 80

# ENTRYPOINT は書かない：nginx 公式イメージに起動コマンドが定義済みで、
# FROM で土台にした時点でそれを継承している
