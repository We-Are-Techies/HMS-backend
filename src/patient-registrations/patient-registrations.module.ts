import { AdminModule } from '../admin/admin.module.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRegistration } from './entities/patient-registration.entity.js';
import { PatientIdCounter } from './entities/patient-id-counter.entity.js';
import { PatientRegistrationsService } from './patient-registrations.service.js';
import { PatientRegistrationsController } from './patient-registrations.controller.js';

@Module({
  imports: [AdminModule, TypeOrmModule.forFeature([PatientRegistration, PatientIdCounter])],
  controllers: [PatientRegistrationsController],
  providers: [PatientRegistrationsService],
  exports: [PatientRegistrationsService],
})
export class PatientRegistrationsModule {}
