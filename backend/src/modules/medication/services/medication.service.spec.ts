import { Test, TestingModule } from '@nestjs/testing';
import { MedicationService } from './medication.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Medication } from '../entities/medication.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateMedicationDto } from '../dtos/create-medication.dto';
import { UpdateMedicationDto } from '../dtos/update-medication.dto';

describe('MedicationService - CRUD Test', () => {
    let service: MedicationService;
    let repo: Repository<Medication>;

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
                MedicationService,
                {
                    provide: getRepositoryToken(Medication),
                    useValue: repoMock,
                },
            ],
        }).compile();

        service = module.get<MedicationService>(MedicationService);
        repo = module.get<Repository<Medication>>(getRepositoryToken(Medication));
    });

    describe('create()', () => {
        it('Should create and save a medication', async () => {
            const dto: CreateMedicationDto = {
                name: 'Paracetamol',
                dosage: '500mg',
                frequency: '3 times a day',
            };

            const mockEntity = { id: 1, ...dto };

            (repo.create as jest.Mock).mockReturnValue(mockEntity);
            (repo.save as jest.Mock).mockResolvedValue(mockEntity);

            const result = await service.create(dto);

            expect(repo.create).toHaveBeenCalledWith(dto);
            expect(repo.save).toHaveBeenCalledWith(mockEntity);
            expect(result).toEqual(mockEntity);
        });
    });

    describe('findAll()', () => {
        it('Should return all medications', async () => {
            const meds = [{ id: 1, name: 'Ibuprofen' }];
            (repo.find as jest.Mock).mockResolvedValue(meds);

            const result = await service.findAll();

            expect(result).toEqual(meds);
            expect(repo.find).toHaveBeenCalled();
        });
    });

    describe('findOne()', () => {
        it('Should return a medication by ID', async () => {
            const med = { id: 1, name: 'Aspirin' };
            (repo.findOne as jest.Mock).mockResolvedValue(med);

            const result = await service.findOne(1);

            expect(result).toEqual(med);
            expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('Should throw NotFoundException if not found', async () => {
            (repo.findOne as jest.Mock).mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update()', () => {
        it('Should update and return the medication', async () => {
            const existing = { id: 1, name: 'OldName' };
            const dto: UpdateMedicationDto = {
                name: 'NewName',
                dosage: '500mg',
                frequency: '2 times a day',
            };

            (service.findOne as any) = jest.fn().mockResolvedValue(existing);
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
