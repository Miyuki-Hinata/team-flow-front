import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import styled, { keyframes } from 'styled-components'

// ------------------------------------------------------------
// トースト通知：alert() の代替。画面右上に一時的な通知を出す。
// ------------------------------------------------------------
// なぜ Context にするか：
//   ・呼び出し側は useToast() 一発でどのページからでも通知を出せる
//   ・トーストの実体（表示コンテナ）はアプリに1つだけあれば十分
//   ・Modal と違って「呼び出しが命令的（showToast('...')）」の方が使いやすい
//
// 表現分離：
//   ・状態管理と API 提供は ToastProvider（このファイル）
//   ・見た目は下部の ToastCard / ToastContainer に閉じる
// ------------------------------------------------------------

// 通知の種類。tone を絞ることで色の意味を守る（成功=緑 / エラー=赤 / 情報=青）
export type ToastType = 'success' | 'error' | 'info'

type Toast = {
    id: number
    type: ToastType
    message: string
}

type ToastApi = {
    // 呼び出し側は toast.success('保存しました') のように使う
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
}

const ToastContext = createContext<ToastApi | undefined>(undefined)

// 表示時間（ミリ秒）。短すぎると読めず、長すぎると邪魔になるので 3.2秒 が目安
const AUTO_DISMISS_MS = 3200

type Props = {
    children: ReactNode
}

export const ToastProvider = ({ children }: Props) => {
    // トーストは同時に複数出せるように配列で管理する
    const [toasts, setToasts] = useState<Toast[]>([])

    // 個別のトーストを削除。setTimeout からも「×」ボタンからも呼ばれる
    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    // 追加は共通処理。type だけ差し替える形にまとめる
    const showToast = useCallback((type: ToastType, message: string) => {
        // ID は時系列で単調増加する必要があるので Date.now を採用（React key の衝突防止）
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, type, message }])
        // 一定時間で自動的に消える。ユーザーが操作しなくても画面がクリーンに戻る
        setTimeout(() => removeToast(id), AUTO_DISMISS_MS)
    }, [removeToast])

    // API を useMemo で固定（依存が変わらないなら Provider の value も同一参照を保つ）
    const api = useMemo<ToastApi>(() => ({
        success: (message) => showToast('success', message),
        error: (message) => showToast('error', message),
        info: (message) => showToast('info', message),
    }), [showToast])

    return (
        <ToastContext.Provider value={api}>
            {children}
            {/* トーストの表示コンテナ。position: fixed で常に画面右上に固定される */}
            <ToastContainer>
                {toasts.map(toast => (
                    <ToastCard key={toast.id} $type={toast.type} onClick={() => removeToast(toast.id)}>
                        <ToastMessage>{toast.message}</ToastMessage>
                    </ToastCard>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    )
}

// カスタムフック：呼び出し側は const toast = useToast() → toast.success('...')
// Provider 外で呼ばれた場合は明確にエラーで落とす（初期化ミスに気付ける）
export const useToast = (): ToastApi => {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast は ToastProvider の内側で呼び出してください')
    return ctx
}

// ------------------------------------------------------------
// 見た目
// ------------------------------------------------------------

// スライドインのアニメーション（右から入ってくる）
const slideIn = keyframes`
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
`

// 表示コンテナ：画面右上に固定。複数トーストは縦に積む
const ToastContainer = styled.div`
    position: fixed;
    top: ${props => props.theme.spacing.lg};
    right: ${props => props.theme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    z-index: 9999;                     /* Modal より前面に出す */
    pointer-events: none;              /* コンテナ自体はクリックを透過（背後の操作を邪魔しない） */
`

// 個別トースト：セマンティックカラーで tone を伝える。クリックで即消せる
const ToastCard = styled.div<{ $type: ToastType }>`
    min-width: 280px;
    max-width: 420px;
    padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
    border-radius: ${props => props.theme.radius.md};
    background: ${props => props.theme.colors.surface.raised};
    /* 左端に太めのストリップ色で tone を示す（緑=成功 / 赤=エラー / 青=情報） */
    border-left: 4px solid ${props => props.theme.colors.semantic[
        props.$type === 'success' ? 'success'
        : props.$type === 'error' ? 'danger'
        : 'info'
    ].main};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: ${slideIn} 0.2s ease-out;
    cursor: pointer;
    pointer-events: auto;              /* 個別トーストはクリック受付（消せるように） */
`

const ToastMessage = styled.div`
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.primary};
    line-height: ${props => props.theme.lineHeight.normal};
`
