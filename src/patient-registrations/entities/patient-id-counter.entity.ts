import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('patient_id_counters')
export class PatientIdCounter {
  @ObjectIdColumn()
  _id: string;

  @Column()
  lastIssued: number;
}
