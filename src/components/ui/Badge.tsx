// src/components/ui/Badge.tsx
import styled, { css } from 'styled-components'

// Badgeが受け取るpropsの型。toneは5種類のどれか
type BadgeProps = {
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

// toneごとのスタイル対応表（ButtonのvariantStylesと同じ発想）
// セマンティックカラーは main(文字色) と bg(背景色) のペアで使う
const toneStyles = {
  // 緑：安定・完了
  success: css`
    background: ${props => props.theme.colors.semantic.success.bg};
    color: ${props => props.theme.colors.semantic.success.main};
  `,
  // 黄：経過観察・注意
  warning: css`
    background: ${props => props.theme.colors.semantic.warning.bg};
    color: ${props => props.theme.colors.semantic.warning.main};
  `,
  // 赤：緊急
  danger: css`
    background: ${props => props.theme.colors.semantic.danger.bg};
    color: ${props => props.theme.colors.semantic.danger.main};
  `,
  // 青：情報・結果待ち
  info: css`
    background: ${props => props.theme.colors.semantic.info.bg};
    color: ${props => props.theme.colors.semantic.info.main};
  `,
  // グレー：分類（カテゴリ・部署など意味を持たないタグ）
  neutral: css`
    background: ${props => props.theme.colors.surface.sunken};
    color: ${props => props.theme.colors.text.secondary};
  `,
}

// Badge本体
export const Badge = styled.span<BadgeProps>`
  /* 全tone共通のスタイル */
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: ${props => props.theme.radius.sm};  /* 小さめ角丸4px */
  font-size: ${props => props.theme.fontSize.xs};    /* 小さい文字12px */
  font-weight: ${props => props.theme.fontWeight.bold};
  white-space: nowrap;  /* 改行させない（タグなので1行で収める） */

  /* toneごとのスタイルを対応表から引く。指定なければ neutral */
  ${props => toneStyles[props.tone || 'neutral']}
`