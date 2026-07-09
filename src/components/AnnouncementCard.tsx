import type { Announcement } from "../types/announcement";
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { PriorityBadge } from './ui/PriorityBadge'

type Props = {
    announcement: Announcement
    onRead: (id: number) => void
}

// カード全体を包むリンク。<a> 既定の下線・文字色（紫）を打ち消し、カードの見た目を素直に出す。
const CardLink = styled(Link)`
    display: block;
    text-decoration: none;
    color: inherit;
`

// カード内の横並び：未読ドット と 本文コンテンツを左から並べる（上揃え）
const Row = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.md};
    align-items: flex-start;
`

// 未読ドット：デザイン仕様どおり左端にティールの小さな点で「未読」を示す。
// （旧実装の「既読=グレー背景」はデザイン仕様外だったため、ドット表現へ揃える）
const UnreadDot = styled.span`
    width: ${props => props.theme.spacing.sm};   /* 8px */
    height: ${props => props.theme.spacing.sm};  /* 8px */
    flex: 0 0 ${props => props.theme.spacing.sm};
    margin-top: ${props => props.theme.spacing.xs};
    border-radius: ${props => props.theme.radius.sm};
    background: ${props => props.theme.colors.brand.teal};
`

// 本文側の縦積み（バッジ列・タイトル・優先度）
const Content = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* バッジ類が横幅いっぱいに伸びないよう左寄せに固定する */
    gap: ${props => props.theme.spacing.xs};
    flex: 1 1 auto;
`

// カテゴリ・部署バッジの横並び
const BadgeRow = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};
    align-items: center;
`

// タイトル：小見出しサイズ・強調・主要文字色
const Title = styled.div`
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

const AnnouncementCard = ({ announcement, onRead }: Props) => {
    return (
        // クリックで詳細へ遷移（Link）＋ 既読化（onRead）。挙動は従来どおり維持する
        <CardLink to={`/announcements/${announcement.id}`}>
            <div onClick={() => onRead(announcement.id)}>
                <Card>
                    <Row>
                        {/* 未読のときだけ左にティールドットを出す（既読は何も出さない） */}
                        {!announcement.isRead && <UnreadDot />}

                        <Content>
                            {/* カテゴリ・部署は分類タグなので neutral バッジ（意味の色を持たせない） */}
                            <BadgeRow>
                                <Badge tone="neutral">{announcement.category.categoryName}</Badge>
                                <Badge tone="neutral">{announcement.department?.departmentName ?? '全体'}</Badge>
                            </BadgeRow>

                            <Title>{announcement.title}</Title>

                            {/* 優先度は値→色/ラベルを内包する PriorityBadge に置換 */}
                            <PriorityBadge priority={announcement.priority} />
                        </Content>
                    </Row>
                </Card>
            </div>
        </CardLink>
    )
}
export default AnnouncementCard
