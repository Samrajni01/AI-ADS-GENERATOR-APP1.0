import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /users/me
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.getMe(user.id)
  }

  // PATCH /users/me
  @Patch('me')
  updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.id, dto)
  }

  // DELETE /users/me
  @Delete('me')
  deleteMe(@CurrentUser() user: any) {
    return this.usersService.deleteMe(user.id)
  }

  // GET /users (admin)
  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  // GET /users/:id (admin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }
}