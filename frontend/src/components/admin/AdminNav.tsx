import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileCheck2, ShieldAlert } from 'lucide-react'

export interface AdminNavProps {
  className?: string
}

export const AdminNav: React.FC<AdminNavProps> = ({ className = '' }) => {
  const navItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/admin/submissions',
      label: 'Submissions',
      icon: FileCheck2,
      end: false,
    },
  ]

  return (
    <nav
      className={`bg-white border border-[#E5E7EB] rounded-lg p-3 sm:p-4 space-y-1 ${className}`}
      aria-label="Admin navigation"
    >
      <div className="hidden md:flex items-center gap-2 px-3 py-2 mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280] border-b border-gray-100">
        <ShieldAlert className="w-4 h-4 text-[#B8860B]" />
        <span>Admin Portal</span>
      </div>

      <div className="flex flex-row md:flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'bg-[#FDF8EE] text-[#B8860B] font-medium shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default AdminNav
