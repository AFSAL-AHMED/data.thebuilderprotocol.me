import React, { createContext, useContext, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const LayoutContext = createContext<boolean>(false)

export interface LayoutProps {
  children?: ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isNested = useContext(LayoutContext)

  if (isNested) {
    return <>{children ?? <Outlet />}</>
  }

  return (
    <LayoutContext.Provider value={true}>
      <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1A1A1A]">
        <Navbar />
        <main className="flex-1 w-full">
          {children ?? <Outlet />}
        </main>
        <Footer />
      </div>
    </LayoutContext.Provider>
  )
}

export default Layout
