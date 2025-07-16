import { Assignment } from "../../assignment/entities/assignment.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("medication")
export class Medication {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    dosage: string;

    @Column()
    frequency: string;

    @OneToMany(() => Assignment, (assignment) => assignment.medication)
    assignments: Assignment[]
}
