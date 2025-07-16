import { Module } from '@nestjs/common';
import { AssignmentController } from './controllers/Assignment.controller';
import { AssignmentService } from './services/assignment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment])],
  controllers: [AssignmentController],
  providers: [AssignmentService]
})
export class AssignmentModule { }
