import { IsDateString, IsInt, IsNotEmpty, Min } from "class-validator";

export class CreateAssignmentDto {

    @IsInt({ message: 'Patient Id must be an integer' })
    @IsNotEmpty({message: 'Patient is required'})
    patientId: number;

    @IsInt({ message: 'Medication Id must be an integer' })
    @IsNotEmpty({message: 'Medication is required'})
    medicationId: number;

    // To Check if the input is a valid ISO date (like 1997-08-20)
    @IsDateString({}, {message: "Date Of birth needs to be a valid ISO date string"}) 
    @IsNotEmpty({message: 'Date of birth is required'})
    startDate: Date;

    @IsInt({ message: 'Number Of Days must be an integer' })
    //To prevent invalid or meaningless input like (0, -6)
    @Min(1, { message: 'Number Of Days must be at least 1' })
    @IsNotEmpty({message: 'Number Of Days is required'})
    numberOfDays: number;
}
