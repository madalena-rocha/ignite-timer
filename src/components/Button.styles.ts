import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

interface ButtonContainerProps {
  variant: ButtonVariant;
}

const buttonVariants = {
  primary: 'purple',
  secondary: 'orange',
  danger: 'red',
  success: 'green'
};

export const ButtonContainer = styled.button<ButtonContainerProps>`
  width: 100px;
  height: 40px;

  // O styled components vai executar o código dentro do {} como uma função, e vai enviar para essa função todas as propriedades do ButtonContainer
  ${props => {
    return css`
      background-color: ${buttonVariants[props.variant]};
    `
  }}
`
