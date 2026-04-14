export interface User {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN'
  phone: string | null
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  access_token: string
}

export interface RegisterPayload {
  email: string
  password: string
  name?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email?: string
  phone?: string
  otp: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}