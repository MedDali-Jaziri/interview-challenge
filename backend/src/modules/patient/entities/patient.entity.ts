import { Assignment } from "../../assignment/entities/assignment.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('patient')
export class Patient {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'date' })
    dateOfBirth: Date;

    @OneToMany(()=> Assignment, (assignment) => assignment.patient)
    assignments: Assignment[];
}
