import styled from 'styled-components'
import type { AgeGroup } from "../../types/patient"

// 色のペアの型
type IconColor = { main: string, bg: string }

// このアイコンが受け取るprops：年齢層と色
type PatientIconProps = {
    ageGroup: AgeGroup
    color: IconColor
}

// 背景の丸：薄い色の円の中に、人型SVGを中央配置する
// props で背景色($bg)を受け取る。$を付けるのはstyled-componentsの作法（後述）
const IconCircle = styled.div<{ $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;              /* 完全な円にする */
  background: ${props => props.$bg}; /* 薄い色の背景 */
  display: flex;                    /* 中身を中央に置くため */
  align-items: center;              /* 縦中央 */
  justify-content: center;          /* 横中央 */
`

export const PatientIcon = ({ ageGroup, color }: PatientIconProps) => {
    // 年齢層ごとに、中身（円と線）を出し分ける
    // stroke の色は、固定ではなく props の color を使う
    const shapes = {
        // 小児：大きめの頭＋丸い体
        child: (
            <>
                <circle cx="12" cy="8.5" r="4" stroke={color.main} strokeWidth="1.7" />
                <path d="M7 20c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={color.main} strokeWidth="1.7" strokeLinecap="round" />
            </>
        ),
        // 成人：頭＋大きな体
        adult: (
            <>
                <circle cx="12" cy="8" r="3.4" stroke={color.main} strokeWidth="1.7" />
                <path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" stroke={color.main} strokeWidth="1.7" strokeLinecap="round" />
            </>
        ),
        // 高齢：頭＋前かがみの体
        elderly: (
            <>
                <circle cx="11" cy="7.5" r="3.2" stroke={color.main} strokeWidth="1.7" />
                <path d="M5.5 20c0-3.4 2.5-6.2 5.5-6.2" stroke={color.main} strokeWidth="1.7" strokeLinecap="round" />
                <path d="M16 11.5V20" stroke={color.main} strokeWidth="1.7" strokeLinecap="round" />
            </>
        ),
    }

    return (
        <IconCircle $bg={color.bg}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                {shapes[ageGroup]}
            </svg>
        </IconCircle>
    )
}