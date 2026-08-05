import { useState } from 'react'
import styled from 'styled-components'
import { Card } from "./Card"
import { Button } from './Button'
import { formatDueDate } from '../../utils/task'
import type { TaskSummaryResponse } from "../../types/taskSummary"

// 呼び出し側から受け取るprops
type AISummaryCardProps = {
    taskSummary: TaskSummaryResponse | null
    isGenerating: boolean
    handleGenerateSummary: () => void
}

// タイトル：h3 のブラウザデフォルト（黒文字）だとダークモードで見えなくなるため、
// theme トークンから文字色を引く（ライト/ダーク両対応）
const Title = styled.h3`
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    margin: 0;
    cursor: pointer;
`

// メタ行（最終更新・生成者）：補助的な情報なので secondary の薄い文字色
const Meta = styled.p`
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.fontSize.sm};
`

// サマリ本文の枠：ダークモードで見えない #ccc / 白背景 を止め、theme トークンに揃える
const SummaryBody = styled.div`
    white-space: pre-wrap;
    background: ${props => props.theme.colors.surface.sunken};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};
    padding: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.text.primary};
`

// 「サマリ未生成」表記：Meta と同じ補助文字色で控えめに
const EmptyText = styled.p`
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.fontSize.sm};
`

// タイトル行：左にタイトル、右に「再生成」ボタン。他画面のフォーム Actions と同じく
// ボタンは右寄せに揃える（README §患者詳細「見出し + 右に再生成ボタン」に準拠）
const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${props => props.theme.spacing.md};
    margin-bottom: ${props => props.theme.spacing.md};
`

export const AISummaryCard = ({ taskSummary, isGenerating, handleGenerateSummary }: AISummaryCardProps) => {

    const [isOpen, setIsopen] = useState(false)

    return (
        <Card>
            {/* タイトル + 再生成ボタンを 1 行に横並び。他画面のフォーム Actions と揃えてボタンは右寄せ */}
            <HeaderRow>
                {/* タイトルクリックで開閉トグル */}
                <Title onClick={() => setIsopen(!isOpen)}>
                    📊 AIタスクサマリ
                </Title>
                {/* ボタンは開閉状態に関わらず常に表示。README §患者詳細のデザイン指定に沿い secondary（アウトライン）で他ページと統一 */}
                <Button variant="secondary" onClick={handleGenerateSummary} disabled={isGenerating}>
                    {isGenerating ? '生成中...' : taskSummary ? '再生成' : 'サマリを生成'}
                </Button>
            </HeaderRow>

            {/* サマリ本文はトグルで表示 */}
            {isOpen &&(
                taskSummary? (
                    <>
                        {/* generatedAt は ISO 文字列で届くため、履歴と同じ短い日時形式（M/D HH:mm）に整形する */}
                        <Meta>
                            最終更新：{formatDueDate(taskSummary.generatedAt)} / 生成者：{taskSummary.generatedByName}
                        </Meta>
                        <SummaryBody>
                            {taskSummary.summary}
                        </SummaryBody>
                    </>
                ) : (
                    <EmptyText>サマリ未生成</EmptyText>
                )
            )}
        </Card>
    )
}


export default AISummaryCard
