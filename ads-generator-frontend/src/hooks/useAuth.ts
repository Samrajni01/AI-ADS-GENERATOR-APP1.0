import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import {
  registerApi,
  loginApi,
  sendOtpApi,
  verifyOtpApi,
  forgotPasswordApi,
  resetPasswordApi,
  changePasswordApi,
  getMeApi,
  updateMeApi,
  deleteMeApi,
} from '../store/auth.query'
import {
  RegisterPayload,
  LoginPayload,
  VerifyOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from '../types/user.types'

// Get current user
export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMeApi,
    enabled: !!Cookies.get('access_token'),
  })
}

// Register
export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerApi(payload),
  })
}

// Login
/*export const useLogin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginApi(payload),
    onSuccess: (data) => {
      Cookies.set('access_token', data.access_token, { expires: 7 })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}*/
// Around line 40
export const useLogin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginApi(payload),
    onSuccess: (data) => {
      // Add path: '/' here
      Cookies.set('access_token', data.access_token, { expires: 7, path: '/' }) 
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

// Send OTP
export const useSendOtp = () => {
  return useMutation({
    mutationFn: (payload: { email?: string; phone?: string }) =>
      sendOtpApi(payload),
  })
}

// Verify OTP
/*export const useVerifyOtp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtpApi(payload),
    onSuccess: (data) => {
      Cookies.set('access_token', data.access_token, { expires: 7 })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}*/
// Around line 60 in src/hooks/useAuth.ts
export const useVerifyOtp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtpApi(payload),
    onSuccess: (data) => {
      // 1. ADD { path: '/' } HERE! 
      // This ensures the cookie works on /dashboard, not just /verify-otp
      Cookies.set('access_token', data.access_token, { expires: 7, path: '/' })
      
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

// Forgot Password
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordApi(payload),
  })
}

// Reset Password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPasswordApi(payload),
  })
}

// Change Password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePasswordApi(payload),
  })
}

// Update profile
export const useUpdateMe = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name?: string; email?: string ;phone?: string }) =>
      updateMeApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

// Delete account
export const useDeleteMe = () => {
  return useMutation({
    mutationFn: deleteMeApi,
    onSuccess: () => {
      Cookies.remove('access_token')
      window.location.href = '/login'
    },
  })
}

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient()
  const logout = () => {
    Cookies.remove('access_token')
    queryClient.clear()
    window.location.href = '/login'
  }
  return { logout }
}