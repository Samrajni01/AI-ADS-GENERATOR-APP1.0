import { IsString, IsEmail, IsOptional } from 'class-validator'

export class VerifyOtpDto {
  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  otp: string
}