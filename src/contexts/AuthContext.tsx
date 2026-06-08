import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getCurrentUser } from '../api/users'
import { refresh } from '../api/auth'
import { setAccessToken } from '../api/tokenStore'
import type { UserResponse } from '../types/userResponse'

// Contextの型定義
type AuthContextType = {
    currentUser: UserResponse | null;
    setCurrentUser: (user: UserResponse | null) => void;
    isLoading: boolean;
};

// Contextを作成（初期値はnull扱い）
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Providerコンポーネント：アプリ全体をラップする
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // アプリ起動時（リロード時）に、HttpOnly Cookieのリフレッシュトークンでアクセストークンをサイレント取得する
    // ※ アクセストークンはメモリにしか置かないため、リロードのたびにこの処理が必要になる
    useEffect(() => {
        refresh()
            .then(data => {
                setAccessToken(data.token);
                return getCurrentUser();
            })
            .then(data => setCurrentUser(data))
            .catch(() => {
                // リフレッシュトークンが無い・期限切れの場合は未ログイン状態にする
                setAccessToken(null);
                setCurrentUser(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// カスタムフック：useAuth() で使いやすくする
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};