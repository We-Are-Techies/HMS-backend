import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Max, Min } from 'class-validator';

export class BloodPressureVitalsDto {
  @ApiProperty({
    example: 120,
    description: 'Systolic blood pressure in mmHg (positive integer)',
    minimum: 40,
    maximum: 300,
  })
  @IsInt({ message: 'Systolic BP must be an integer in mmHg' })
  @IsPositive({ message: 'Systolic BP must be positive' })
  @Min(40, { message: 'Systolic BP must be at least 40 mmHg' })
  @Max(300, { message: 'Systolic BP must not exceed 300 mmHg' })
  systolic: number;

  @ApiProperty({
    example: 80,
    description: 'Diastolic blood pressure in mmHg (positive integer)',
    minimum: 20,
    maximum: 200,
  })
  @IsInt({ message: 'Diastolic BP must be an integer in mmHg' })
  @IsPositive({ message: 'Diastolic BP must be positive' })
  @Min(20, { message: 'Diastolic BP must be at least 20 mmHg' })
  @Max(200, { message: 'Diastolic BP must not exceed 200 mmHg' })
  diastolic: number;
}

