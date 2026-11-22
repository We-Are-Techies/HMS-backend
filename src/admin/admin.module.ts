import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin } from './entities/admin.entity.js';
import { PatientRegistration } from '../patient-registrations/entities/patient-registration.entity.js';
import { AdminService } from './admin.service.js';
import { AdminAuthController } from './controllers/admin-auth.controller.js';
import { AdminDashboardController } from './controllers/admin-dashboard.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, PatientRegistration]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'varma_nursing_home_jwt_secret_key_2026_super_secure',
        ),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1d') as any,
        },
      }),
    }),
  ],
  controllers: [AdminAuthController, AdminDashboardController],
  providers: [AdminService, JwtStrategy],
  exports: [AdminService, JwtModule, PassportModule],
})
export class AdminModule {}
