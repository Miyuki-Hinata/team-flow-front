import { useState } from 'react'
import { login }  from '../api/auth'
import { getCurrentUser } from '../api/users'
import { setAccessToken } from '../api/tokenStore'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
    const [loginId, setLoginId] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const { setCurrentUser } = useAuth()
    
    const handleLogin = async () => {
        try {
            setErrorMessage('')

            // ログイン処理
            const result = await login(loginId, password)
            setAccessToken(result.token)

            // ユーザー情報を取得してContextにセット
            const user = await getCurrentUser()
            setCurrentUser(user)
            
            window.location.href = '/dashboard'
        } catch(error) {
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
            {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}

            <button onClick={handleLogin}>ログイン</button>   
        </div>
    )
}

export default LoginPage    