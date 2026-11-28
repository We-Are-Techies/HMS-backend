import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Max, Min, ValidateIf } from 'class-validator';

export class BloodPressureVitalsDto {
  @ApiPropertyOptional({ example: 120, minimum: 60, maximum: 260, description: 'Systolic pressure in mmHg' })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(60)
  @Max(260)
  systolic?: number;

  @ApiPropertyOptional({ example: 80, minimum: 40, maximum: 160, description: 'Diastolic pressure in mmHg' })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(40)
  @Max(160)
  diastolic?: number;
}
