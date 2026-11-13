import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../lib/utils'

export const LoginPage: React.FC = () => {
  const { loginMutation } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    loginMutation.mutate({ username: username.trim(), password })
  }

  const errorMessage = loginMutation.error
    ? getApiErrorMessage(loginMutation.error)
    : null

  return (
    <Layout>
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Sign In
            </h1>
            <p className="text-sm text-[#6B7280] mt-1.5">
              Access your TBP Dataset Commons contributor account
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. researcher@domain.org"
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                className="w-full"
                loading={loginMutation.isPending}
                disabled={!username.trim() || !password}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-xs text-[#6B7280]">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-medium text-[#B8860B] hover:text-[#996F09] transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default LoginPage
