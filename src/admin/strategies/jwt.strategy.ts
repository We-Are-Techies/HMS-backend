import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Admin } from '../entities/admin.entity.js';
import type { Request } from 'express';

const cookieOrBearerExtractor = (req: Request): string | null => {
  if (req && req.cookies && req.cookies.admin_token) {
    return req.cookies.admin_token;
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {
    super({
      jwtFromRequest: cookieOrBearerExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'varma_nursing_home_jwt_secret_key_2026_super_secure',
      ),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (!payload.sub || !ObjectId.isValid(payload.sub)) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const admin = await this.adminRepo.findOne({
      where: { _id: new ObjectId(payload.sub) } as any,
    });

    if (!admin) {
      throw new UnauthorizedException('Admin account not found or inactive');
    }

    return {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  }
}
