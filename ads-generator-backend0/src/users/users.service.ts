import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateUserDto } from './dto/update-user'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly userSelection = { //helper function
    id: true,
    email: true,
    name: true,
    role: true,
    phone: true,       // Added this
    isVerified: true,  // Added this
    createdAt: true,
    updatedAt: true,
  };

  // Get current logged in user
  async getMe(userId: string) {
    const user = await this.prisma.db.user.findUnique({
      where: { id: userId },
      select: this.userSelection, // Use the helper
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  // Update current user profile
  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.db.user.update({
      where: { id: userId },
      data: { ...dto },
      select: this.userSelection, // Using the helper here
    })
    return user
  }

  // Delete current user account
  async deleteMe(userId: string) {
    await this.prisma.db.user.delete({
      where: { id: userId },
    })
    return { message: 'Account deleted successfully' }
  }

  // Get all users (admin only)
  async findAll() {
    return this.prisma.db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  // Get single user by id (admin only)
  async findOne(id: string) {
    const user = await this.prisma.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }
}