import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsObject, IsString, Length, Matches, ValidateIf, ValidateNested } from 'class-validator';
import { PatientIdentityDto } from './patient-identity.dto.js';
import { BodyMeasurementsDto } from './body-measurements.dto.js';
import { BloodPressureVitalsDto } from './blood-pressure-vitals.dto.js';

export class CreatePatientRegistrationDto {
  @ApiPropertyOptional({ example: 'Varma Nursing Home' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(1, 120)
  clinicName?: string;

  @ApiPropertyOptional({ enum: ['en', 'ta'] })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(['en', 'ta'])
  language?: 'en' | 'ta';

  @ApiProperty({ type: PatientIdentityDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PatientIdentityDto)
  patientIdentity: PatientIdentityDto;

  @ApiPropertyOptional({ type: BodyMeasurementsDto })
  @ValidateIf((_, value) => value !== undefined)
  @IsObject()
  @ValidateNested()
  @Type(() => BodyMeasurementsDto)
  bodyMeasurements?: BodyMeasurementsDto;

  @ApiPropertyOptional({ type: BloodPressureVitalsDto })
  @ValidateIf((_, value) => value !== undefined)
  @IsObject()
  @ValidateNested()
  @Type(() => BloodPressureVitalsDto)
  bloodPressureVitals?: BloodPressureVitalsDto;
}

export class CreateConsultationDto extends CreatePatientRegistrationDto {
  @ApiProperty({ example: '1000000000000000' })
  @Matches(/^(?:[1-9]\d{15}|[0-9a-f]{24})$/i)
  patientId: string;
}

export class LookupPatientDto {
  @ApiProperty({ description: 'Patient ID or telephone number' })
  @IsString()
  @Length(1, 40)
  identifier: string;
}
