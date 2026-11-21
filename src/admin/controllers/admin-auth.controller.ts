import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Res, 
  UseGuards, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiCookieAuth 
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AdminService } from '../admin.service.js';
import { LoginAdminDto } from '../dto/login-admin.dto.js';
import { AdminProfileDto } from '../dto/admin-profile.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentAdmin } from '../decorators/current-admin.decorator.js';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login',
    description: 'Authenticates admin credentials from MongoDB, returns JWT access token, and sets secure HTTP-only cookie.',
  })
  @ApiResponse({ status: 200, description: 'Admin login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  async login(
    @Body() loginDto: LoginAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.login(loginDto, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin logout',
    description: 'Clears the admin authentication HTTP-only session cookie.',
  })
  @ApiResponse({ status: 200, description: 'Admin logged out successfully.' })
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.adminService.logout(res);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('admin_token')
  @ApiOperation({
    summary: 'Get current admin profile',
    description: 'Retrieves profile information for the currently authenticated admin session.',
  })
  @ApiResponse({ status: 200, type: AdminProfileDto, description: 'Authenticated admin profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or expired JWT token.' })
  getProfile(@CurrentAdmin() admin: any) {
    return {
      statusCode: 200,
      admin,
    };
  }
}
