import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from './LoginPage'
import userEvent from '@testing-library/user-event'
import { getCurrentUser } from '../api/users'
import { login } from '../api/auth'


// login と getCurrentUser をモック化
vi.mock('../api/auth', () => ({
    login: vi.fn(),
}))

vi.mock('../api/users', () => ({
    getCurrentUser: vi.fn(),
}))

vi.mock('../api/tokenStore', () => ({
    setAccessToken: vi.fn(),
}))

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        setCurrentUser: vi.fn(),
        currentUser: null,
        isLoading: false,
    })
}))

describe('LoginPage', () => {
    it('ログイン画面のタイトルが表示される', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        
        // 「heading（見出し）」の中の「ログイン」だけを取得
        expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument()
    })
    
    it('ログインボタンが表示される', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        
        // 「button（ボタン）」の中の「ログイン」だけを取得
        expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    })

    it('ログインIDを入力できる', async() => {
        const user = userEvent.setup()

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )

        // 「ログインID」というプレイスホルダーの入力欄を取得
        const idInput = screen.getByPlaceholderText('ログインID')

        // 「admin」 と入力
        await user.type(idInput, 'admin')

        // 入力された値が反映されるているか確認
        expect(idInput).toHaveValue('admin')

    })

    it('ログイン成功時にlogin APIが正しい引数で呼ばれる', async () => {
        const user = userEvent.setup()
        
        // モック化された login が「成功」を返すように設定
        vi.mocked(login).mockResolvedValue({ token: 'fake-token' })
        vi.mocked(getCurrentUser).mockResolvedValue({
            id: 1,
            loginId: 'admin',
            lastName: '管理者',
            firstName: 'ユーザー',
        } as any)
        
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        
        // 入力
        const idInput = screen.getByPlaceholderText('ログインID')
        const passwordInput = screen.getByPlaceholderText('パスワード')
        await user.type(idInput, 'admin')
        await user.type(passwordInput, 'pass123')
        
        // ボタンクリック
        const button = screen.getByRole('button', { name: 'ログイン' })
        await user.click(button)
        
        // login が正しい引数で呼ばれたか確認
        expect(login).toHaveBeenCalledWith('admin', 'pass123')
    })

    it('ログイン失敗時にエラーメッセージが表示される', async () => {
        const user = userEvent.setup()
        
        // login が「失敗」を返すように設定
        vi.mocked(login).mockRejectedValue(new Error('ログインIDまたはパスワードが正しくありません'))
        
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        
        // 入力 → クリック
        await user.type(screen.getByPlaceholderText('ログインID'), 'wrong')
        await user.type(screen.getByPlaceholderText('パスワード'), 'wrong')
        await user.click(screen.getByRole('button', { name: 'ログイン' }))
        
        // エラーメッセージが表示されることを確認
        expect(await screen.findByText('ログインIDまたはパスワードが正しくありません')).toBeInTheDocument()
    })
})