import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRegistration } from './entities/patient-registration.entity.js';
import { PatientRegistrationsService } from './patient-registrations.service.js';
import { PatientRegistrationsController } from './patient-registrations.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([PatientRegistration])],
  controllers: [PatientRegistrationsController],
  providers: [PatientRegistrationsService],
  exports: [PatientRegistrationsService],
})
export class PatientRegistrationsModule {}
