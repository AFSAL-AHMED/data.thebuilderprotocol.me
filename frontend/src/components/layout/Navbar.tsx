import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Menu, X, ChevronDown, User, Shield, LogOut } from 'lucide-react'
import { useAuthStore } from '../../lib/auth'

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    navigate('/')
  }

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.username
    ? user.username.charAt(0).toUpperCase()
    : 'U'

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-[#B8860B]'
        : 'text-[#1A1A1A] hover:text-[#B8860B]'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand */}
          <Link
            to="/"
            className="flex flex-col select-none group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-lg font-bold tracking-tight text-[#1A1A1A] flex items-center leading-tight">
              TBP Dataset Commons
              <span className="text-[#B8860B] ml-0.5 text-xl leading-none">·</span>
            </span>
            <span className="text-xs text-[#6B7280] group-hover:text-[#1A1A1A] transition-colors leading-tight">
              An initiative by The Builder Protocol
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/explore" className={navLinkClass}>
              Explore
            </NavLink>
            <NavLink to="/collections" className={navLinkClass}>
              Collections
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Icon (styling only) */}
            <button
              type="button"
              aria-label="Search"
              className="text-[#6B7280] hover:text-[#1A1A1A] p-2 rounded-lg transition-colors focus:outline-none"
            >
              <Search className="w-5 h-5" />
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#B8860B]/30 transition-all focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-[#FDF8EE] border border-[#B8860B]/40 text-[#B8860B] font-semibold flex items-center justify-center text-sm shadow-sm">
                    {userInitial}
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-1.5 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-[#E5E7EB]">
                      <p className="font-semibold text-[#1A1A1A] truncate">
                        {user?.full_name || user?.username}
                      </p>
                      <p className="text-xs text-[#6B7280] truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#1A1A1A] hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#6B7280]" />
                      Profile
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[#1A1A1A] hover:bg-gray-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[#B8860B]" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/submit"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#B8860B] hover:bg-[#FDF8EE] transition-colors"
                    >
                      <span className="font-medium">+ Submit Dataset</span>
                    </Link>

                    <div className="border-t border-[#E5E7EB] my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#1A1A1A] hover:text-[#B8860B] transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/submit"
                  className="px-3.5 py-1.5 text-sm font-medium text-[#B8860B] border border-[#B8860B] rounded-lg hover:bg-[#FDF8EE] transition-colors shadow-sm"
                >
                  Submit Dataset
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              aria-label="Search"
              className="text-[#6B7280] hover:text-[#1A1A1A] p-2"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#1A1A1A] p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 pt-3 pb-6 space-y-3">
          <NavLink
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#1A1A1A] hover:text-[#B8860B]"
          >
            Explore
          </NavLink>
          <NavLink
            to="/collections"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#1A1A1A] hover:text-[#B8860B]"
          >
            Collections
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#1A1A1A] hover:text-[#B8860B]"
          >
            About
          </NavLink>

          <div className="border-t border-[#E5E7EB] pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-[#FDF8EE] border border-[#B8860B]/40 text-[#B8860B] font-semibold flex items-center justify-center text-sm">
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {user?.full_name || user?.username}
                    </p>
                    <p className="text-xs text-[#6B7280]">{user?.email}</p>
                  </div>
                </div>

                <Link
                  to="/submit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 text-sm font-medium text-[#B8860B] border border-[#B8860B] rounded-lg hover:bg-[#FDF8EE]"
                >
                  Submit Dataset
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-[#1A1A1A] hover:text-[#B8860B]"
                >
                  Profile
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-[#B8860B]"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 text-sm font-medium text-[#1A1A1A] border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/submit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 text-sm font-medium text-[#B8860B] border border-[#B8860B] rounded-lg hover:bg-[#FDF8EE]"
                >
                  Submit Dataset
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
