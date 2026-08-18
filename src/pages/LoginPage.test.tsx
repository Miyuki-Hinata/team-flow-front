import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from './LoginPage'
import userEvent from '@testing-library/user-event'
import { getCurrentUser } from '../api/users'
import { createMockUser } from '../test/factories/userFactory'
import { login } from '../api/auth'
import { ThemeProvider } from 'styled-components'
import { themeLight } from '../styles/theme'

const selectedThemeColor = themeLight

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
            <ThemeProvider theme={selectedThemeColor}>
                <BrowserRouter>
                    <LoginPage />
                </BrowserRouter>
            </ThemeProvider>
        )
        
        // 「heading（見出し）」の中の「ログイン」だけを取得
        expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument()
    })
    
    it('ログインボタンが表示される', () => {
        render(
            <ThemeProvider theme={selectedThemeColor}>
                <BrowserRouter>
                    <LoginPage />
                </BrowserRouter>
            </ThemeProvider>
        )
        
        // 「button（ボタン）」の中の「ログイン」だけを取得
        expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    })

    it('ログインIDを入力できる', async() => {
        const user = userEvent.setup()

        render(
            <ThemeProvider theme={selectedThemeColor}>
                <BrowserRouter>
                    <LoginPage />
                </BrowserRouter>
            </ThemeProvider>
        )

        // FormField の label 経由で入力欄を取得（placeholder はデザイン変更で例値になったため）
        const idInput = screen.getByLabelText('ログインID')

        // 「admin」 と入力
        await user.type(idInput, 'admin')

        // 入力された値が反映されるているか確認
        expect(idInput).toHaveValue('admin')

    })

    it('ログイン成功時にlogin APIが正しい引数で呼ばれる', async () => {
        const user = userEvent.setup()
        
        // モック化された login が「成功」を返すように設定
        vi.mocked(login).mockResolvedValue({ token: 'fake-token' })
        // 部分オブジェクトの as any キャストではなく、ファクトリで完全な User を渡す
        // （lint の no-explicit-any 対応。型が正しいままテストの意図も読める）
        vi.mocked(getCurrentUser).mockResolvedValue(
            createMockUser({ loginId: 'admin', lastName: '管理者', firstName: 'ユーザー' })
        )
        
        render(
            <ThemeProvider theme={selectedThemeColor}>
                <BrowserRouter>
                    <LoginPage />
                </BrowserRouter>
            </ThemeProvider>
        )
        
        // 入力
        const idInput = screen.getByLabelText('ログインID')
        const passwordInput = screen.getByLabelText('パスワード')
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
            <ThemeProvider theme={selectedThemeColor}>
                <BrowserRouter>
                    <LoginPage />
                </BrowserRouter>
            </ThemeProvider>
        )
        
        // 入力 → クリック
        await user.type(screen.getByLabelText('ログインID'), 'wrong')
        await user.type(screen.getByLabelText('パスワード'), 'wrong')
        await user.click(screen.getByRole('button', { name: 'ログイン' }))
        
        // エラーメッセージが表示されることを確認
        expect(await screen.findByText('ログインIDまたはパスワードが正しくありません')).toBeInTheDocument()
    })
})