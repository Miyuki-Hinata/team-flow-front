import styled from 'styled-components'

// ------------------------------------------------------------
// Tabs（セグメント風のタブ切替）
// ------------------------------------------------------------
// 沈んだ面（surface.sunken）を器とし、アクティブなタブだけ白背景で浮き上がらせるセグメント UI。
// AnnouncementsPage の未読/既読タブ、PatientDetailPage のタスクタブ（すべて/カテゴリ別/マイタスク）で共有する。
//
// お手本 PatientCard / AISummaryCard の流儀に倣い、
//   ・propsは `type ○○Props = {...}` で型定義し分割代入で受け取る
//   ・表示のみに責務を絞り、状態管理は呼び出し側に委譲する
// なぜジェネリクス（<T extends string>）にしたか：
//   呼び出し側が具体的な union 型（'unread' | 'read' や 'all' | 'category' | 'my' 等）を保ったまま
//   onChange のハンドラで扱える。any にしないための工夫。
// ------------------------------------------------------------

// タブ 1 件の定義。count（件数）はオプションで、ある場合は「ラベル (N)」の形で末尾に表示
export type TabItem<T extends string> = {
    value: T
    label: string
    count?: number
}

type Props<T extends string> = {
    // 表示するタブの並び。呼び出し側の順序をそのまま反映する
    items: TabItem<T>[]
    // 現在アクティブなタブの value
    activeValue: T
    // タブ切替時のコールバック。value は items[].value 由来なので型が絞れる
    onChange: (value: T) => void
}

// セグメント全体の器：沈んだ面を背景に、内側にタブを並べる。display:inline-flex で中身幅に収める
const TabList = styled.div`
    display: inline-flex;
    gap: ${props => props.theme.spacing.xs};
    background: ${props => props.theme.colors.surface.sunken};
    padding: ${props => props.theme.spacing.xs};
    border-radius: ${props => props.theme.radius.md};
`

// 各タブ：アクティブは白背景＋主要文字＋強調、非アクティブは透明背景＋補助文字＋通常。
// $active は styled-components の transient prop（$ 始まり）で DOM に転送されない
const Tab = styled.button<{ $active: boolean }>`
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

// ジェネリクスは <T extends string> にして union 型を保つ
export const Tabs = <T extends string>({ items, activeValue, onChange }: Props<T>) => {
    return (
        <TabList>
            {items.map(item => (
                <Tab
                    key={item.value}
                    $active={item.value === activeValue}
                    onClick={() => onChange(item.value)}
                >
                    {/* count がある場合のみ「ラベル (N)」形式で件数を末尾に添える */}
                    {item.label}
                    {item.count !== undefined && ` (${item.count})`}
                </Tab>
            ))}
        </TabList>
    )
}
