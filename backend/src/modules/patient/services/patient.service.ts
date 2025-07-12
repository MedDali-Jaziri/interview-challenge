import { Injectable, NotFoundException } from '@nestjs/common';
import { Patient } from '../entities/patient.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { UpdatePatientDto } from '../dtos/update-patient.dto';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private patientRepo: Repository<Patient>
    ) { }

    async create(createPatientDto: CreatePatientDto): Promise<Patient> {
        const patient = this.patientRepo.create({
            name: createPatientDto.name,
            // Explicitly convert the String to Date Type
            dateOfBirth: new Date(createPatientDto.dateOfBirth)
        });

        return await this.patientRepo.save(patient);
    }
    
    async findAll(): Promise<Patient[]> {
        return this.patientRepo.find();
    }
    

    async findOne(id: number) {
        const patient = await this.patientRepo.findOne({ where: { id } });
        if (!patient) {
            throw new NotFoundException("Patient not found");
        }
        return patient;
    }

    async update(id: number, updatePatientDto: UpdatePatientDto) {
        await this.findOne(id);
        await this.patientRepo.update(id, updatePatientDto);
        return this.patientRepo.findOne({ where: { id } }); // Or we can call again our local function findOne()
    }

    async remove(id: number){
        this.findOne(id);
        this.patientRepo.delete(id);
    }
}
