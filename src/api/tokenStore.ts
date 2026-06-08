// アクセストークンをメモリ上だけで保持するストア
// localStorageを使わないことで、XSS経由でJavaScriptから読み取られるリスクを避ける
// ページをリロードするとこの値は失われる（意図的な仕様）
let accessToken: string | null = null

export const getAccessToken = () => accessToken

export const setAccessToken = (token: string | null) => {
    accessToken = token
}
