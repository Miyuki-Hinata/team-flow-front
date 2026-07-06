// components/ui/UserMenu.tsx
import { useState, useEffect, useRef } from 'react'
import { Modal } from './Modal'

export const UserMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isMenuOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isMenuOpen])

    return (
        <div ref={menuRef} style={{ position: 'relative' }}>
            <div onClick={() => setIsMenuOpen(!isMenuOpen)}>中島 看護師 ▼</div>

            {isMenuOpen && (
                <div style={{ position: 'absolute' }}>
                    <div onClick={() => { setIsModalOpen(true); setIsMenuOpen(false) }}>パスワード変更</div>
                    <div onClick={() => {/* ログアウト処理 */}}>ログアウト</div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h3>パスワード変更</h3>
                {/* フォーム部分は次回、既存のバリデーションパターンを流用して実装 */}
            </Modal>
        </div>
    )
}