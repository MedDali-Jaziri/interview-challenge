import { IsDateString, IsNotEmpty, IsString,  } from "class-validator";

export class UpdatePatientDto {

    @IsString({message: "Name must be String Value"})
    @IsNotEmpty({message: "Name is required"})
    name: string;

    // To Check if the input is a valid ISO date (like 1997-08-20)
    @IsDateString({}, {message: "Date Of birth needs to be a valid ISO date string"}) 
    @IsNotEmpty({message: 'Date of birth is required'})
    dateOfBirth: string;
}
