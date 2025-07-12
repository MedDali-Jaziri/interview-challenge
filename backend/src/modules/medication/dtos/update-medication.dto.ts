import { IsNotEmpty, IsString } from "class-validator";

export class UpdateMedicationDto {

    @IsString({message: "Name must be String Value"})
    @IsNotEmpty({message: "Name is required"})
    name: string;

    @IsString({message: "Dosage must be String Value"})
    @IsNotEmpty({message: "Dosage is required filed"})
    dosage: string;

    @IsString({message: "Frequency must be String Value"})
    @IsNotEmpty({message: "Frequency is required filed"})
    frequency: string;
}
