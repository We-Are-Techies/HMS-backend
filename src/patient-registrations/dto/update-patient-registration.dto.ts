import { PartialType } from '@nestjs/swagger';
import { CreatePatientRegistrationDto } from './create-patient-registration.dto.js';

export class UpdatePatientRegistrationDto extends PartialType(CreatePatientRegistrationDto) {}

