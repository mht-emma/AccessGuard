import React from 'react'
import { Outlet } from 'react-router-dom'
import Menu from './Menu'
import './Layout.css'

const Layout = () => {
  return (
    <div className="layout">
      <Menu />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

