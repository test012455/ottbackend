import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // GET /user/profile
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // PUT /user/profile/update
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.firstName || dto.lastName
          ? { name: `${dto.firstName ?? ''} ${dto.lastName ?? ''}`.trim() }
          : {}),
        ...(dto.email ? { email: dto.email } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    return { message: 'Profile updated successfully', user };
  }

  // GET /user/all
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        parentalControl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // GET /user/:id with role restrictions
  async getUserById(id: number, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        parentalControl: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    if (currentUser.role === 'SUPER_ADMIN') return user;

    if (currentUser.role === 'ADMIN' && user.role !== 'USER') {
      throw new ForbiddenException('Admins can only access normal users');
    }

    return user;
  }

  // BLOCK USER
  async blockUser(id: number, currentUser: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    if (currentUser.role === 'ADMIN' && user.role !== 'USER') {
      throw new ForbiddenException('Admins can only block normal users');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: 'BLOCKED' },
    });

    return { message: 'User blocked successfully' };
  }

  // UNBLOCK USER
  async unblockUser(id: number, currentUser: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    if (currentUser.role === 'ADMIN' && user.role !== 'USER') {
      throw new ForbiddenException('Admins can only unblock normal users');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    return { message: 'User unblocked successfully' };
  }

  // ⭐ NEW: Toggle parental control (USER ONLY)
  async toggleParentalControl(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { parentalControl: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        parentalControl: !user.parentalControl,
      },
      select: {
        id: true,
        parentalControl: true,
      },
    });

    return {
      message: `Parental control ${
        updated.parentalControl ? 'enabled' : 'disabled'
      }`,
      user: updated,
    };
  }
}