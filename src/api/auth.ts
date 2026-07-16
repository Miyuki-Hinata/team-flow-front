import { API_BASE_URL } from './config'

export const login = async (loginId: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // レスポンスのSet-Cookie（リフレッシュトークン）を保存させるために必要
        body: JSON.stringify({ loginId, password }),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
    }

    return response.json()
}

// サーバー側でリフレッシュトークンを失効させ、HttpOnly Cookieを削除する
// （これを呼ばないとCookieが残り、リロード時にサイレントリフレッシュで再ログインされてしまう）
export const logout = async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Cookie（リフレッシュトークン）を送信するために必要
    })
}

// 同時に複数箇所からrefresh()が呼ばれても、リクエストを1つにまとめるための共有Promise
// （バックエンドはリフレッシュトークンを使うたびにローテーションするため、
//   同時に2回送ると片方が「すでに失効したトークン」を使うことになり失敗してしまう）
let refreshPromise: Promise<{ token: string }> | null = null

// HttpOnly Cookieのリフレッシュトークンを使って、新しいアクセストークンを取得する
export const refresh = async (): Promise<{ token: string }> => {
    if (refreshPromise) {
        return refreshPromise
    }

    refreshPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include', // Cookie（リフレッシュトークン）を送信するために必要
            })

            if (!response.ok) {
                throw new Error('トークンの更新に失敗しました')
            }

            return response.json()
        } finally {
            refreshPromise = null
        }
    })()

    return refreshPromise
}