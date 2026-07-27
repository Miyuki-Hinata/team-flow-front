import { getAccessToken, setAccessToken } from './tokenStore'
import { refresh } from './auth'
// API_BASE_URL は循環 import 回避のため config.ts に置き、ここから再エクスポートする。
// 既存の `from './apiClient'` 経由の利用を壊さないため。
export { API_BASE_URL } from './config'

// fetchをラップし、401（アクセストークン切れ）を検知したら
// リフレッシュトークンで新しいアクセストークンを取得し、リクエストを1度だけ自動リトライする
export const fetchWithAuth = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const response = await fetch(input, init)

    if (response.status !== 401) {
        return response
    }

    try {
        const data = await refresh()
        setAccessToken(data.token)
    } catch {
        // リフレッシュトークンも無効 = 再ログインが必要
        // ログイン後に元のページへ戻れるよう、現在のURLをsessionStorageに保存する
        // ※ sessionStorageはタブを閉じると消えるブラウザの一時メモ帳
        // ※ apiClient.tsはReactの外なのでReact RouterのstateではなくsessionStorageを使う
        setAccessToken(null)
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search)
        window.location.href = '/login'
        return response
    }

    // 新しいアクセストークンを使って元のリクエストをやり直す
    return fetch(input, {
        ...init,
        headers: {
            ...(init?.headers as Record<string, string> | undefined),
            Authorization: `Bearer ${getAccessToken()}`,
        },
    })
}

// レスポンスが失敗(!ok)ならユーザー向けメッセージで throw する共通ヘルパー。
// 作成/更新/削除など「成否をユーザーに伝えたい」呼び出しでエラー処理を重複させないために使う。
// ・401 は apiClient 側でログイン画面へ自動遷移するが、一瞬見える可能性に備えて意味を持たせる
// ・それ以外はサーバー返却の error メッセージを優先、無ければ fallback。空/非JSONでも落ちないよう try/catch
export const okOrThrow = async (response: Response, fallbackMessage: string): Promise<void> => {
    if (response.ok) return
    if (response.status === 401) {
        throw new Error('セッションが切れました。再度ログインしてください。')
    }
    let message = fallbackMessage
    try {
        const errorData = await response.json()
        if (errorData?.error) message = errorData.error
    } catch {
        // 空ボディ等で JSON パースに失敗した場合は fallback を使う
    }
    throw new Error(message)
}
