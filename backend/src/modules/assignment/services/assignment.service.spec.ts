import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentService } from './assignment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from '../entities/assignment.entity';
import { Repository } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Medication } from '../../medication/entities/medication.entity';
import { NotFoundException } from '@nestjs/common';
import { GetPatientDto } from '../../patient/dtos/get-patient.dto';
import { CreateAssignmentDto } from '../dtos/create-assignment.dto';

describe('AssignmentService - CRUD Test', () => {
    let service: AssignmentService;
    let repo: Repository<Assignment>;
    let managerMock: any;

    beforeEach(async () => {
        managerMock = {
            findOne: jest.fn()
        };

        const repoMock = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            manager: managerMock,

        }
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AssignmentService,
                {
                    provide: getRepositoryToken(Assignment),
                    useValue: repoMock
                },
            ],
        }).compile();

        service = module.get<AssignmentService>(AssignmentService);
        repo = module.get<Repository<Assignment>>(getRepositoryToken(Assignment));
    });

    describe('create()', () => {
        it('Should create a new assignment', async () => {
            const dto: CreateAssignmentDto = {
                patientId: 1,
                medicationId: 2,
                startDate: new Date(),
                numberOfDays: 7,
            };

            const patient = { id: 1, name: 'Luna' } as Patient;
            const medication = { id: 2, name: 'Paracetamol' } as Medication;

            managerMock.findOne
                .mockResolvedValueOnce(patient)
                .mockResolvedValueOnce(medication);

            const savedAssignment = {
                id: 100,
                ...dto,
                patient,
                medication,
            };

            repo.save = jest.fn().mockResolvedValue(savedAssignment);

            const result = await service.create(dto);

            expect(result).toEqual(savedAssignment);
        });

        it('Should throw if patient not found', async () => {
            managerMock.findOne.mockResolvedValueOnce(null);
            const dto: CreateAssignmentDto = {
                patientId: 1,
                medicationId: 2,
                startDate: new Date(),
                numberOfDays: 7,
            };
            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });

        it('Should throw if medication not found', async () => {
            const patient = { id: 1, name: 'John' } as Patient;
            managerMock.findOne
                .mockResolvedValueOnce(patient)
                .mockResolvedValueOnce(null);

            const dto: CreateAssignmentDto = {
                patientId: 1,
                medicationId: 2,
                startDate: new Date(),
                numberOfDays: 7,
            };
            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll()', () => {
        it('Should return all assignments with relations', async () => {
            const mockData = [{ id: 1, patient: {}, medication: {} }];
            repo.find = jest.fn().mockResolvedValue(mockData);
            const result = await service.findAll();
            expect(result).toEqual(mockData);
        });
    });

    describe('findOne()', () => {
        it('Should return one assignment by id', async () => {
            const mockAssignment = { id: 1, patient: {}, medication: {} };
            repo.findOne = jest.fn().mockResolvedValue(mockAssignment);
            const result = await service.findOne(1);
            expect(result).toEqual(mockAssignment);
        });

        it('Should throw NotFoundException if assignment not found', async () => {
            repo.findOne = jest.fn().mockResolvedValue(null);
            await expect(service.findOne(123)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove()', () => {
        it('Should call delete after checking existence', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as Assignment);
            repo.delete = jest.fn();

            await service.remove(1);

            expect(service.findOne).toHaveBeenCalledWith(1);
            expect(repo.delete).toHaveBeenCalledWith(1);
        });
    });

    describe('getRemainingDays()', () => {
        it('Should return correct remaining days', async () => {
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 4); // 4 days ago

            const assignments = [
                {
                    id: 1,
                    startDate,
                    numberOfDays: 3,
                    patient: { name: 'Patient 1' },
                    medication: { name: 'Ibuprofen' },
                },
            ];

            repo.find = jest.fn().mockResolvedValue(assignments as Assignment[]);

            const result = await service.getRemainingDays();

            expect(result).toEqual([
                {
                    "Assignment Id: ": 1,
                    "Patient Name: ": 'Patient 1',
                    "Medication Name: ": 'Ibuprofen',
                    "Remaining Days: ": 0,
                },
            ]);
        });
    });

    describe('GetPatientRemaningDays()', () => {
        it('Should return remaining days for given patient', async () => {
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 3); // 3 days ago

            const dto: GetPatientDto = {
                name: 'John Doe',
                dateOfBirth: '2000-01-01',
            };

            const assignments = [
                {
                    id: 10,
                    startDate,
                    numberOfDays: 5,
                    patient: { name: 'John Doe' },
                    medication: { name: 'Panadol' },
                },
            ];

            repo.find = jest.fn().mockResolvedValue(assignments as Assignment[]);

            const result = await service.GetPatientRemaningDays(dto);

            expect(result).toEqual([
                {
                    "Assignment Id: ": 10,
                    "Patient Name: ": 'John Doe',
                    "Medication Name :": 'Panadol',
                    "Remaining Days: ": 2,
                },
            ]);
        });
    });

});
