import { Outlet } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function RootLayout() {
  return (
    <>
      <ThemeToggle />
      <Outlet />
    </>
  )
}
