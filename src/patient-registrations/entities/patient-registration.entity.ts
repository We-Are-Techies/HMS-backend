import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';

export class PatientIdentity {
  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  gender: 'Male' | 'Female';
}

export class BodyMeasurements {
  @Column()
  height: number;

  @Column()
  weight: number;
}

export class BloodPressureVitals {
  @Column()
  systolic: number;

  @Column()
  diastolic: number;
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
