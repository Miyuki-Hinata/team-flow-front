import { getAccessToken, setAccessToken } from './tokenStore'
import { refresh } from './auth'

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
        setAccessToken(null)
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
