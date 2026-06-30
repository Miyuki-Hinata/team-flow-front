// src/components/ui/Card.tsx
import styled from 'styled-components'
import type { ReactNode } from 'react'

// Cardが受け取るprops。childrenは「箱の中に入れる中身」
type CardProps = {
  children: ReactNode  // ReactNode = JSX全般を受け取れる型
}

// 箱の見た目を作る（白背景・角丸・枠線・余白）
const CardContainer = styled.div`
  background: ${props => props.theme.colors.surface.raised};      /* 白背景 */
  border: 0.5px solid ${props => props.theme.colors.border.default}; /* 薄い枠線 */
  border-radius: ${props => props.theme.radius.lg};               /* 角丸12px */
  padding: ${props => props.theme.spacing.md};                    /* 内側の余白16px */
`

// Card本体：箱の中に、渡された中身(children)を入れる
export const Card = ({ children }: CardProps) => {
  return <CardContainer>{children}</CardContainer>
}