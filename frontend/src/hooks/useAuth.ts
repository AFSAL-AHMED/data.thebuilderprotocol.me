import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../lib/auth'
import { authApi, usersApi } from '../lib/api'

export function useAuth() {
  const store = useAuthStore()
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: async (creds: { username: string; password: string }) => {
      const tokens = await authApi.login(creds)
      // Save token immediately so usersApi.me() request interceptor sends Authorization header
      localStorage.setItem('tbp_token', tokens.access_token)
      try {
        const user = await usersApi.me()
        return { tokens, user }
      } catch (err) {
        localStorage.removeItem('tbp_token')
        throw err
      }
    },
    onSuccess: ({ tokens, user }) => {
      store.login(tokens.access_token, user)
      navigate('/')
      toast.success('Welcome back!')
    },
    onError: () => {
      toast.error('Invalid credentials')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: { email: string; username: string; password: string; full_name: string }) =>
      authApi.register(data),
    onSuccess: (data) => {
      store.login(data.access_token, data.user)
      navigate('/')
      toast.success('Account created!')
    },
    onError: () => {
      toast.error('Registration failed')
    },
  })

  return {
    ...store,
    loginMutation,
    registerMutation,
  }
}

export default useAuth
