// バックエンドAPIのベースURL。環境ごとに .env（VITE_API_BASE_URL）で切り替える。
// ここ1箇所に集約することで、本番デプロイ時に URL を1箇所直せば全 API 呼び出しが追従する。
//
// apiClient と auth の両方からこの定数を参照するため、
// 循環 import（apiClient → auth → apiClient）を避ける目的で
// 独立ファイルとして切り出している。
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
