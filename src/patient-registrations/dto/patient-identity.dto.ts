import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class PatientIdentityDto {
  @ApiProperty({
    example: 'Rajesh Varma',
    description: 'Name of the customer (patient)',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    example: 42,
    description: 'Age in years (integer, no decimals)',
    minimum: 0,
    maximum: 120,
  })
  @IsInt({ message: 'Age must be an integer (no decimals)' })
  @Min(0, { message: 'Age cannot be negative' })
  @Max(120, { message: 'Age cannot exceed 120 years' })
  age: number;

  @ApiProperty({
    example: 'Male',
    enum: ['Male', 'Female'],
    description: 'Gender of patient (Male or Female)',
  })
  @IsIn(['Male', 'Female'], { message: 'Gender must be either Male or Female' })
  gender: 'Male' | 'Female';
}
