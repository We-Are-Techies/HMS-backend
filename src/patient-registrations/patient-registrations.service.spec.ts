import { ObjectId } from 'mongodb';
import type { MongoRepository } from 'typeorm';
import { vi } from 'vitest';
import type { PatientRegistration } from './entities/patient-registration.entity.js';
import type { PatientIdCounter } from './entities/patient-id-counter.entity.js';
import { PatientRegistrationsService } from './patient-registrations.service.js';

describe('PatientRegistrationsService', () => {
  const phone = '9876543210';
  const firstId = new ObjectId();
  const secondId = new ObjectId();
  const consultationId = new ObjectId();
  const numericId = 1_000_000_000_000_000;
  const findOneAndUpdate = vi.fn().mockResolvedValue({ lastIssued: numericId });
  const counter = { findOneAndUpdate } as unknown as MongoRepository<PatientIdCounter>;
  const first = {
    _id: firstId,
    patientId: firstId.toHexString(),
    patientIdentity: { name: 'Test One', age: 20, gender: 'Female', phone },
  };
  const second = {
    _id: secondId,
    patientId: numericId,
    patientIdentity: { name: 'Test Two', age: 25, gender: 'Male', phone },
  };
  const consultation = {
    ...first,
    _id: consultationId,
    patientIdentity: { ...first.patientIdentity, age: 21 },
  };

  it('returns each family member once, using the latest consultation details', async () => {
    const find = vi.fn()
      .mockResolvedValueOnce([consultation, second, first])
      .mockResolvedValueOnce([consultation, first])
      .mockResolvedValueOnce([second]);
    const service = new PatientRegistrationsService({ find } as unknown as MongoRepository<PatientRegistration>, counter);

    expect(await service.lookup('+91 98765 43210')).toEqual([
      { patientId: first.patientId, patientIdentity: consultation.patientIdentity },
      { patientId: second.patientId, patientIdentity: second.patientIdentity },
    ]);
    expect(find.mock.calls[0][0].where).toEqual({ 'patientIdentity.phone': phone });
    expect(find.mock.calls[2][0].where).toEqual({ patientId: numericId });
  });

  it('uses a legacy registration ID as the patient ID and saves a separate consultation', async () => {
    const find = vi.fn().mockResolvedValue([{ ...first, patientId: undefined }]);
    const create = vi.fn((row: PatientRegistration) => row);
    const save = vi.fn((row: PatientRegistration) => Promise.resolve(row));
    const service = new PatientRegistrationsService({ find, create, save } as unknown as MongoRepository<PatientRegistration>, counter);
    const input = { patientIdentity: { ...first.patientIdentity, gender: 'Female' as const } };

    const followUp = await service.create(input, first.patientId);
    expect(followUp.patientId).toBe(first.patientId);
    expect(followUp._id.toHexString()).not.toBe(first.patientId);
  });

  it('stores a numeric ID for registration and reuses it for a consultation', async () => {
    const find = vi.fn().mockResolvedValue([second]);
    const create = vi.fn((row: PatientRegistration) => row);
    const save = vi.fn((row: PatientRegistration) => Promise.resolve(row));
    const service = new PatientRegistrationsService({ find, create, save } as unknown as MongoRepository<PatientRegistration>, counter);
    const input = { patientIdentity: { ...second.patientIdentity, gender: 'Male' as const } };

    const initial = await service.create(input);
    expect(initial.patientId).toBe(numericId);

    const followUp = await service.create(input, String(numericId));
    expect(followUp.patientId).toBe(numericId);
    expect(followUp._id.equals(initial._id)).toBe(false);
    expect(findOneAndUpdate).toHaveBeenCalledTimes(1);
  });
});
