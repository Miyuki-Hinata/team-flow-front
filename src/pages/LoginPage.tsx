import { useState } from 'react'
import { login }  from '../api/auth'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
    const [loginId, setLoginId] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleLogin = async () => {
       const result = await login(loginId, password)
       localStorage.setItem('token', result.token)
       navigate('/dashboard')
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
            <button onClick={handleLogin}>ログイン</button>   
        </div>
    )
}

export default LoginPage    