import { useState } from 'react'
import { Card } from "./Card"
import type { TaskSummaryResponse } from "../../types/taskSummary"

// 呼び出し側から受け取るprops
type AISummaryCardProps = {
    taskSummary: TaskSummaryResponse | null
    isGenerating: boolean
    handleGenerateSummary: () => void
}

export const AISummaryCard = ({ taskSummary, isGenerating, handleGenerateSummary }: AISummaryCardProps) => {

    const [isOpen, setIsopen] = useState(false)

    return (
        <Card>
            {/* クリックで開閉トグル */}
            <h3 onClick={() => setIsopen(isOpen)}>
                📊 AIタスクサマリ
            </h3>

            {/* サマリ本文はトグルで表示 */}
            {isOpen &&(
                taskSummary? (
                    <>
                        <p>
                            最終更新：{taskSummary.generatedAt} / 生成者：{taskSummary.generatedByName}
                        </p>
                        <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '12px' }}>
                            {taskSummary.summary}
                        </div>
                    </>
                ) : (
                    <p>サマリ未生成</p>
                )
            )}

            {/* ボタンは開閉状態に関わらず常に表示 */}
            <button onClick={handleGenerateSummary} disabled={isGenerating}>
                {isGenerating ? '生成中...' : taskSummary ? '再生成' : 'サマリを生成'}
            </button>
        </Card>
    )
}


export default AISummaryCard