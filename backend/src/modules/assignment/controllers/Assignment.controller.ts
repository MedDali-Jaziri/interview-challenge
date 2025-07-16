import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query } from '@nestjs/common';
import { AssignmentService } from '../services/assignment.service';
import { CreateAssignmentDto } from '../dtos/create-assignment.dto';
import { success } from 'src/utils/response.util';
import { UpdateAssignmentDto } from '../dtos/update-assignment.dto';
import { GetPatientDto } from 'src/modules/patient/dtos/get-patient.dto';

@Controller('assignment')
export class AssignmentController {

    constructor(private readonly assignmentService: AssignmentService) { }

    @HttpCode(HttpStatus.CREATED) // To Set HTTP protocol status HTTP 201 Created
    @Post("/create-assignment")

    // Handles the creation of new Assignment
    async create(@Body() createAssignmentDto: CreateAssignmentDto) {
        const data = await this.assignmentService.create(createAssignmentDto);
        return success(HttpStatus.CREATED, "Assignment Created Successfully", data);
    }

    @HttpCode(HttpStatus.OK)
    @Get("/assignment-list")
    // Retries a list of all assignments
    async findAll() {
        const data = await this.assignmentService.findAll();
        return success(HttpStatus.OK, "Assignments list retrieved successfully", data);
    }

    @HttpCode(HttpStatus.OK)
    @Get("/assignment-details")
    // Retries a single assignment by their ID
    async findOne(@Query('id') id: number) {
        const data = await this.assignmentService.findOne(id);
        return success(HttpStatus.OK, "Assignment retrieved successfully", data);
    }

    @HttpCode(HttpStatus.OK)
    @Put("/assignment-update")
    // Update am existing assignment information by their ID
    async update(@Query('id') id: number, @Body() updateAssignmentDto: UpdateAssignmentDto) {
        const data = await this.assignmentService.update(id, updateAssignmentDto);
        return success(HttpStatus.OK, "Assignment Updated successfully", data);
    }

    @HttpCode(HttpStatus.NO_CONTENT) // It's possible to changed to be HttpStatus.OK but we need to check with the Project Requirement 
    @Delete("/assignment-remove")
    // Deletes a assignment by their ID
    async remove(@Query('id') id: number) {
        await this.assignmentService.remove(id);
        return success(HttpStatus.NO_CONTENT, "Assignment deleted successfully");
    }

    @HttpCode(HttpStatus.OK)
    @Get("/remaining-days")
    // Retrieves the remaining days for each assignment
    async getRemainingDays() {
        const data = await this.assignmentService.getRemainingDays();
        return success(HttpStatus.OK, "Remaining treatment days retrieved successfully", data);
    }

    /**
 * This utility method was not part of the original feature list,
 * but was added to support my custom design requirement.
 * It allows retrieving remaining treatment days for a specific patient
 * by providing their name and date of birth.
 */
    @HttpCode(HttpStatus.OK)
    @Post("/patient-remaining-days")
    async getPatientRemainingDays(@Body() getPatientDto: GetPatientDto) {
        const data = await this.assignmentService.GetPatientRemaningDays(getPatientDto);
        return success(HttpStatus.OK, `Remaining treatment days of ${getPatientDto.name} retrieved with successful`, data);
    }


}
