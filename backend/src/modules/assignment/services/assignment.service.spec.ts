import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentService } from './assignment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from '../entities/assignment.entity';
import { Repository } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Medication } from '../../medication/entities/medication.entity';

describe('AssignmentService - getRemainingDays', () => {
    let service: AssignmentService;
    let repo: Repository<Assignment>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AssignmentService,
                {
                    provide: getRepositoryToken(Assignment),
                    useValue: {
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AssignmentService>(AssignmentService);
        repo = module.get<Repository<Assignment>>(getRepositoryToken(Assignment));
    });

    it('should return correct remaining days for each assignment', async () => {
        const today = new Date();
        const fourDaysAgo = new Date(today);
        fourDaysAgo.setDate(today.getDate() - 4);

        const firstPatientAssignments = [
            {
                id: 1,
                startDate: fourDaysAgo,
                numberOfDays: 3,
                patient: { name: 'Patient 1' } as Patient,
                medication: { name: 'Ibuprofen' } as Medication,
            },
        ];

        jest.spyOn(repo, 'find').mockResolvedValueOnce(firstPatientAssignments as Assignment[]);

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
