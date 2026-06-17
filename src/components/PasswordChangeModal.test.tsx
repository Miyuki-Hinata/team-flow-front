import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PasswordChangeModal from './PasswordChangeModal'
import { changePassword } from '../api/users'

// changePassword API をモック化
vi.mock('../api/users', () => ({
    changePassword: vi.fn(),
}))

// alert もモック化（テスト中にダイアログが出ないように）
window.alert = vi.fn()

describe('PasswordChangeModal', () => {
    
    it('モーダルのタイトルが表示される', () => {
        render(<PasswordChangeModal onClose={vi.fn()} />)
        
        expect(screen.getByRole('heading', { name: 'パスワード変更' })).toBeInTheDocument()
    })

    it('新パスワードが8文字未満の場合エラーが表示される', async () => {
        const user = userEvent.setup()
        
        render(<PasswordChangeModal onClose={vi.fn()} />)
        
        // 現在のパスワード入力
        await user.type(screen.getByLabelText('現在のパスワード'), 'oldpass')
        
        // 新パスワード（7文字 - 8文字未満）
        await user.type(screen.getByLabelText('新しいパスワード'), 'short12')
        
        // 確認パスワード
        await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'short12')
        
        // 変更ボタンをクリック
        await user.click(screen.getByRole('button', { name: '変更' }))
        
        // エラーメッセージ表示を確認
        expect(screen.getByText('新しいパスワードは8文字以上で入力してください')).toBeInTheDocument()
        
        // changePassword API は呼ばれていないことを確認
        expect(changePassword).not.toHaveBeenCalled()
    })

    it('新パスワードと確認が一致しない', async () => {
        const user = userEvent.setup()
        
        render(<PasswordChangeModal onClose={vi.fn()} />)
        
        // 現在のパスワード入力
        await user.type(screen.getByLabelText('現在のパスワード'), 'oldpass')
        
        // 新パスワード
        await user.type(screen.getByLabelText('新しいパスワード'), 'password123')

        // 新しいパスワード確認
        await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'different123')
        
        // 変更ボタンをクリック
        await user.click(screen.getByRole('button', { name: '変更' }))
        
        // エラーメッセージ表示を確認
        expect(screen.getByText('新しいパスワードが一致しません')).toBeInTheDocument()
        
        // changePassword API は呼ばれていないことを確認
        expect(changePassword).not.toHaveBeenCalled()
    })

    it('正常時にchangePassword APIが正しい引数で呼ばれる', async () => {
        const user = userEvent.setup()
        const mockOnClose = vi.fn()
        
        // changePassword が成功を返すように設定
        vi.mocked(changePassword).mockResolvedValue(undefined)
        
        render(<PasswordChangeModal onClose={mockOnClose} />)
        
        // 正しい入力
        await user.type(screen.getByLabelText('現在のパスワード'), 'oldpass123')
        await user.type(screen.getByLabelText('新しいパスワード'), 'newpass456')
        await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'newpass456')
        
        // 変更ボタンクリック
        await user.click(screen.getByRole('button', { name: '変更' }))
        
        // changePassword が正しい引数で呼ばれたか確認
        expect(changePassword).toHaveBeenCalledWith('oldpass123', 'newpass456')
        
        // 成功後に onClose が呼ばれることを確認
        await vi.waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled()
        })
    })
})