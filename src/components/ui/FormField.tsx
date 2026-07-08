// components/ui/FormField.tsx
import type { ReactNode } from 'react'
import styled from 'styled-components'

// FormField が受け取る props の型。
// 中身（Input / Select）は children で受け取り、FormField 自身は種類を問わない
// （Modal と同じ children 合成パターン）。
type FormFieldProps = {
    label: string       // 見出しの文字列
    htmlFor: string     // label と 中身の input/select を紐付ける id（必須）
    error?: string      // エラーメッセージ（任意。ある時だけ表示）
    children: ReactNode // 中身（Input や Select）
}

// 全体の器：label / 中身 / エラーを縦に積む。要素間はごく狭い間隔(xs)で寄せる。
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
`

// 見出しラベル：補助的な見出し色・やや小さめ・強調の太さ。
const Label = styled.label`
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: ${props => props.theme.fontWeight.bold};
`

// エラーメッセージ：赤（＝エラーの意味の色）・補足サイズで控えめに添える。
const ErrorText = styled.p`
    color: ${props => props.theme.colors.semantic.danger.main};
    font-size: ${props => props.theme.fontSize.xs};
`

// FormField 本体。
// ラベル・エラーの付与と、中身を包むことだけを担う（単一責任）。
// 入力欄そのものの見た目・値管理は持たず、children（Input/Select）に委ねる。
export const FormField = ({ label, htmlFor, error, children }: FormFieldProps) => {
    return (
        <Wrapper>
            {/* htmlFor を付けることで、ラベルクリックで中身の入力欄にフォーカスが移る（アクセシビリティ）。
                呼び出し側が同じ値を <Input id={htmlFor} /> に渡して紐付ける。 */}
            <Label htmlFor={htmlFor}>{label}</Label>

            {/* 中身は呼び出し側が自由に決める（Input / Select など） */}
            {children}

            {/* error がある時だけ表示（短絡評価） */}
            {error && <ErrorText>{error}</ErrorText>}
        </Wrapper>
    )
}
