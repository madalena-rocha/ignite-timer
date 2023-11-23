import { Outlet } from 'react-router-dom'
import { Header } from '../../components/Header'

import { LayoutContainer } from './styles'

export function DefaultLayout() {
  return (
    <LayoutContainer>
      <Header />
      <Outlet />{' '}
      {/* Espaço para ser inserido o conteúdo específico da página */}
    </LayoutContainer>
  )
}
