import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleModule } from './sample/sample.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientModule } from './modules/patient/patient.module';
import { MedicationModule } from './modules/medication/medication.module';
import { AssignmentModule } from './modules/assignment/assignment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    SampleModule,
    PatientModule,
    MedicationModule,
    AssignmentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
