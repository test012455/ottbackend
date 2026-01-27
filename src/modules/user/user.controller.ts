import { Controller, Get, Put, Body, Req, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  // GET /user/profile
  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.getProfile(req.user.id);
  }

  // PUT /user/profile/update
  @Put('profile/update')
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  // GET /user/all (Admin + Super Admin)
  @Get('all')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // GET /user/:id
  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getUserById(@Param('id') id: string, @Req() req) {
    return this.userService.getUserById(parseInt(id), req.user);
  }

  // PUT /user/block/:id
  @Put('block/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  blockUser(@Param('id') id: string, @Req() req) {
    return this.userService.blockUser(parseInt(id), req.user);
  }

  // PUT /user/unblock/:id
  @Put('unblock/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  unblockUser(@Param('id') id: string, @Req() req) {
    return this.userService.unblockUser(parseInt(id), req.user);
  }

  // ⭐ NEW: ONLY USER CAN TOGGLE PARENTAL CONTROL
  @Put('parental-control-toggle')
  @Roles(Role.USER)
  toggleParentalControl(@Req() req) {
    return this.userService.toggleParentalControl(req.user.id);
  }
}