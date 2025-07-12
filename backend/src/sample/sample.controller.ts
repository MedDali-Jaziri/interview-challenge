import { Controller, Get, Post, Body } from '@nestjs/common';
import { SampleService } from './sample.service';

@Controller('sample')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Get("/sample-list")
  findAll() {
    return this.sampleService.findAll();
  }

  @Post("/create-sample")
  create(@Body('name') name: string) {
    return this.sampleService.create(name);
  }
}
