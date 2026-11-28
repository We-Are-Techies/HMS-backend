import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsString, Matches, Max, Min, Length, ValidateIf } from 'class-validator';
import { genders, patientTitles } from '../entities/patient-registration.entity.js';
import type { Gender, PatientTitle } from '../entities/patient-registration.entity.js';

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[\s()+.-]/g, '');
  return /^91\d{10}$/.test(digits) ? digits.slice(2) : digits;
}

export const phoneFormat = /^\+?[0-9][0-9 ().-]{5,24}$/;

export class PatientIdentityDto {
  @ApiProperty({ example: 'Rajesh Varma', minLength: 2, maxLength: 100 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({ enum: [...patientTitles] })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(patientTitles)
  title?: PatientTitle;

  @ApiProperty({ description: 'Age in years', minimum: 0, maximum: 120 })
  @IsInt()
  @Min(0)
  @Max(120)
  age: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 11 })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(11)
  ageMonths?: number;

  @ApiProperty({ enum: [...genders] })
  @IsIn(genders)
  gender: Gender;

  @ApiProperty({ example: '+91 98765 43210' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Matches(phoneFormat)
  phone: string;
}
