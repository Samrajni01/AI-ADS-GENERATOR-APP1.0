import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class OtpService {
  private twilioClient: any = null
  private transporter: nodemailer.Transporter

  constructor() {
    // Only initialize Twilio if real credentials exist
    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN

    if (sid && sid.startsWith('AC') && token) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const twilio = require('twilio')
      this.twilioClient = twilio(sid, token)
    }

    // Gmail SMTP client
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    })
  }

  // Generate 6 digit OTP
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // OTP expiry — 10 minutes from now
  generateExpiry(): Date {
    return new Date(Date.now() + 10 * 60 * 1000)
  }

  // Send OTP via SMS
  async sendSmsOtp(phone: string, otp: string) {
    if (!this.twilioClient) {
      console.log(`[DEV] SMS OTP for ${phone}: ${otp}`)
      return
    }
    await this.twilioClient.messages.create({
      body: `Your Ads Generator OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })
  }

  // Send OTP via Email
  async sendEmailOtp(email: string, otp: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-gmail@gmail.com') {
      console.log(`[DEV] Email OTP for ${email}: ${otp}`)
      return
    }
    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your OTP - Ads Generator',
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>Valid for 10 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    })
  }

  // Send password reset link via Email
  async sendResetEmail(email: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-gmail@gmail.com') {
      console.log(`[DEV] Reset link for ${email}: ${resetLink}`)
      return
    }
    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Reset Your Password - Ads Generator',
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>Valid for 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    })
  }
}