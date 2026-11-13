import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <span className="text-8xl sm:text-9xl font-extrabold text-[#E5E7EB] tracking-tight select-none">
          404
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-2 mb-3">
          Page not found
        </h1>
        <p className="text-sm sm:text-base text-[#6B7280] max-w-md mb-8">
          The dataset, collection, or resource you are looking for does not exist, has been removed, or has moved to another location.
        </p>
        <Link to="/">
          <Button variant="gold" size="md">
            Back to Home
          </Button>
        </Link>
      </div>
    </Layout>
  )
}

export default NotFoundPage
