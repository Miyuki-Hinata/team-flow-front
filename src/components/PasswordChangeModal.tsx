import { useState } from 'react'
import styled from 'styled-components'
import { changePassword } from '../api/users'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { FormField } from './ui/FormField'
import { Button } from './ui/Button'

type Props = {
    isOpen: boolean
    onClose: () => void
}

// モーダル中身：見出し・フィールド群・エラー・ボタン列を縦積みに
const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// 見出し：小見出しサイズ・強調・主要文字色
const Title = styled.h2`
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// フォーム全体のエラー：赤（＝danger）・補足サイズ。フィールド個別ではなくフォーム全体のバリデーション結果
const ErrorText = styled.p`
    color: ${props => props.theme.colors.semantic.danger.main};
    font-size: ${props => props.theme.fontSize.xs};
`

// ボタン列：横並び・右寄せ（ConfirmDialog と同じレイアウト方針）
const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${props => props.theme.spacing.sm};
`

const PasswordChangeModal = ({ isOpen, onClose }: Props) => {
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
        <Modal isOpen={isOpen} onClose={onClose}>
            <Content>
                <Title>パスワード変更</Title>

                {/* 現在のパスワード：label と input を htmlFor/id で紐付け */}
                <FormField label="現在のパスワード" htmlFor="pw-current">
                    <Input
                        id="pw-current"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </FormField>

                {/* 新しいパスワード */}
                <FormField label="新しいパスワード" htmlFor="pw-new">
                    <Input
                        id="pw-new"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </FormField>

                {/* 新しいパスワード（確認） */}
                <FormField label="新しいパスワード（確認）" htmlFor="pw-confirm">
                    <Input
                        id="pw-confirm"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                </FormField>

                {/* エラーはフォーム全体で1箇所に集約表示（短絡評価） */}
                {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

                <Actions>
                    {/* 閉じる：中立操作なので secondary */}
                    <Button variant="secondary" onClick={onClose}>閉じる</Button>
                    {/* 変更：主要操作なので primary */}
                    <Button variant="primary" onClick={handleSubmit}>変更</Button>
                </Actions>
            </Content>
        </Modal>
    )
}

export default PasswordChangeModal
