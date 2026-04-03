/*import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { VerifyOtpDto } from './dto/verify-otp.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { OtpService } from './otp.service'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  // Validate user for local strategy
  async validateUser(email: string, password: string) {
    const user = await this.prisma.db.user.findUnique({ where: { email } })
    if (!user || !user.password) return null
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return null
    const { password: _, ...result } = user
    return result
  }

  // Register with email/password
  async register(dto: RegisterDto) {
    const existing = await this.prisma.db.user.findUnique({
      where: { email: dto.email },
    })
    if (existing) throw new ConflictException('Email already in use')

    const hashed = await bcrypt.hash(dto.password, 10)
    const otp = this.otpService.generateOtp()
    const otpExpiry = this.otpService.generateExpiry()

    const user = await this.prisma.db.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        otpCode: otp,
        otpExpiry,
      },
    })

    // Send OTP via email
   // await this.otpService.sendEmailOtp(user.email, otp)

    const { password, ...result } = user
    return {
      user: result,
      message: 'Registration successful! Please verify your email with the OTP sent.',
    }
  }

  // Login with email/password
  async login(user: any) {
    return {
      user,
      ...this.generateToken(user.id, user.email),
    }
  }

  // Google OAuth login/register
  async googleLogin(googleUser: any) {
    let user = await this.prisma.db.user.findUnique({
      where: { email: googleUser.email },
    })

    if (!user) {
      user = await this.prisma.db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          password: '',
          isVerified: true, // Google users are auto verified
        },
      })
    }

    const { password, ...result } = user
    return { user: result, ...this.generateToken(user.id, user.email) }
  }

  // Send OTP (email or phone)
  async sendOtp(email?: string, phone?: string) {
    const otp = this.otpService.generateOtp()
    const otpExpiry = this.otpService.generateExpiry()

    if (email) {
      const user = await this.prisma.db.user.findUnique({ where: { email } })
      if (!user) throw new NotFoundException('User not found')

      await this.prisma.db.user.update({
        where: { email },
        data: { otpCode: otp, otpExpiry },
      })
      await this.otpService.sendEmailOtp(email, otp)
    }

    if (phone) {
      const user = await this.prisma.db.user.findFirst({ where: { phone } })
      if (!user) throw new NotFoundException('User not found')

      await this.prisma.db.user.update({
        where: { id: user.id },
        data: { otpCode: otp, otpExpiry },
      })
      await this.otpService.sendSmsOtp(phone, otp)
    }

    return { message: 'OTP sent successfully' }
  }

  // Verify OTP
  async verifyOtp(dto: VerifyOtpDto) {
    let user: any = null

    if (dto.email) {
      user = await this.prisma.db.user.findUnique({
        where: { email: dto.email },
      })
    } else if (dto.phone) {
      user = await this.prisma.db.user.findFirst({
        where: { phone: dto.phone },
      })
    }

    if (!user) throw new NotFoundException('User not found')
    if (!user.otpCode) throw new BadRequestException('No OTP requested')
    if (user.otpCode !== dto.otp) throw new BadRequestException('Invalid OTP')
    if (new Date() > user.otpExpiry) throw new BadRequestException('OTP expired')

    // Mark as verified and clear OTP
    await this.prisma.db.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiry: null,
      },
    })

    return {
      message: 'OTP verified successfully',
      ...this.generateToken(user.id, user.email),
    }
  }

  // Forgot password
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.db.user.findUnique({
      where: { email: dto.email },
    })
    if (!user) throw new NotFoundException('User not found')

    const token = randomUUID()
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await this.prisma.db.user.update({
      where: { email: dto.email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    })

    await this.otpService.sendResetEmail(dto.email, token)

    return { message: 'Password reset link sent to your email' }
  }

  // Reset password
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.db.user.findFirst({
      where: { resetToken: dto.token },
    })

    if (!user) throw new BadRequestException('Invalid reset token')
    if (new Date() > user.resetTokenExpiry!) {
      throw new BadRequestException('Reset token expired')
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10)

    await this.prisma.db.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return { message: 'Password reset successfully' }
  }

  // Change password (logged in user)
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.db.user.findUnique({
      where: { id: userId },
    })
    if (!user) throw new NotFoundException('User not found')

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password)
    if (!isMatch) throw new UnauthorizedException('Old password is incorrect')

    const hashed = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.db.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return { message: 'Password changed successfully' }
  }

  // Helper to generate JWT
  private generateToken(userId: string, email: string) {
    return {
      access_token: this.jwtService.sign({
        sub: userId,
        email,
      }),
    }
  }
}*/



