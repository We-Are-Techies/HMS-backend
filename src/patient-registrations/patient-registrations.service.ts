import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { normalizePhone, phoneFormat } from './dto/patient-identity.dto.js';
import { ObjectId } from 'mongodb';
import { PatientRegistration } from './entities/patient-registration.entity.js';
import { PatientIdCounter } from './entities/patient-id-counter.entity.js';
import { CreatePatientRegistrationDto } from './dto/create-patient-registration.dto.js';
import { UpdatePatientRegistrationDto } from './dto/update-patient-registration.dto.js';
import { QueryPatientRegistrationDto } from './dto/query-patient-registration.dto.js';

export interface PatientMatch {
  patientId: number | string;
  patientIdentity: PatientRegistration['patientIdentity'];
}

@Injectable()
export class PatientRegistrationsService {
  private readonly logger = new Logger(PatientRegistrationsService.name);

  constructor(
    @InjectRepository(PatientRegistration)
    private readonly registrationRepo: MongoRepository<PatientRegistration>,
    @InjectRepository(PatientIdCounter)
    private readonly patientIdCounter: MongoRepository<PatientIdCounter>,
  ) {}

  private parseObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException(
        `Invalid registration ID format: "${id}". Must be a valid 24-character hexadecimal ObjectId.`,
      );
    }
    return new ObjectId(id);
  }

  async create(
    createDto: CreatePatientRegistrationDto,
    existingPatientId?: string,
  ): Promise<PatientRegistration> {
    const normalizedPhone = this.validatePhone(createDto.patientIdentity.phone);
    let patientId: number | string;
    if (existingPatientId) {
      const [patient] = await this.lookup(existingPatientId);
      if (!patient) throw new NotFoundException('Patient not found');
      patientId = patient.patientId;
    } else {
      patientId = await this.allocatePatientId();
    }

    const id = new ObjectId();

    // Server-side audit timestamp generation (not trusted from client)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = now.toTimeString().slice(0, 8); // HH:MM:SS

    const registration = this.registrationRepo.create({
      _id: id,
      patientId,
      clinicName: createDto.clinicName ?? 'Varma Nursing Home',
      language: createDto.language ?? 'en',
      patientIdentity: { ...createDto.patientIdentity, phone: normalizedPhone },
      bodyMeasurements: {
        height: createDto.bodyMeasurements?.height,
        weight: createDto.bodyMeasurements?.weight,
      },
      bloodPressureVitals: {
        systolic: createDto.bloodPressureVitals?.systolic,
        diastolic: createDto.bloodPressureVitals?.diastolic,
      },
      registrationTimestamp: {
        date: dateStr,
        time: timeStr,
      },
    });

    const saved = await this.registrationRepo.save(registration);
    this.logger.log(
      `Patient registration created successfully with ID: ${saved._id.toString()}`,
    );
    return saved;
  }

  private async allocatePatientId(): Promise<number> {
    const counter = await this.patientIdCounter.findOneAndUpdate(
      { _id: 'patient' },
      [{ $set: { lastIssued: { $add: [{ $ifNull: ['$lastIssued', 999_999_999_999_999] }, 1] } } }],
      { upsert: true, returnDocument: 'after' },
    );
    const lastIssued: unknown = counter?.lastIssued;
    if (typeof lastIssued !== 'number' || !Number.isSafeInteger(lastIssued)) {
      throw new ServiceUnavailableException('Could not allocate a patient ID');
    }
    return lastIssued;
  }

  private validatePhone(phone: string): string {
    const normalized = normalizePhone(phone);
    if (!phoneFormat.test(phone) || !/^\d{7,15}$/.test(normalized)) {
      throw new BadRequestException('Enter a valid telephone number');
    }
    return normalized;
  }

  async lookup(identifier: string): Promise<PatientMatch[]> {
    const legacyId = /^[0-9a-f]{24}$/i.test(identifier) ? identifier.toLowerCase() : undefined;
    const numericId = /^[1-9]\d{15}$/.test(identifier) ? Number(identifier) : undefined;
    if (numericId !== undefined && !Number.isSafeInteger(numericId)) return [];
    const isId = legacyId !== undefined || numericId !== undefined;
    const rows = await this.registrationRepo.find({
      where: legacyId
        ? { $or: [{ patientId: legacyId }, { _id: new ObjectId(legacyId) }] }
        : numericId !== undefined
          ? { patientId: numericId }
          : { 'patientIdentity.phone': this.validatePhone(identifier) },
      order: { createdAt: 'DESC', _id: 'DESC' },
    });
    const patients = new Map<number | string, PatientMatch>();
    for (const row of rows) {
      const patientId = row.patientId ?? row._id.toHexString();
      if (!patients.has(patientId)) {
        patients.set(patientId, { patientId, patientIdentity: row.patientIdentity });
      }
    }

    if (legacyId && patients.size && !patients.has(legacyId)) {
      return this.lookup(String([...patients.keys()][0]));
    }
    if (isId || patients.size === 0) return [...patients.values()];

    const phone = normalizePhone(identifier);
    const currentPatients = await Promise.all([...patients.keys()].map(id => this.lookup(String(id))));
    return currentPatients.flat().filter(patient => patient.patientIdentity.phone === phone);
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
      throw new NotFoundException(
        `Patient registration with ID "${id}" was not found.`,
      );
    }

    return registration;
  }

  async update(
    id: string,
    updateDto: UpdatePatientRegistrationDto,
  ): Promise<PatientRegistration> {
    const registration = await this.findOne(id);

    if (updateDto.patientIdentity) {
      const phone = updateDto.patientIdentity.phone;
      if (phone !== undefined) updateDto.patientIdentity.phone = this.validatePhone(phone);
      Object.assign(registration.patientIdentity, updateDto.patientIdentity);
    }

    if (updateDto.clinicName !== undefined) registration.clinicName = updateDto.clinicName;
    if (updateDto.language !== undefined) registration.language = updateDto.language;

    if (updateDto.bodyMeasurements) {
      registration.bodyMeasurements ??= {};
      Object.assign(registration.bodyMeasurements, updateDto.bodyMeasurements);
    }

    if (updateDto.bloodPressureVitals) {
      registration.bloodPressureVitals ??= {};
      Object.assign(
        registration.bloodPressureVitals,
        updateDto.bloodPressureVitals,
      );
    }

    const updated = await this.registrationRepo.save(registration);
    this.logger.log(`Patient registration with ID ${id} updated successfully`);
    return updated;
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string; deletedId: string }> {
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
