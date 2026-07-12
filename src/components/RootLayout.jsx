import { Outlet } from 'react-router-dom'
import RoleSwitcher from './RoleSwitcher'

export default function RootLayout() {
  return (
    <>
      <RoleSwitcher />
      <Outlet />
    </>
  )
}
