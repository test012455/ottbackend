import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { addMinutes, addDays } from 'date-fns';
import { MailService } from '../../shared/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  // ---------------------- HASH PASSWORD --------------------------------
  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // ---------------------- REGISTER --------------------------------
  async register(dto: any) {
    const { email, phone, password, name } = dto;

    const user = await this.prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        password: password ? await this.hashPassword(password) : null,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.verificationToken.create({
      data: {
        identifier: email ?? phone,
        otp,
        expiresAt: addMinutes(new Date(), 10),
        userId: user.id,
      },
    });

    return {
      message: 'User registered. Verify OTP sent.',
      identifier: email ?? phone,
    };
  }

  // ---------------------- SEND LOGIN OTP --------------------------------
  async sendLoginOtp(dto: { email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.verificationToken.create({
      data: {
        identifier: dto.email,
        otp,
        expiresAt: addMinutes(new Date(), 5),
        userId: user.id,
      },
    });

    await this.mail.sendOtp(dto.email, otp);

    return { message: 'OTP sent to email' };
  }

  // ---------------------- VERIFY OTP → LOGIN --------------------------------
  async verifyOtp(
    dto: { identifier: string; otp: string },
    reqMeta: { ip?: string; ua?: string },
  ) {
    const record = await this.prisma.verificationToken.findFirst({
      where: { identifier: dto.identifier, otp: dto.otp },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) throw new UnauthorizedException('Invalid OTP');
    if (record.expiresAt < new Date()) throw new UnauthorizedException('OTP expired');

    if (record.userId == null) throw new UnauthorizedException('User not found');

    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
    });

    if (!user) throw new UnauthorizedException('User not found');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.prisma.session.create({
      data: {
        refreshToken,
        userId: user.id,
        ipAddress: reqMeta.ip,
        userAgent: reqMeta.ua,
        expiresAt: addDays(new Date(), 7),
      },
    });

    await this.prisma.verificationToken.deleteMany({ where: { id: record.id } });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  // ---------------------- REFRESH TOKEN --------------------------------
  async refreshToken(dto: { refreshToken: string }) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: dto.refreshToken },
    });

    if (!session) throw new UnauthorizedException('Invalid refresh token');

    const payload = this.jwtService.verify(dto.refreshToken, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const newAccess = this.generateAccessToken(user);

    return {
      accessToken: newAccess,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  // ---------------------- LOGOUT --------------------------------
  async logout(dto: { refreshToken: string }) {
    await this.prisma.session.deleteMany({
      where: { refreshToken: dto.refreshToken },
    });
    return { message: 'Logged out' };
  }

  // ---------------------- TOKEN HELPERS --------------------------------
  generateAccessToken(user: any) {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role, // ✔ always include role
      },
      {
        expiresIn: this.config.get('JWT_EXPIRATION') || '15m',
      },
    );
  }

  generateRefreshToken(user: any) {
    return this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRATION') || '7d',
      },
    );
  }

  // ---------------------- AFTER ROLE CHANGE → NEW TOKENS --------------------------------
  // Accepts optional request metadata so a new session can be created
  async generateTokenAfterRoleChange(
    userId: number,
    reqMeta?: { ip?: string; ua?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Create a session record if metadata provided
    if (reqMeta) {
      await this.prisma.session.create({
        data: {
          refreshToken,
          userId: user.id,
          ipAddress: reqMeta.ip,
          userAgent: reqMeta.ua,
          expiresAt: addDays(new Date(), 7),
        },
      });
    }

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
