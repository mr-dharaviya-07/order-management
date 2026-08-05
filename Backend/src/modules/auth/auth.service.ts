import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { User, UserRole } from '../../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('Email is already registered');
    
    const user = this.userRepository.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 12),
      role: dto.role || UserRole.CUSTOMER,
    });
    
    await this.userRepository.save(user);
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { refreshTokenHash: null });
    return { ok: true };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwt.verifyAsync<{ sub: string }>(refreshToken, { secret: process.env.JWT_REFRESH_SECRET }).catch(() => null);
    if (!payload) throw new UnauthorizedException('Invalid refresh token');
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: (process.env.ACCESS_TOKEN_TTL ?? '15m') as any });
    const refreshToken = await this.jwt.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: (process.env.REFRESH_TOKEN_TTL ?? '7d') as any });
    await this.userRepository.update(user.id, { refreshTokenHash: await bcrypt.hash(refreshToken, 12) });
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken };
  }
}

