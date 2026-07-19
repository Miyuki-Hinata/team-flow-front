// components/ui/HistoryList.tsx
import styled from 'styled-components'
import type { HistoryEntry } from '../../types/historyEntry'
import { formatDueDate } from '../../utils/task'

// HistoryList が受け取る props。
// 履歴は AnnouncementHistory / TaskHistory と互換な HistoryEntry[] を受ける。
type HistoryListProps = {
    histories: HistoryEntry[]
}

// 全体：見出し + エントリ縦積み。他のセクション（Card 等）と統一感を出す
const Wrapper = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// 見出し「変更履歴」（小見出しサイズ・強調・主要文字色）
const Heading = styled.h2`
    margin: 0;
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// エントリの縦積み
const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// 1エントリ：ドット + 本文（変更内容 + メタ）の横並び
const Entry = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.sm};
`

// ドット：デザインのティール色（brand.teal）で 8px 円
const Dot = styled.span`
    width: ${props => props.theme.spacing.sm};    /* 8px */
    height: ${props => props.theme.spacing.sm};   /* 8px */
    flex: 0 0 ${props => props.theme.spacing.sm};
    margin-top: ${props => props.theme.spacing.xs}; /* 本文行に対して縦位置を調整 */
    border-radius: ${props => props.theme.radius.full};
    background: ${props => props.theme.colors.brand.teal};
`

// エントリの本文（変更内容 + メタ）を縦積み
const EntryBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
    min-width: 0;  /* 長いテキストが親幅を押し広げないよう */
`

// 変更内容の1行「フィールド：旧 → 新」（本文サイズ・主要文字色）
const Change = styled.div`
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.primary};
`

// メタ情報（日時 ・ 変更者）：小さめ・補助文字色で控えめに
const Meta = styled.div`
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
`

// 空表示：デザイン準拠（padding:24px 0; text-align:center; color:muted; fontSize:sm）
const EmptyMessage = styled.p`
    margin: 0;
    padding: ${props => props.theme.spacing.lg} 0;
    text-align: center;
    color: ${props => props.theme.colors.text.muted};
    font-size: ${props => props.theme.fontSize.sm};
`

// null / 空文字は「(なし)」で表示（既存の生描画のフォールバックを踏襲）
const displayValue = (value: string | null): string => value ?? '(なし)'

// HistoryList 本体。
// 単一責任：「変更履歴の一覧描画」だけを担う。データ取得・並び替えは呼び出し側の責任。
export const HistoryList = ({ histories }: HistoryListProps) => {
    return (
        <Wrapper>
            <Heading>変更履歴</Heading>

            {histories.length === 0 ? (
                <EmptyMessage>変更履歴はありません</EmptyMessage>
            ) : (
                <List>
                    {histories.map(h => (
                        <Entry key={h.id}>
                            <Dot aria-hidden="true" />
                            <EntryBody>
                                {/* 「フィールド：旧 → 新」の1行 */}
                                <Change>
                                    {h.fieldName}：{displayValue(h.oldValue)} → {displayValue(h.newValue)}
                                </Change>
                                {/* 「日時 ・ 変更者」の1行 */}
                                <Meta>
                                    {formatDueDate(h.changedAt)} ・ {h.changedBy.lastName} {h.changedBy.firstName}
                                </Meta>
                            </EntryBody>
                        </Entry>
                    ))}
                </List>
            )}
        </Wrapper>
    )
}
