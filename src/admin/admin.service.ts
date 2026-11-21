import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import type { Response } from 'express';
import { Admin } from './entities/admin.entity.js';
import { PatientRegistration } from '../patient-registrations/entities/patient-registration.entity.js';
import { LoginAdminDto } from './dto/login-admin.dto.js';
import { AdminQueryPatientsDto } from './dto/admin-query-patients.dto.js';

@Injectable()
export class AdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(PatientRegistration)
    private readonly patientRepo: Repository<PatientRegistration>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Automatically seed initial admin user if none exists in MongoDB.
   */
  async onApplicationBootstrap() {
    try {
      const existingAdmin = await this.adminRepo.findOne({ where: {} as any });
      if (!existingAdmin) {
        const defaultEmail = this.configService
          .get<string>('ADMIN_DEFAULT_EMAIL', 'admin@varmanursinghome.com')
          .toLowerCase();
        const defaultPassword = this.configService.get<string>(
          'ADMIN_DEFAULT_PASSWORD',
          'Admin@Varma2026',
        );
        const defaultName = this.configService.get<string>(
          'ADMIN_DEFAULT_NAME',
          'Varma Admin',
        );

        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const admin = this.adminRepo.create({
          name: defaultName,
          email: defaultEmail,
          password: hashedPassword,
          role: 'admin',
        });

        await this.adminRepo.save(admin);
        this.logger.log(
          `Initial admin account created successfully (${defaultEmail})`,
        );
      } else {
        this.logger.log('Admin account verified in MongoDB database.');
      }
    } catch (err: any) {
      this.logger.warn(
        `Could not complete admin account auto-seed: ${err.message}`,
      );
    }
  }

  /**
   * Authenticate admin credentials, generate JWT and set secure HTTP-only cookie.
   */
  async login(loginDto: LoginAdminDto, res: Response) {
    const email = loginDto.email.trim().toLowerCase();
    const admin = await this.adminRepo.findOne({
      where: { email } as any,
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Set secure HTTP-only cookie
    res.cookie('admin_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Admin login successful',
      accessToken,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Logout admin and clear HTTP-only session cookie.
   */
  async logout(res: Response) {
    res.clearCookie('admin_token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Admin logged out successfully',
    };
  }

  /**
   * Retrieve aggregated dashboard statistics from MongoDB.
   */
  async getDashboardStats() {
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const allPatients = await this.patientRepo.find({
      order: { createdAt: 'DESC' },
    });

    const totalPatients = allPatients.length;

    // Filter today's registrations
    const todayRegistrations = allPatients.filter((p) => {
      const regDate = p.registrationTimestamp?.date;
      if (regDate) {
        // match YYYY-MM-DD or DD/MM/YYYY
        if (regDate === todayStr) return true;
        const parts = regDate.split('/');
        if (parts.length === 3) {
          const iso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          if (iso === todayStr) return true;
        }
      }
      if (p.createdAt) {
        return new Date(p.createdAt).toISOString().slice(0, 10) === todayStr;
      }
      return false;
    }).length;

    // Blood pressure vital categories
    let normalBPCount = 0;
    let elevatedBPCount = 0;

    allPatients.forEach((p) => {
      const sys = p.bloodPressureVitals?.systolic;
      const dia = p.bloodPressureVitals?.diastolic;
      if (sys && dia) {
        if (sys < 120 && dia < 80) {
          normalBPCount++;
        } else {
          elevatedBPCount++;
        }
      }
    });

    const recentRegistrations = allPatients.slice(0, 5);

    return {
      statusCode: 200,
      data: {
        totalPatients,
        todayRegistrations,
        normalBPCount,
        elevatedBPCount,
        recentRegistrations,
      },
    };
  }

  /**
   * Admin paginated patient list with search and date filters.
   */
  async findAllPatients(query: AdminQueryPatientsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));

    // Fetch all for in-memory or query filtering
    let records = await this.patientRepo.find({
      order: { createdAt: 'DESC' },
    });

    // Name search filter
    if (query.search && query.search.trim()) {
      const term = query.search.trim().toLowerCase();
      records = records.filter(
        (r) =>
          r.patientIdentity?.name?.toLowerCase().includes(term) ||
          r._id?.toString()?.toLowerCase().includes(term),
      );
    }

    // Date filter
    if (query.date && query.date.trim()) {
      const targetDate = query.date.trim();
      records = records.filter((r) => {
        const d = r.registrationTimestamp?.date;
        if (!d) return false;
        if (d === targetDate) return true;
        const parts = d.split('/');
        if (parts.length === 3) {
          const iso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          return iso === targetDate;
        }
        return false;
      });
    }

    const total = records.length;
    const skip = (page - 1) * limit;
    const paginated = records.slice(skip, skip + limit);

    return {
      statusCode: 200,
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get specific patient record by MongoDB ObjectId.
   */
  async findPatientById(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException(
        `Invalid registration ID: "${id}". Must be a valid 24-character hexadecimal ObjectId.`,
      );
    }

    const record = await this.patientRepo.findOne({
      where: { _id: new ObjectId(id) } as any,
    });

    if (!record) {
      throw new NotFoundException(
        `Patient registration with ID "${id}" was not found.`,
      );
    }

    return {
      statusCode: 200,
      data: record,
    };
  }
}
