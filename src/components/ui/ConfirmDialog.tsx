// components/ui/ConfirmDialog.tsx
import styled from 'styled-components'
import { Modal } from './Modal'
import { Button } from './Button'

// ConfirmDialog が受け取る props の型。
// 開閉は Modal に、ボタンの見た目は Button に委ねるので、ここは「確認の中身」だけを型で持つ。
type ConfirmDialogProps = {
    isOpen: boolean       // 開いているか（Modal にそのまま渡す）
    onClose: () => void   // 閉じる／キャンセル時の処理（Modal とキャンセルボタン）
    onConfirm: () => void // 実行ボタンを押したときの処理（削除実行など）
    title?: string        // 見出し（任意。未指定時はデフォルト文言）
    message: string       // 確認本文
    confirmLabel?: string // 実行ボタンの文言（任意。デフォルト「削除する」）
}

// 中身全体：見出し・本文・ボタン列を縦に積む。要素間は標準余白(md)で空ける。
const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// 見出し：小見出しサイズ・強調の太さ・主要文字色。
const Title = styled.h2`
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// 本文：本文サイズ・補助的な文字色（見出しより一段控えめ）。
const Message = styled.p`
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.secondary};
`

// ボタン列：横並びで右寄せ。ボタン同士はごく狭い間隔(sm)で寄せる。
const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${props => props.theme.spacing.sm};
`

// ConfirmDialog 本体。
// 「確認を取る」ことだけを担い、開閉ロジックは Modal、ボタンの見た目は Button に委ねる（車輪の再発明をしない）。
export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = '削除の確認',   // 未指定時のデフォルト見出し
    message,
    confirmLabel = '削除する', // 未指定時のデフォルト実行文言
}: ConfirmDialogProps) => {
    return (
        // Escape・オーバーレイクリックで閉じる挙動は Modal が持つので再実装しない
        <Modal isOpen={isOpen} onClose={onClose}>
            <Content>
                <Title>{title}</Title>
                <Message>{message}</Message>

                <Actions>
                    {/* キャンセル：閉じるだけ。中立的な secondary */}
                    <Button variant="secondary" onClick={onClose}>
                        キャンセル
                    </Button>

                    {/* 実行：取り消せない操作なので danger（赤）で警告する */}
                    <Button variant="danger" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </Actions>
            </Content>
        </Modal>
    )
}
