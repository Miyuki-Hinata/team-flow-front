// layouts/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { NAV_ITEMS } from './navItems'
import { useAnnouncementCount } from '../contexts/AnnouncementCountContext'

type Props = {
    // lg 未満（off-canvas モード）でのみ意味を持つ開閉状態。lg 以上では常に表示される
    isOpen: boolean
    // ナビ項目タップ / オーバーレイクリック時に呼び、off-canvas を閉じる
    onClose: () => void
}

// サイドバー本体：デザインの 248px 幅・#00072D 背景・sticky・100vh・縦フレックス
// トークン：spacing.xl(32px) と spacing.md(16px) はデザインの padding:24px 16px の縦(≒lg=24px)/横(md=16px)に対応
// lg 未満では position:fixed で off-canvas 化し、$open が false のときは transform で画面外へ退避する
const Aside = styled.aside<{ $open: boolean }>`
    width: 248px;
    flex: 0 0 248px;
    background: ${props => props.theme.colors.brand.navyDeep};
    color: ${props => props.theme.colors.border.strong}; /* #C5CAD4：暗背景上の淡いグレー文字 */
    display: flex;
    flex-direction: column;
    padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md};
    gap: ${props => props.theme.spacing.xl};
    position: sticky;
    top: 0;
    height: 100vh;

    @media (max-width: ${props => props.theme.breakpoints.lg}) {
        /* lg 未満：ドロワー化。fixed で本文の外に出し、transform でスライド表示 */
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        height: 100vh;
        z-index: 40;                 /* Overlay(30) より上に */
        transform: translateX(${props => props.$open ? '0' : '-100%'});
        transition: transform 0.25s ease;
    }
`

// ロゴ行：ティール四角のアイコン枠 ＋ "TeamFlow" 白文字
const Brand = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    padding: 0 ${props => props.theme.spacing.sm};
`

const LogoMark = styled.div`
    width: 32px;
    height: 32px;
    border-radius: ${props => props.theme.radius.md};
    background: ${props => props.theme.colors.brand.teal};
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 32px;
`

const BrandName = styled.span`
    color: ${props => props.theme.colors.text.onBrand};
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    letter-spacing: 0.02em;
`

// ナビ列：縦積み・項目間はごく狭い間隔
const NavList = styled.nav`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
`

// 「メニュー」見出し
const NavHeading = styled.div`
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
    padding: 0 ${props => props.theme.spacing.md} ${props => props.theme.spacing.sm};
`

// ナビ項目：<a>既定の下線・色を打ち消し、theme で色/余白/角丸を定義。
// アクティブ時は brand.teal 塗り＋白文字＋強調、非アクティブは淡いグレー。$active は transient prop（DOM に漏らさない）。
const NavLink = styled(Link)<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.radius.md};
    text-decoration: none;
    font-size: ${props => props.theme.fontSize.md};

    background: ${props => props.$active ? props.theme.colors.brand.teal : 'transparent'};
    color: ${props => props.$active ? props.theme.colors.text.onBrand : props.theme.colors.text.muted};
    font-weight: ${props => props.$active ? props.theme.fontWeight.bold : props.theme.fontWeight.normal};
`

// 未読件数バッジ：ナビ項目の右端に赤 pill で表示。margin-left:auto で右端に押し出す
// アクティブ時は白背景+赤文字、非アクティブは赤背景+白文字で常に「未対応の緊急度」を伝える
const UnreadBadge = styled.span<{ $active: boolean }>`
    margin-left: auto;
    min-width: 20px;
    padding: 0 ${props => props.theme.spacing.xs};
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: ${props => props.theme.radius.full};
    font-size: ${props => props.theme.fontSize.xs};
    font-weight: ${props => props.theme.fontWeight.bold};
    background: ${props => props.$active
        ? props.theme.colors.text.onBrand
        : props.theme.colors.semantic.danger.main};
    color: ${props => props.$active
        ? props.theme.colors.semantic.danger.main
        : props.theme.colors.text.onBrand};
`

// 施設情報：サイドバー下端に押し出し。区切り線はデザインの #1A2348 を暗背景専用色として直書き
// （テーマトークンに「サイドバー内の区切り線」が無いため、README §Design Tokens の当該定義値を採用）
const Facility = styled.div`
    margin-top: auto;
    padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.md};
    border-top: 1px solid #1A2348;
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
    line-height: ${props => props.theme.lineHeight.normal};
`

// ロゴ用の稲妻風アイコン（デザインのインライン SVG を移植）。currentColor で親色を継承させる
const LogoIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 13h4l2 5 4-12 2 7h4"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

// パス別のアイコン。ここも stroke="currentColor" で親（アクティブ=白 / 非アクティブ=muted）を継承する
const iconByPath: Record<string, React.ReactNode> = {
    '/dashboard': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 11l8-6 8 6M6 10v9h12v-9"
                  stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    '/patients': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
            <path d="M5.5 19c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    ),
    '/announcements': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 6h14v9H9l-4 3z"
                  stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
    ),
    '/tasks': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 6h14M5 12h14M5 18h9"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    ),
    '/tasks/my-tasks': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M7 12l3 3 7-7"
                  stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" />
            <rect x="4" y="4" width="16" height="16" rx="3"
                  stroke="currentColor" strokeWidth="1.6" />
        </svg>
    ),
}

export const Sidebar = ({ isOpen, onClose }: Props) => {
    // 現在のパスを取得し、ナビ項目のアクティブ判定に使う（前方一致）。
    // ただし「/tasks/my-tasks」と「/tasks」の両方に一致してしまわないよう、より長いパスを優先。
    const { pathname } = useLocation()

    // お知らせの未読件数は AnnouncementCountContext から取得。
    // 既読化した側（AnnouncementsPage 等）が refresh を呼ぶことでバッジが即座に更新される
    const { unreadCount } = useAnnouncementCount()

    const isActive = (itemPath: string): boolean => {
        // より具体的な（長い）パスが他にも一致するなら、そちらを優先させる
        const specificMatch = NAV_ITEMS.find(item =>
            item.path !== itemPath &&
            item.path.startsWith(itemPath + '/') &&
            pathname.startsWith(item.path)
        )
        if (specificMatch) return false
        return pathname.startsWith(itemPath)
    }

    return (
        <Aside $open={isOpen}>
            <Brand>
                <LogoMark>
                    <LogoIcon />
                </LogoMark>
                <BrandName>TeamFlow</BrandName>
            </Brand>

            <NavList>
                <NavHeading>メニュー</NavHeading>
                {NAV_ITEMS.map(item => {
                    const active = isActive(item.path)
                    // お知らせ項目にのみ未読バッジを付ける。0 件のときは出さない（存在感で「未対応がない」を伝える）
                    const showBadge = item.path === '/announcements' && unreadCount > 0
                    return (
                        // ナビ項目タップで off-canvas を閉じる（lg 以上では onClose は無害な no-op）
                        <NavLink
                            key={item.path}
                            to={item.path}
                            $active={active}
                            onClick={onClose}
                        >
                            {iconByPath[item.path]}
                            {item.label}
                            {showBadge && <UnreadBadge $active={active}>{unreadCount}</UnreadBadge>}
                        </NavLink>
                    )
                })}
            </NavList>

            {/* 施設情報：現状は固定文言。将来は currentUser の所属情報から出す想定 */}
            <Facility>
                さくら総合病院<br />
                3F 内科病棟
            </Facility>
        </Aside>
    )
}
