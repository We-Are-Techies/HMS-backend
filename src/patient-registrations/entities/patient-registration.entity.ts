import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';

export const genders = ['Male', 'Female', 'Transgender', 'Prefer not to disclose'] as const;
export type Gender = (typeof genders)[number];
export const patientTitles = ['Mr', 'Ms', 'Mrs', 'Baby'] as const;
export type PatientTitle = (typeof patientTitles)[number];

export class PatientIdentity {
  @Column()
  name: string;

  @Column()
  title?: PatientTitle;

  @Column()
  age: number;

  @Column()
  gender: Gender;

  @Column()
  ageMonths?: number;

  @Column()
  phone?: string;
}

export class BodyMeasurements {
  @Column()
  height?: number;

  @Column()
  weight?: number;
}

export class BloodPressureVitals {
  @Column()
  systolic?: number;

  @Column()
  diastolic?: number;
}

export class RegistrationTimestamp {
  @Column()
  date: string;

  @Column()
  time: string;
}

@Entity('patient_registrations')
export class PatientRegistration {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  patientId?: number | string;

  @Column()
  clinicName?: string;

  @Column()
  language?: 'en' | 'ta';

  @Column(() => PatientIdentity)
  patientIdentity: PatientIdentity;

  @Column(() => BodyMeasurements)
  bodyMeasurements: BodyMeasurements;

  @Column(() => BloodPressureVitals)
  bloodPressureVitals: BloodPressureVitals;

  @Column(() => RegistrationTimestamp)
  registrationTimestamp: RegistrationTimestamp;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
