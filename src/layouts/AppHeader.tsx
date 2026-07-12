// layouts/AppHeader.tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { setAccessToken } from '../api/tokenStore'
import { logout } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import PasswordChangeModal from '../components/PasswordChangeModal'
import { findCurrentLabel } from './navItems'

// ヘッダー本体：h:64・#001F5B・sticky・左右32px padding、左右のブロックを justify-between で配置
const Header = styled.header`
    background: ${props => props.theme.colors.brand.navy};
    color: ${props => props.theme.colors.text.onBrand};
    height: 64px;
    flex: 0 0 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${props => props.theme.spacing.xl};
    position: sticky;
    top: 0;
    z-index: 5;
`

// パンくず：「病棟管理 / <現在画面>」
const Crumb = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.border.strong}; /* #C5CAD4：暗背景上の淡いグレー */
`

const CrumbSep = styled.span`
    color: ${props => props.theme.colors.text.secondary};
`

const CrumbCurrent = styled.span`
    color: ${props => props.theme.colors.text.onBrand};
`

// 右側：日付＋ユーザーメニューの横並び
const Right = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.lg};
`

const Today = styled.span`
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.border.strong};
`

// ユーザーメニューのトグル（アバター＋名前＋キャレット）を包む器
const UserMenuWrapper = styled.div`
    position: relative;
`

// トグル自体：素の <button> のリセット＋ theme。$open のときは薄い背景で押下感を出す
const UserToggle = styled.button<{ $open: boolean }>`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    background: ${props => props.$open ? 'rgba(255,255,255,0.08)' : 'transparent'};
    border: none;
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.radius.md};
    color: inherit;
    cursor: pointer;
    font-family: inherit;
`

// アバター：ティール塗り・角丸・姓の1文字を白で表示
const Avatar = styled.div`
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    border-radius: ${props => props.theme.radius.md};
    background: ${props => props.theme.colors.brand.teal};
    color: ${props => props.theme.colors.text.onBrand};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: ${props => props.theme.fontWeight.bold};
`

const UserName = styled.span`
    font-size: ${props => props.theme.fontSize.sm};
`

// キャレット：open で 180 度回転
const Caret = styled.span<{ $open: boolean }>`
    display: inline-flex;
    transform: rotate(${props => props.$open ? 180 : 0}deg);
    transition: transform 0.15s ease;
`

// ドロップダウン：白カード・薄い枠線・角丸・強めの影（README §Design Tokens 準拠の影）
const Dropdown = styled.div`
    position: absolute;
    right: 0;
    top: calc(100% + ${props => props.theme.spacing.xs});
    width: 200px;
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    box-shadow: 0 8px 24px rgba(0, 7, 45, 0.16);
    padding: ${props => props.theme.spacing.sm};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
    z-index: 30;
`

// メニュー項目：素の <button> をリセット＋ theme。左寄せテキストで hover 時に背景を敷く
const MenuItem = styled.button`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    background: transparent;
    border: none;
    border-radius: ${props => props.theme.radius.md};
    font-size: ${props => props.theme.fontSize.md};
    font-family: inherit;
    color: ${props => props.theme.colors.text.primary};
    cursor: pointer;
    text-align: left;

    &:hover {
        background: ${props => props.theme.colors.surface.sunken};
    }
`

// ログアウトは赤（危険な操作）。テキスト色＋hover 背景を danger トーンに
const LogoutMenuItem = styled(MenuItem)`
    color: ${props => props.theme.colors.semantic.danger.main};

    &:hover {
        background: ${props => props.theme.colors.semantic.danger.bg};
    }
`

// 今日の日付を「M/D (曜)」形式にする。データ取得ではなく端末時刻を使う
const formatToday = (): string => {
    const now = new Date()
    const dow = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()]
    return `${now.getMonth() + 1}/${now.getDate()} (${dow})`
}

export const AppHeader = () => {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { currentUser, setCurrentUser } = useAuth()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

    const wrapperRef = useRef<HTMLDivElement>(null)

    // ドロップダウン外クリックで閉じる（旧 Navigation では未実装だった挙動を追加）
    useEffect(() => {
        if (!isMenuOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isMenuOpen])

    // 旧 Navigation の handleLogout を移植（try/catch/finally 構造はそのまま）
    const handleLogout = async () => {
        try {
            // サーバーへログアウトを通知し、DBのリフレッシュトークン失効とCookie削除を行う
            await logout()
        } catch (e) {
            // 通信失敗などでサーバー側処理ができなくても、この端末はログアウト状態にしたいのでログだけ残す
            console.error('ログアウト通知に失敗しました', e)
        } finally {
            // 成功・失敗にかかわらず、最低限この端末の画面はログアウト状態にする
            setAccessToken(null)
            setCurrentUser(null)
            navigate('/login')
        }
    }

    // パンくずの現在画面名（NAV_ITEMS から日本語ラベルを引く）
    const currentLabel = findCurrentLabel(pathname)

    // アバターの1文字：姓の先頭。currentUser 未取得時は '?'
    const avatarChar = currentUser?.lastName?.charAt(0) ?? '?'

    return (
        <>
            <Header>
                {/* 左：パンくず */}
                <Crumb>
                    <span>病棟管理</span>
                    {currentLabel && (
                        <>
                            <CrumbSep>/</CrumbSep>
                            <CrumbCurrent>{currentLabel}</CrumbCurrent>
                        </>
                    )}
                </Crumb>

                {/* 右：日付＋ユーザーメニュー */}
                <Right>
                    <Today>{formatToday()}</Today>

                    <UserMenuWrapper ref={wrapperRef}>
                        <UserToggle $open={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <Avatar>{avatarChar}</Avatar>
                            <UserName>
                                {currentUser?.lastName} {currentUser?.firstName}
                            </UserName>
                            <Caret $open={isMenuOpen}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M7 10l5 5 5-5"
                                          stroke="currentColor" strokeWidth="1.6"
                                          strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Caret>
                        </UserToggle>

                        {isMenuOpen && (
                            <Dropdown>
                                <MenuItem
                                    onClick={() => {
                                        setIsPasswordModalOpen(true)
                                        setIsMenuOpen(false)
                                    }}
                                >
                                    パスワード変更
                                </MenuItem>
                                {/* ダークモード切替はスコープ外（progress.md 参照） */}
                                <LogoutMenuItem onClick={handleLogout}>
                                    ログアウト
                                </LogoutMenuItem>
                            </Dropdown>
                        )}
                    </UserMenuWrapper>
                </Right>
            </Header>

            {/* パスワード変更モーダルは Header の外側に置く（ヘッダーの stacking context に閉じ込めない） */}
            <PasswordChangeModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </>
    )
}
