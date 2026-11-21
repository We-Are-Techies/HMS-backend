import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { PatientRegistration } from './entities/patient-registration.entity.js';
import { CreatePatientRegistrationDto } from './dto/create-patient-registration.dto.js';
import { UpdatePatientRegistrationDto } from './dto/update-patient-registration.dto.js';
import { QueryPatientRegistrationDto } from './dto/query-patient-registration.dto.js';

@Injectable()
export class PatientRegistrationsService {
  private readonly logger = new Logger(PatientRegistrationsService.name);

  constructor(
    @InjectRepository(PatientRegistration)
    private readonly registrationRepo: Repository<PatientRegistration>,
  ) {}

  private parseObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid registration ID format: "${id}". Must be a valid 24-character hexadecimal ObjectId.`);
    }
    return new ObjectId(id);
  }

  async create(createDto: CreatePatientRegistrationDto): Promise<PatientRegistration> {
    this.logger.log(`Creating new patient registration for: ${createDto.patientIdentity.name}`);

    // Server-side audit timestamp generation (not trusted from client)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = now.toTimeString().slice(0, 8); // HH:MM:SS

    const registration = this.registrationRepo.create({
      patientIdentity: {
        name: createDto.patientIdentity.name.trim(),
        age: createDto.patientIdentity.age,
        gender: createDto.patientIdentity.gender,
      },
      bodyMeasurements: {
        height: createDto.bodyMeasurements.height,
        weight: createDto.bodyMeasurements.weight,
      },
      bloodPressureVitals: {
        systolic: createDto.bloodPressureVitals.systolic,
        diastolic: createDto.bloodPressureVitals.diastolic,
      },
      registrationTimestamp: {
        date: dateStr,
        time: timeStr,
      },
    });

    const saved = await this.registrationRepo.save(registration);
    this.logger.log(`Patient registration created successfully with ID: ${saved._id.toString()}`);
    return saved;
  }

  async findAll(query: QueryPatientRegistrationDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await this.registrationRepo.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      statusCode: 200,
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<PatientRegistration> {
    const objectId = this.parseObjectId(id);
    const registration = await this.registrationRepo.findOne({
      where: { _id: objectId } as any,
    });

    if (!registration) {
      throw new NotFoundException(`Patient registration with ID "${id}" was not found.`);
    }

    return registration;
  }

  async update(id: string, updateDto: UpdatePatientRegistrationDto): Promise<PatientRegistration> {
    const registration = await this.findOne(id);

    if (updateDto.patientIdentity) {
      Object.assign(registration.patientIdentity, updateDto.patientIdentity);
    }

    if (updateDto.bodyMeasurements) {
      Object.assign(registration.bodyMeasurements, updateDto.bodyMeasurements);
    }

    if (updateDto.bloodPressureVitals) {
      Object.assign(registration.bloodPressureVitals, updateDto.bloodPressureVitals);
    }

    const updated = await this.registrationRepo.save(registration);
    this.logger.log(`Patient registration with ID ${id} updated successfully`);
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    const registration = await this.findOne(id);
    await this.registrationRepo.remove(registration);
    this.logger.log(`Patient registration with ID ${id} deleted successfully`);

    return {
      success: true,
      message: `Patient registration with ID "${id}" has been deleted successfully.`,
      deletedId: id,
    };
  }
}
