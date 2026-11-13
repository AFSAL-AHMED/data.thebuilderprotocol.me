import React from 'react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#F9FAFB] border-t border-[#E5E7EB] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-block">
              <span className="text-lg font-bold tracking-tight text-[#1A1A1A] flex items-center">
                TBP Dataset Commons
                <span className="text-[#B8860B] ml-0.5 text-xl font-black">·</span>
              </span>
            </Link>
            <p className="text-sm text-[#6B7280] max-w-sm">
              An open repository of community-contributed datasets
            </p>
            <p className="text-xs text-[#6B7280]">
              An initiative by{' '}
              <a
                href="https://thebuilderprotocol.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1A1A1A] hover:text-[#B8860B] font-medium transition-colors"
              >
                The Builder Protocol
              </a>
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  Submit
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280]">
          <p>© {currentYear} TBP Dataset Commons. Open access research infrastructure.</p>
          <p className="mt-2 sm:mt-0">Built for open science and machine learning research.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
