import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../api/auth'
import { getCurrentUser } from '../api/users'
import { setAccessToken } from '../api/tokenStore'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
    const [loginId, setLoginId] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const { setCurrentUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogin = async () => {
        try {
            setErrorMessage('')

            // ログイン処理
            const result = await login(loginId, password)
            setAccessToken(result.token)

            // ユーザー情報を取得してContextにセット
            const user = await getCurrentUser()
            setCurrentUser(user)

            // リダイレクト先を決定する（優先順位順）
            // 1. PrivateRouteからstate経由で渡されたパス（未ログインで直接URLを開いた場合）
            // 2. sessionStorageに保存されたパス（セッション切れで強制遷移された場合）
            // 3. デフォルトの /dashboard
            const from =
                (location.state as { from?: string })?.from ||
                sessionStorage.getItem('redirectAfterLogin') ||
                '/dashboard'

            // 使い終わったsessionStorageのエントリは削除しておく
            sessionStorage.removeItem('redirectAfterLogin')

            // replace: true にすることで、ブラウザの「戻る」でログイン画面に戻れないようにする
            navigate(from, { replace: true })
        } catch (error) {
            setErrorMessage((error as Error).message)
        }
    }

    return (
        <div>
            <h1>ログイン</h1>
            <input
                type="text"
                placeholder="ログインID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
            />
            <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <button onClick={handleLogin}>ログイン</button>
        </div>
    )
}

export default LoginPage
