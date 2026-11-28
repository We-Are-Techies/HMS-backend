import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePatientRegistrationDto } from './create-patient-registration.dto.js';
import { normalizePhone } from './patient-identity.dto.js';

const patientIdentity = {
  name: 'Test Patient',
  age: 0,
  ageMonths: 8,
  gender: 'Transgender',
  phone: '+91 98765 43210',
};
const check = (extra: Record<string, unknown> = {}) =>
  validate(plainToInstance(CreatePatientRegistrationDto, { patientIdentity, ...extra }));

describe('patient registration input', () => {
  it.each(['Mr', 'Ms', 'Mrs', 'Baby'])('accepts the title %s and preserves spaced initials', async title => {
    const dto = plainToInstance(CreatePatientRegistrationDto, {
      patientIdentity: { ...patientIdentity, title, name: ' A. B. Kumar ' },
    });
    expect(await validate(dto)).toEqual([]);
    expect(dto.patientIdentity.name).toBe('A. B. Kumar');
  });

  it('accepts an infant age and omitted measurements', async () => {
    expect(await check()).toEqual([]);
  });

  it('accepts boundary values and either BP field by itself', async () => {
    expect(await check({ bodyMeasurements: { weight: 0.1, height: 0 }, bloodPressureVitals: { diastolic: 160 } })).toEqual([]);
    expect(await check({ bodyMeasurements: { weight: 150, height: 220 }, bloodPressureVitals: { systolic: 60 } })).toEqual([]);
  });

  it.each([
    { bodyMeasurements: { weight: 0.09 } },
    { bodyMeasurements: { weight: 1.23 } },
    { bodyMeasurements: { weight: 150.1 } },
    { bodyMeasurements: { height: 1.5 } },
    { bodyMeasurements: { height: 221 } },
    { bloodPressureVitals: { systolic: 59 } },
    { bloodPressureVitals: { diastolic: 161 } },
    { bloodPressureVitals: { diastolic: 80.5 } },
    { patientIdentity: { ...patientIdentity, ageMonths: 12 } },
    { patientIdentity: { ...patientIdentity, phone: undefined } },
    { patientIdentity: { ...patientIdentity, phone: 'invalid' } },
    { patientIdentity: { ...patientIdentity, title: 'Dr' } },
  ])('rejects invalid input %j', async (extra) => {
    expect(await check(extra)).not.toEqual([]);
  });

  it('normalizes Indian country codes and separators for phone matching', () => {
    expect(normalizePhone('+91 (98765) 43210')).toBe(normalizePhone('98765-43210'));
  });
});
