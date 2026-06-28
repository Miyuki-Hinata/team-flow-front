import styled from "styled-components";

export const Button = styled.button`
    background: ${props => props.theme.colors.brand.teal};
    color: ${props => props.theme.colors.text.onBrand};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    border: none;
    border-radius: ${props => props.theme.radius.md};
    font-size: ${props => props.theme.fontSize.md};
    cursor: pointer;
`