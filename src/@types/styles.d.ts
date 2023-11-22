// Arquivo de definição de tipos
// Extensão d.ts porque dentro desse arquivo só vai ter código de definição de tipos do TS

import 'styled-components';
import { defaultTheme } from '../styles/themes/default';

type ThemeType = typeof defaultTheme;

// Criando uma tipagem para o módulo styled components do npm
// Ao importar o styled components em algum arquivo, a definição de tipos do TS será a definida aqui
// Como o objetivo é sobrescrever algo, e não criar uma tipagem nova, importou o styled components e declarou dele
// Caso contrário, estaria criando do zero a definição de tipos do pacote styled components
declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}