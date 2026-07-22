import type { Patient } from '../types/patient'
import { getAccessToken } from './tokenStore'
import { fetchWithAuth, API_BASE_URL } from './apiClient'

// 受け持ち患者 API のフロント側クライアント。
// バックエンドの /api/me/assigned-patients（GET/PUT）に対応する。
// URL に userId を出さず「自分（me）」を対象にする方針はサーバ側と揃えている。
//
// 既存 api/*.ts と同じく fetchWithAuth（401 で自動リフレッシュ&リトライ）＋ Bearer ヘッダで組む。
// ただし戻り値は CLAUDE.md §2 に従い Promise<Patient[]> と明示し、呼び出し側の型安全を担保する。

// 受け持ち患者の一覧を取得する（GET）。
export const getAssignedPatients = async (): Promise<Patient[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/me/assigned-patients`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`,
        },
    })

    return response.json()
}

// 受け持ち患者を「集合置換」で更新する（PUT）。
// patientIds は差分ではなく最終状態そのもの。空配列を渡すと全解除（クリア）になる。
// サーバは更新後の最新一覧を返すため、その Patient[] をそのまま返し、呼び出し側は再フェッチ不要。
export const replaceAssignedPatients = async (patientIds: number[]): Promise<Patient[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/me/assigned-patients`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ patientIds }),
    })

    // 更新系はエラーをユーザー向けメッセージで throw する（createPatient と同じ方針）。
    if (!response.ok) {
        // 401 は apiClient 側でログイン画面へ自動遷移するが、一瞬見える可能性に備えて意味を持たせる。
        if (response.status === 401) {
            throw new Error('セッションが切れました。再度ログインしてください。')
        }

        // その他：サーバ返却メッセージがあれば優先、空ボディや非 JSON でも落ちないよう try/catch で握る。
        let message = '受け持ち患者の更新に失敗しました'
        try {
            const errorData = await response.json()
            if (errorData?.error) message = errorData.error
        } catch {
            // 空ボディ等で JSON パースに失敗した場合は既定メッセージを使う
        }
        throw new Error(message)
    }

    return response.json()
}
