import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query } from '@nestjs/common';
import { MedicationService } from '../services/medication.service';
import { CreateMedicationDto } from '../dtos/create-medication.dto';
import { success } from 'src/utils/response.util';
import { UpdateMedicationDto } from '../dtos/update-medication.dto';

@Controller('medication')
export class MedicationController {
    constructor(private readonly medicationService: MedicationService) { }

    @HttpCode(HttpStatus.CREATED) // To Set HTTP protocol status HTTP 201 Created
    @Post("/create-medication")
    // Handles the creation of new medication
    async create(@Body() createMedicationDto: CreateMedicationDto) {
        const data = await this.medicationService.create(createMedicationDto);
        return success(HttpStatus.CREATED, "Medication Created Successfully", data);
    }

    @HttpCode(HttpStatus.OK)
    @Get("/medication-list")
    // Retries a list of all medications
    async findAll() {
        const data = await this.medicationService.findAll();
        return success(HttpStatus.OK, "Medications list retrieved successfully", data);
    }

    @HttpCode(HttpStatus.OK)
    @Get("/medication-details")
    // Retries a single medication by their ID
    async findOne(@Query('id') id: number) {
        const data = await this.medicationService.findOne(id);
        return success(HttpStatus.OK, "Medication retrieved successfully", data);
    }

    @HttpCode(HttpStatus.OK)
    @Put("/medication-update")
    // Update am existing medication information by their ID
    async update(@Query('id') id: number, @Body() updateMedicationDto: UpdateMedicationDto) {
        const data = await this.medicationService.update(id, updateMedicationDto);
        return success(HttpStatus.OK, "Medication Updated successfully", data);
    }

    @HttpCode(HttpStatus.NO_CONTENT) // It's possible to changed to be HttpStatus.OK but we need to check with the Project Requirement 
    @Delete("/medication-remove")
    // Deletes a medication by their ID
    async remove(@Query('id') id: number) {
        await this.medicationService.remove(id);
        return success(HttpStatus.NO_CONTENT, "Medication deleted successfully");
    }
}
