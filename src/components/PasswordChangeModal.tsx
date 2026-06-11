import { useState } from 'react'
import { changePassword } from '../api/users'

type Props = {
    onClose: () => void
}

const PasswordChangeModal = ({ onClose }: Props) => {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async () => {
        setErrorMessage('')

        if (newPassword.length < 8) {
            setErrorMessage('新しいパスワードは8文字以上で入力してください')
            return
        }

        if (newPassword !== confirmNewPassword) {
            setErrorMessage('新しいパスワードが一致しません')
            return
        }

        try {
            await changePassword(currentPassword, newPassword)
            alert('パスワードを変更しました')
            onClose()
        } catch (error) {
            setErrorMessage((error as Error).message)
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: '8px', minWidth: '320px' }}>
                <h2>パスワード変更</h2>

                <div>
                    <label>
                        現在のパスワード
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        新しいパスワード
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        新しいパスワード（確認）
                        <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                    </label>
                </div>

                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                <button onClick={handleSubmit}>変更</button>
                <button onClick={onClose}>閉じる</button>
            </div>
        </div>
    )
}

export default PasswordChangeModal
