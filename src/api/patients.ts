import type { PatientRequest } from "../types/patientRequest"
import { getAccessToken } from './tokenStore'
import { fetchWithAuth , API_BASE_URL } from './apiClient'

export const patients = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/patients`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    return response.json()
}

export const getPatientById = async (id: number) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/patients/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
    }

    return response.json()
}


export const createPatient = async (patient: PatientRequest) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/patients`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(patient)
    })

    // エラー時はユーザー向けの分かりやすいメッセージで throw する。
    // ステータス数字（400/500 等）はエンドユーザーには意味不明なため表示しない。
    if (!response.ok) {
        // 401 は apiClient の 401 処理でログイン画面へ自動遷移するので、
        // 一瞬見える可能性のある表示に「セッション切れ」の意味を持たせる。
        if (response.status === 401) {
            throw new Error('セッションが切れました。再度ログインしてください。')
        }

        // その他のエラー：サーバー返却メッセージがあれば優先、なければ既定メッセージ。
        // ボディが空 or 非 JSON でもクラッシュしないよう try/catch でフォールバック。
        let message = '患者の作成に失敗しました'
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