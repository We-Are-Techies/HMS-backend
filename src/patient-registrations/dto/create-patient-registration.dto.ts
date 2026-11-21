import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsNotEmptyObject } from 'class-validator';
import { PatientIdentityDto } from './patient-identity.dto.js';
import { BodyMeasurementsDto } from './body-measurements.dto.js';
import { BloodPressureVitalsDto } from './blood-pressure-vitals.dto.js';

export class CreatePatientRegistrationDto {
  @ApiProperty({ type: PatientIdentityDto, description: 'Patient demographic and identity details' })
  @IsNotEmptyObject({}, { message: 'patientIdentity must not be empty' })
  @ValidateNested()
  @Type(() => PatientIdentityDto)
  patientIdentity: PatientIdentityDto;

  @ApiProperty({ type: BodyMeasurementsDto, description: 'Patient body measurements (height & weight)' })
  @IsNotEmptyObject({}, { message: 'bodyMeasurements must not be empty' })
  @ValidateNested()
  @Type(() => BodyMeasurementsDto)
  bodyMeasurements: BodyMeasurementsDto;

  @ApiProperty({ type: BloodPressureVitalsDto, description: 'Patient blood pressure vitals (systolic & diastolic)' })
  @IsNotEmptyObject({}, { message: 'bloodPressureVitals must not be empty' })
  @ValidateNested()
  @Type(() => BloodPressureVitalsDto)
  bloodPressureVitals: BloodPressureVitalsDto;
}
