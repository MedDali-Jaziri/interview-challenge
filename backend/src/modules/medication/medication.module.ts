import { Module } from '@nestjs/common';
import { MedicationController } from './controllers/medication.controller';
import { MedicationService } from './services/medication.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medication } from './entities/medication.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medication])],
  controllers: [MedicationController],
  providers: [MedicationService]
})
export class MedicationModule {}
