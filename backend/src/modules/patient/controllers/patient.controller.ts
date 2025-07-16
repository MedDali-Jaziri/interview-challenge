import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { PatientService } from '../services/patient.service';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { success } from 'src/utils/response.util';
import { UpdatePatientDto } from '../dtos/update-patient.dto';

@Controller('patient')
export class PatientController {
    constructor (private readonly patientService: PatientService){}
 
    @HttpCode(HttpStatus.CREATED) // To Set HTTP protocol status HTTP 201 Created
    @Post("/create-patient")
    // Handles the creation of new patient
    async create(@Body() createPatientDto: CreatePatientDto){
        const data = await this.patientService.create(createPatientDto);
        return success(HttpStatus.CREATED,"Patient Created Successfully", data);
    }

    @HttpCode(HttpStatus.OK)
    @Get("/patient-list")
    // Retries a list of all patients
    async findAll(){
        const data = await this.patientService.findAll();
        return success(HttpStatus.OK, "Patients list retrieved successfully", data);
    }

    @HttpCode(HttpStatus.OK)
    @Get("/patient-details")
    // Retries a single patient by their ID
    async findOne(@Query('id') id: number){        
        const data = await this.patientService.findOne(id);
        return success(HttpStatus.OK, "Patient retrieved successfully", data);
    }

    @HttpCode(HttpStatus.OK)
    @Put("/patient-update")
    // Update am existing patient information by their ID
    async update(@Query('id') id: number, @Body() updatePatientDto: UpdatePatientDto){
        const data = await this.patientService.update(id, updatePatientDto);
        return success(HttpStatus.OK, "Patient Updated successfully", data);
    }

    @HttpCode(HttpStatus.NO_CONTENT) // It's possible to changed to be HttpStatus.OK but we need to check with the Project Requirement 
    @Delete("/patient-remove")
    // Deletes a patient by their ID
    async remove(@Query('id') id: number){
        await this.patientService.remove(id);
        return success(HttpStatus.NO_CONTENT, "Patient deleted successfully");
    }
}