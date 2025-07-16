import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medication } from '../entities/medication.entity';
import { Repository } from 'typeorm';
import { CreateMedicationDto } from '../dtos/create-medication.dto';
import { UpdateMedicationDto } from '../dtos/update-medication.dto';

@Injectable()
export class MedicationService {
    constructor(
        @InjectRepository(Medication)
        private medicationRepo: Repository<Medication>
    ) { }

    async create(createMedicationDto: CreateMedicationDto): Promise<Medication> {
        const medication = this.medicationRepo.create({
            name: createMedicationDto.name,
            dosage: createMedicationDto.dosage,
            frequency: createMedicationDto.frequency
        });

        return await this.medicationRepo.save(medication);
    }

    async findAll(): Promise<Medication[]> {
        return this.medicationRepo.find();
    }

    async findOne(id: number) {
        const medication = await this.medicationRepo.findOne({ where: { id } });
        if (!medication) {
            throw new NotFoundException("Medication not found");
        }
        return medication;
    }

    async update(id: number, updateMedicationDto: UpdateMedicationDto) {
        await this.findOne(id);
        await this.medicationRepo.update(id, updateMedicationDto);
        return this.medicationRepo.findOne({ where: { id } }); // Or we can call again our local function findOne()
    }

    async remove(id: number){
        this.findOne(id);
        this.medicationRepo.delete(id);
    }
}
