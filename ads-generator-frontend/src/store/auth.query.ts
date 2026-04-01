import axiosInstance from '../../lib/axios'
import {
  RegisterPayload,
  LoginPayload,
  VerifyOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  AuthResponse,
} from '../types/user.types'
import { ApiResponse } from '../types/api.types'

// Register
export const registerApi = async (payload: RegisterPayload) => {
  const res = await axiosInstance.post<ApiResponse<AuthResponse>>(
    '/auth/register',
    payload,
  )
  return res.data.data
}

// Login
export const loginApi = async (payload: LoginPayload) => {
  const res = await axiosInstance.post<ApiResponse<AuthResponse>>(
    '/auth/login',
    payload,
  )
  return res.data.data
}

// Send OTP
export const sendOtpApi = async (payload: { email?: string; phone?: string }) => {
  const res = await axiosInstance.post<ApiResponse<{ message: string }>>(
    '/auth/send-otp',
    payload,
  )
  return res.data.data
}

// Verify OTP
export const verifyOtpApi = async (payload: VerifyOtpPayload) => {
  const res = await axiosInstance.post<ApiResponse<AuthResponse>>(
    '/auth/verify-otp',
    payload,
  )
  return res.data.data
}

// Forgot Password
export const forgotPasswordApi = async (payload: ForgotPasswordPayload) => {
  const res = await axiosInstance.post<ApiResponse<{ message: string }>>(
    '/auth/forgot-password',
    payload,
  )
  return res.data.data
}

// Reset Password
export const resetPasswordApi = async (payload: ResetPasswordPayload) => {
  const res = await axiosInstance.post<ApiResponse<{ message: string }>>(
    '/auth/reset-password',
    payload,
  )
  return res.data.data
}

// Change Password
export const changePasswordApi = async (payload: ChangePasswordPayload) => {
  const res = await axiosInstance.post<ApiResponse<{ message: string }>>(
    '/auth/change-password',
    payload,
  )
  return res.data.data
}

// Get current user
export const getMeApi = async () => {
  const res = await axiosInstance.get<ApiResponse<AuthResponse['user']>>(
    '/users/me',
  )
  return res.data.data
}

// Update current user
export const updateMeApi = async (payload: { name?: string; email?: string; phone?: string }) => {
  const res = await axiosInstance.patch<ApiResponse<AuthResponse['user']>>(
    '/users/me',
    payload,
  )
  return res.data.data
}

// Delete current user
export const deleteMeApi = async () => {
  const res = await axiosInstance.delete<ApiResponse<{ message: string }>>(
    '/users/me',
  )
  return res.data.data
}