import type { Announcement } from "../types/announcement"
import styled from 'styled-components'

type Props = {
    announcements: Announcement[]
    activeTab: 'unread' | 'read'
    onTabChange: (tab: 'unread' | 'read') => void
}

// セグメント全体の器：沈んだ面を背景に、内側にタブを並べる。width:fit-content 相当で中身幅に収める。
const TabList = styled.div`
    display: inline-flex;
    gap: ${props => props.theme.spacing.xs};
    background: ${props => props.theme.colors.surface.sunken};
    padding: ${props => props.theme.spacing.xs};
    border-radius: ${props => props.theme.radius.md};
`

// 各タブ：アクティブは白背景＋主要文字＋強調、非アクティブは透明背景＋補助文字＋通常。
// $active は styled-components の transient prop（$ 始まり）で、DOM の <button> には転送されない。
const Tab = styled.button<{ $active: boolean }>`
    /* 余白：上下は狭め(sm)、左右は標準(md)。デザインの 18px はトークンに無いため最も近い md に寄せる */
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    border: none;
    /* 角丸：器(md=8px)より一段小さい sm(4px) にして、内側タブが器に収まる入れ子感を出す */
    border-radius: ${props => props.theme.radius.sm};
    font-size: ${props => props.theme.fontSize.sm};
    font-family: inherit;
    cursor: pointer;

    background: ${props => props.$active ? props.theme.colors.surface.raised : 'transparent'};
    color: ${props => props.$active ? props.theme.colors.text.primary : props.theme.colors.text.secondary};
    font-weight: ${props => props.$active ? props.theme.fontWeight.bold : props.theme.fontWeight.normal};
`

const AnnouncementTabs = ({ announcements, activeTab, onTabChange }: Props) => {

    const unreadCount = announcements.filter(a => !a.isRead).length

    const readCount = announcements.filter(a => a.isRead).length

    return (
        <TabList>
            {/* 未読タブ：アクティブ判定を $active に渡して見た目を切り替える。挙動（onTabChange）は従来どおり */}
            <Tab $active={activeTab === 'unread'} onClick={() => onTabChange('unread')}>
                未読 ({unreadCount})
            </Tab>
            {/* 既読タブ */}
            <Tab $active={activeTab === 'read'} onClick={() => onTabChange('read')}>
                既読 ({readCount})
            </Tab>
        </TabList>
    )
}

export default AnnouncementTabs
