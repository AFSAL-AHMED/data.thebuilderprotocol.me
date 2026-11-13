import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../lib/utils'

export const RegisterPage: React.FC = () => {
  const { registerMutation } = useAuth()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setClientError(null)

    if (password.length < 8) {
      setClientError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setClientError('Passwords do not match')
      return
    }

    registerMutation.mutate({
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
    })
  }

  const errorMessage = clientError || (registerMutation.error ? getApiErrorMessage(registerMutation.error) : null)

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Create an Account
            </h1>
            <p className="text-sm text-[#6B7280] mt-1.5">
              Join the TBP Dataset Commons community to share research data
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Elena Rostova"
            />

            <Input
              label="Username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. erostova"
              hint="Lowercase letters, numbers, and hyphens"
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. elena@research.org"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                className="w-full"
                loading={registerMutation.isPending}
                disabled={!fullName || !username || !email || !password || !confirmPassword}
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-xs text-[#6B7280]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[#B8860B] hover:text-[#996F09] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default RegisterPage
