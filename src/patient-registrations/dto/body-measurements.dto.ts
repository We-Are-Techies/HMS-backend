import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Max, Min } from 'class-validator';

export class BodyMeasurementsDto {
  @ApiProperty({
    example: 172,
    description: 'Height in cm (positive integer, no decimals)',
    minimum: 1,
    maximum: 300,
  })
  @IsInt({ message: 'Height must be an integer in cm (no decimals)' })
  @IsPositive({ message: 'Height must be a positive integer' })
  @Min(1, { message: 'Height must be at least 1 cm' })
  @Max(300, { message: 'Height must not exceed 300 cm' })
  height: number;

  @ApiProperty({
    example: 68,
    description: 'Weight in kg (positive integer, no decimals)',
    minimum: 1,
    maximum: 500,
  })
  @IsInt({ message: 'Weight must be an integer in kg (no decimals)' })
  @IsPositive({ message: 'Weight must be a positive integer' })
  @Min(1, { message: 'Weight must be at least 1 kg' })
  @Max(500, { message: 'Weight must not exceed 500 kg' })
  weight: number;
}
