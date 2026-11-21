import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 124, description: 'Total cumulative registered patients' })
  totalPatients: number;

  @ApiProperty({ example: 18, description: 'Number of patients registered today' })
  todayRegistrations: number;

  @ApiProperty({ example: 86, description: 'Count of patients with normal blood pressure' })
  normalBPCount: number;

  @ApiProperty({ example: 38, description: 'Count of patients with elevated/hypertensive blood pressure' })
  elevatedBPCount: number;

  @ApiProperty({ description: 'List of the 5 most recent patient registrations' })
  recentRegistrations: any[];
}

