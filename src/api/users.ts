import type { Role } from '../types/role'
import type { User } from '../types/user'
import { getAccessToken } from './tokenStore'
import { fetchWithAuth , API_BASE_URL, okOrThrow } from './apiClient'

// 認証付きの共通ヘッダ（departments/categories/projects と同じ書き方に揃える）
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAccessToken()}`,
})

// ユーザーの作成/更新で送る値。バックエンドの UserRequest に対応する。
// password だけ任意（?）にしているのは「編集時は空欄なら変更しない」仕様のため。
// level は 1=一般 / 2=管理者（サーバー側の User.isAdmin() が level===2 で判定する）。
export type UserInput = {
    loginId: string
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana: string
    email: string
    password?: string
    departmentId: number | null
    role: Role
    level: number
}

export const users = async (role?: Role) => {
    const url = role
        ? `${API_BASE_URL}/api/users?role=${role}`
        : `${API_BASE_URL}/api/users`

    const response = await fetchWithAuth(url, {
        method: 'GET',
        headers: authHeaders()
    })
    return response.json()
}

// 作成（POST）※admin のみ許可される（サーバー側で認可）
export const createUser = async (input: UserInput): Promise<User> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(input),
    })
    await okOrThrow(response, 'ユーザーの作成に失敗しました')
    return response.json()
}

// 更新（PUT）※password が空文字/未指定ならサーバー側で既存パスワードを維持する
export const updateUser = async (id: number, input: UserInput): Promise<User> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(input),
    })
    await okOrThrow(response, 'ユーザーの更新に失敗しました')
    return response.json()
}

// 削除（DELETE・論理削除）。サーバーは文字列を返すだけなので成否確認のみ
export const deleteUser = async (id: number): Promise<void> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })
    await okOrThrow(response, 'ユーザーの削除に失敗しました')
}

export const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/users/me/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
    }

    return response.json()
}

export const getCurrentUser = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: authHeaders()
    });
    
    if (!response.ok) {
        throw new Error('ユーザー情報の取得に失敗しました');
    }
    
    return response.json();
};