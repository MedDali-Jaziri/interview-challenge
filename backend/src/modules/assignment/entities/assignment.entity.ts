import { Medication } from "../../medication/entities/medication.entity";
import { Patient } from "../../patient/entities/patient.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("assignment")
export class Assignment {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Patient, (patient) => patient.assignments)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => Medication, (medication) => medication.assignments)
    @JoinColumn({ name: "medication_id" })
    medication: Medication;

    @Column({ type: "date" })
    startDate: Date;

    @Column()
    numberOfDays: number;
}
