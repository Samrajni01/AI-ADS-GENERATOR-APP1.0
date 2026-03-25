import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { VerifyOtpDto } from './dto/verify-otp.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { LocalAuthGuard } from './guards/local.guard'
import { GoogleAuthGuard } from './guards/google.guard'
import { JwtAuthGuard } from './guards/jwt.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/register
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  // POST /auth/login
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: any) {
    return this.authService.login(req.user)
  }

  // GET /auth/google
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {}

  // GET /auth/google/callback
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(@Req() req: any) {
    return this.authService.googleLogin(req.user)
  }

  // POST /auth/send-otp
  @Post('send-otp')
  sendOtp(@Body() body: { email?: string; phone?: string }) {
    return this.authService.sendOtp(body.email, body.phone)
  }

  // POST /auth/verify-otp
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto)
  }

  // POST /auth/forgot-password
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  // POST /auth/reset-password
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  // POST /auth/change-password (protected)
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto)
  }
}