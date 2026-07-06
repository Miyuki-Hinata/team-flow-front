// components/ui/Modal.tsx
import { useEffect, useRef } from 'react'
import { Card } from './Card'

type ModalProps = {
    isOpen: boolean
    onClose: () => void       // 閉じる処理は呼び出し側が持つ（状態はここでは持たない）
    children: React.ReactNode // Modalの中身は呼び出し側が自由に決める
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return

        // Escキーで閉じる
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null  // 閉じているときは何も描画しない

    return (
        // 背景（オーバーレイ）自体のクリックで閉じる
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={onClose}
        >
            {/* Modal本体クリックでは閉じない → stopPropagationで親への伝播を止める */}
            <div ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <Card>{children}</Card>
            </div>
        </div>
    )
}