import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  // Validate user for local strategy
  /*async validateUser(email: string, password: string) {
    const user = await this.prisma.db.user.findUnique({ where: { email } });
    if (!user || !user.password) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    const { password: _, ...result } = user;
    return result;
  }*/
  async validateUser(email: string, password: string) {
  const user = await this.prisma.db.user.findUnique({ where: { email } });
  
  if (!user || !user.password) return null;

  // FIX: If isVerified is false, reject the login immediately
  if (user.isVerified === false) {
    throw new UnauthorizedException('Account not verified. Please verify your OTP first.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  const { password: _, ...result } = user;
  return result;
}

  

  // Register with email/password
  async register(dto: RegisterDto) {
    try {
      const existing = await this.prisma.db.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) throw new ConflictException('Email already in use');

      const hashed = await bcrypt.hash(dto.password, 10);
      const otp = this.otpService.generateOtp();
      const otpExpiry = this.otpService.generateExpiry();

      const user = await this.prisma.db.user.create({
        data: {
          email: dto.email,
          password: hashed,
          name: dto.name,
          otpCode: otp,
          otpExpiry,
          isVerified: false,
        },
      });

      // Keep this commented out until you verify registration works in Prisma Studio
      // await this.otpService.sendEmailOtp(user.email, otp)
      console.log(`Attempting to send first OTP to ${user.email}...`);
       try {
      await this.otpService.sendEmailOtp(user.email, otp);
    } catch (mailError) {
      console.error('Mail delivery failed, but user created:', mailError);
    }

      const { password, ...result } = user;
      return {
        user: result,
        message: 'Registration successful!',
      };
    } catch (error) {
      console.error('--- REGISTRATION ERROR ---');
      console.error(error);
      throw new InternalServerErrorException(error.message || 'Database Error');
    }
  }

  // Login with email/password
  async login(user: any) {
    return {
      user,
      ...this.generateToken(user.id, user.email),
    };
  }

  // Google OAuth login/register
  async googleLogin(googleUser: any) {
    let user = await this.prisma.db.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await this.prisma.db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          password: '',
          isVerified: true, 
        },
      });
    }

    const { password, ...result } = user;
    return { user: result, ...this.generateToken(user.id, user.email) };
  }

  // Send OTP (email or phone)
  async sendOtp(email?: string, phone?: string) {
    const otp = this.otpService.generateOtp();
    const otpExpiry = this.otpService.generateExpiry();

    if (email) {
      const user = await this.prisma.db.user.findUnique({ where: { email } });
      if (!user) throw new NotFoundException('User not found');

      await this.prisma.db.user.update({
        where: { email },
        data: { otpCode: otp, otpExpiry },
      });
      await this.otpService.sendEmailOtp(email, otp);
    }

    if (phone) {
      const user = await this.prisma.db.user.findFirst({ where: { phone } });
      if (!user) throw new NotFoundException('User not found');

      await this.prisma.db.user.update({
        where: { id: user.id },
        data: { otpCode: otp, otpExpiry },
      });
      await this.otpService.sendSmsOtp(phone, otp);
    }

    return { message: 'OTP sent successfully' };
  }

  // Verify OTP
  async verifyOtp(dto: VerifyOtpDto) {
    let user: any = null;

    if (dto.email) {
      user = await this.prisma.db.user.findUnique({
        where: { email: dto.email },
      });
    } else if (dto.phone) {
      user = await this.prisma.db.user.findFirst({
        where: { phone: dto.phone },
      });
    }

    if (!user) throw new NotFoundException('User not found');
    if (!user.otpCode) throw new BadRequestException('No OTP requested');
    if (user.otpCode !== dto.otp) throw new BadRequestException('Invalid OTP');
    if (new Date() > user.otpExpiry) throw new BadRequestException('OTP expired');

    const updatedUser = await this.prisma.db.user.update({
    where: { id: user.id },
    data: {
      isVerified: true, // NOW they can log in
      otpCode: null,
      otpExpiry: null,
    },
  });

    return {
      message: 'OTP verified successfully',
      ...this.generateToken(updatedUser.id, updatedUser.email),
    };
  }

  // Forgot password
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.db.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('User not found');

    const token = randomUUID();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); 

    await this.prisma.db.user.update({
      where: { email: dto.email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    await this.otpService.sendResetEmail(dto.email, token);
    return { message: 'Password reset link sent to your email' };
  }

  // Reset password
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.db.user.findFirst({
      where: { resetToken: dto.token },
    });

    if (!user) throw new BadRequestException('Invalid reset token');
    if (new Date() > user.resetTokenExpiry!) {
      throw new BadRequestException('Reset token expired');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.db.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  // Change password
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.db.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Old password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.db.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Password changed successfully' };
  }

  // Helper to generate JWT
  private generateToken(userId: string, email: string) {
    return {
      access_token: this.jwtService.sign({
        sub: userId,
        email,
      }),
    };
  }
}
