import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBearerAuth, 
  ApiCookieAuth 
} from '@nestjs/swagger';
import { AdminService } from '../admin.service.js';
import { AdminQueryPatientsDto } from '../dto/admin-query-patients.dto.js';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

@ApiTags('Admin Dashboard & Patient Management')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCookieAuth('admin_token')
export class AdminDashboardController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({
    summary: 'Get admin dashboard KPI statistics',
    description: 'Returns real-time statistics including total patients, today registrations, vitals breakdown, and 5 recent admissions.',
  })
  @ApiResponse({ status: 200, type: DashboardStatsDto, description: 'Aggregated dashboard KPI data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin token required.' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('patient-registrations')
  @ApiOperation({
    summary: 'Admin list all patient registrations with search & filters',
    description: 'Protected endpoint returning paginated patient records with optional patient name search and registration date filters.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of patient records.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin token required.' })
  findAllPatients(@Query() query: AdminQueryPatientsDto) {
    return this.adminService.findAllPatients(query);
  }

  @Get('patient-registrations/:id')
  @ApiOperation({
    summary: 'Admin get patient registration details by ID',
    description: 'Retrieves full clinical intake document for a single patient record by MongoDB ObjectId.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId', example: '673ee85fa9123b456c789012' })
  @ApiResponse({ status: 200, description: 'Patient registration found.' })
  @ApiResponse({ status: 400, description: 'Invalid ObjectId format.' })
  @ApiResponse({ status: 404, description: 'Patient registration not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin token required.' })
  findPatientById(@Param('id') id: string) {
    return this.adminService.findPatientById(id);
  }
}
