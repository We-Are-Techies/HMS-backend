import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class BodyMeasurementsDto {
  @ApiPropertyOptional({ example: 172, minimum: 0, maximum: 220 })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(220)
  height?: number;

  @ApiPropertyOptional({ example: 68.5, minimum: 0.1, maximum: 150, multipleOf: 0.1 })
  @ValidateIf((_, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0.1)
  @Max(150)
  weight?: number;
}
