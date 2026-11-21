import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PatientRegistrationsModule } from './patient-registrations/patient-registrations.module.js';
import { PatientRegistration } from './patient-registrations/entities/patient-registration.entity.js';
import { AdminModule } from './admin/admin.module.js';
import { Admin } from './admin/entities/admin.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGODB_URI', 'mongodb://127.0.0.1:27017/varma_nursing_home'),
        database: configService.get<string>('MONGODB_DATABASE', 'varma_nursing_home'),
        entities: [PatientRegistration, Admin],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    PatientRegistrationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
