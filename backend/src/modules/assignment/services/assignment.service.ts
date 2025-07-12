import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from '../entities/assignment.entity';
import { Repository } from 'typeorm';
import { CreateAssignmentDto } from '../dtos/create-assignment.dto';
import { Patient } from '../../patient/entities/patient.entity';
import { Medication } from '../../medication/entities/medication.entity';
import { UpdateAssignmentDto } from '../dtos/update-assignment.dto';
import { GetPatientDto } from 'src/modules/patient/dtos/get-patient.dto';

@Injectable()
export class AssignmentService {

    constructor(
        @InjectRepository(Assignment)
        private assignmentRepo: Repository<Assignment>
    ) { }

    async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {

        const { patientId, medicationId, startDate, numberOfDays } = createAssignmentDto;

        const patient = await this.assignmentRepo.manager.findOne(Patient, { where: { id: patientId } });
        if (!patient) throw new NotFoundException(`Patient with id ${patientId} not found`);

        const medication = await this.assignmentRepo.manager.findOne(Medication, { where: { id: medicationId } });
        if (!medication) throw new NotFoundException(`Medication with id ${medicationId} not found`);

        const assignment = new Assignment();
        assignment.startDate = new Date(startDate); // Explicitly convert the String to Date Type
        assignment.numberOfDays = numberOfDays;
        assignment.patient = patient;
        assignment.medication = medication;

        return await this.assignmentRepo.save(assignment);
    }

    async findAll(): Promise<Assignment[]> {
        return this.assignmentRepo.find({ relations: ['patient', 'medication'] });
    }

    async findOne(id: number) {
        const patient = await this.assignmentRepo.findOne({ where: { id }, relations: ['patient', 'medication'] });
        if (!patient) {
            throw new NotFoundException("Patient not found");
        }
        return patient;
    }

    async update(id: number, updateAssignmentDto: UpdateAssignmentDto) {
        const assignment = await this.findOne(id);
        // Only allow updating the treatment details, not the patient or medication
        // This is could be safe especially in a medical context where changing assigned medication mid-treatment could be dangerous
        assignment.startDate = new Date(updateAssignmentDto.startDate);
        assignment.numberOfDays = updateAssignmentDto.numberOfDays;
        await this.assignmentRepo.save(assignment);

        return this.assignmentRepo.findOne({ where: { id } }); // Or we can call again our local function findOne()
    }

    async remove(id: number) {
        this.findOne(id);
        this.assignmentRepo.delete(id);
    }

    async getRemainingDays() {
        const assignments = await this.assignmentRepo.find({ relations: ['patient', 'medication'] })
        const today = new Date();

        // The first (inner) return is inside the .map() function, it's necessary to return a new objects for each assignment
        return assignments.map((assignment) => {
            const startDay = new Date(assignment.startDate);
            // Calculate the number of full days that have passed since the assignment started
            const passDays = Math.floor((today.getTime() - startDay.getTime()) / (1000 * 3600 * 24)) // (1000 * 3600 * 24) To converts milliseconds to days.
            // Calculate remaining treatment days by subtracting elapsed days from the total
            // If it's negative, return 0 instead (i.e., treatment is complete)
            const remainingDay = Math.max(assignment.numberOfDays - passDays, 0);

            //The second (outer) return us returning the final array of the new objects.
            return {
                "Assignment Id: ": assignment.id,
                "Patient Name: ": assignment.patient.name,
                "Medication Name: ": assignment.medication.name,
                "Remaining Days: ": remainingDay
            }
        })
    }

    /**
     * This utility method was not part of the original feature list,
     * but was added to support my custom design requirement.
     * It allows retrieving remaining treatment days for a specific patient
     * by providing their name and date of birth.
     */
    async GetPatientRemaningDays(getPatientDto: GetPatientDto) {
        const name = getPatientDto.name;
        const dateOfBirth = getPatientDto.dateOfBirth;
        const today = new Date();

        const assignments = await this.assignmentRepo.find({
            relations: ['patient', 'medication'],
            where: {
                patient: {
                    name,
                    dateOfBirth: getPatientDto.dateOfBirth,
                } as any, // casting to any to bypass deep type issue with FindOptionsWhere
            },
        });

        // The first (inner) return is inside the .map() function, it's necessary to return a new objects for each assignment
        return assignments.map((assignment) => {
            const startDay = new Date(assignment.startDate);
            // Calculate the number of full days that have passed since the assignment started
            const passDays = Math.floor((today.getTime() - startDay.getTime()) / (1000 * 3600 * 24)) // (1000 * 3600 * 24) To converts milliseconds to days.
            // Calculate remaining treatment days by subtracting elapsed days from the total
            // If it's negative, return 0 instead (i.e., treatment is complete)
            const remainingDay = Math.max(assignment.numberOfDays - passDays, 0);

            //The second (outer) return us returning the final array of the new objects.
            return {
                "Assignment Id: ": assignment.id,
                "Patient Name: ": assignment.patient.name,
                "Medication Name :": assignment.medication.name,
                "Remaining Days: ": remainingDay
            }
        })

    }

}
