import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { UpdatePatientDto } from '../dtos/update-patient.dto';

describe('PatientService - CRUD Test', () => {
    let service: PatientService;
    let repo: Repository<Patient>;

    beforeEach(async () => {
        const repoMock = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PatientService,
                {
                    provide: getRepositoryToken(Patient),
                    useValue: repoMock,
                },
            ],
        }).compile();

        service = module.get<PatientService>(PatientService);
        repo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
    });

    describe('create()', () => {
        it('Should create and save a patient', async () => {
            const dto: CreatePatientDto = {
                name: 'Luna',
                dateOfBirth: '1995-07-14',
            };

            const mockPatient = {
                id: 1,
                name: dto.name,
                dateOfBirth: new Date(dto.dateOfBirth),
            };

            (repo.create as jest.Mock).mockReturnValue(mockPatient);
            (repo.save as jest.Mock).mockResolvedValue(mockPatient);

            const result = await service.create(dto);

            expect(repo.create).toHaveBeenCalledWith({
                name: dto.name,
                dateOfBirth: new Date(dto.dateOfBirth),
            });

            expect(repo.save).toHaveBeenCalledWith(mockPatient);
            expect(result).toEqual(mockPatient);
        });
    });

    describe('findAll()', () => {
        it('Should return all patients', async () => {
            const patients = [{ id: 1, name: 'Bob' }];
            (repo.find as jest.Mock).mockResolvedValue(patients);

            const result = await service.findAll();

            expect(result).toEqual(patients);
            expect(repo.find).toHaveBeenCalled();
        });
    });

    describe('findOne()', () => {
        it('Should return one patient by ID', async () => {
            const patient = { id: 1, name: 'Charlie' };
            (repo.findOne as jest.Mock).mockResolvedValue(patient);

            const result = await service.findOne(1);

            expect(result).toEqual(patient);
            expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('Should throw NotFoundException if patient not found', async () => {
            (repo.findOne as jest.Mock).mockResolvedValue(null);

            await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update()', () => {
        it('Should update and return the patient', async () => {
            const dto: UpdatePatientDto = {
                name: 'Updated Name',
                dateOfBirth: '1990-01-01',
            };

            const existingPatient = {
                id: 1,
                name: 'Old Name',
                dateOfBirth: new Date('1980-01-01'),
            };

            (service.findOne as any) = jest.fn().mockResolvedValue(existingPatient);
            (repo.update as jest.Mock).mockResolvedValue({});
            (repo.findOne as jest.Mock).mockResolvedValue({ id: 1, ...dto });

            const result = await service.update(1, dto);

            expect(repo.update).toHaveBeenCalledWith(1, dto);
            expect(result).toEqual({ id: 1, ...dto });
        });
    });

    describe('remove()', () => {
        it('Should call delete after checking existence', async () => {
            (service.findOne as any) = jest.fn().mockResolvedValue({ id: 1 });
            (repo.delete as jest.Mock).mockResolvedValue({});

            await service.remove(1);

            expect(service.findOne).toHaveBeenCalledWith(1);
            expect(repo.delete).toHaveBeenCalledWith(1);
        });
    });
});
