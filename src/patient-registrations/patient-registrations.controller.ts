import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody 
} from '@nestjs/swagger';
import { PatientRegistrationsService } from './patient-registrations.service.js';
import { CreatePatientRegistrationDto } from './dto/create-patient-registration.dto.js';
import { UpdatePatientRegistrationDto } from './dto/update-patient-registration.dto.js';
import { QueryPatientRegistrationDto } from './dto/query-patient-registration.dto.js';

@ApiTags('Patient Registrations')
@Controller('patient-registrations')
export class PatientRegistrationsController {
  constructor(private readonly patientRegistrationsService: PatientRegistrationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new patient',
    description: 'Registers a patient with demographic identity, body measurements, and blood pressure vitals. The registration timestamp is securely generated on the server.',
  })
  @ApiBody({ type: CreatePatientRegistrationDto })
  @ApiResponse({
    status: 201,
    description: 'Patient registration created successfully.',
    schema: {
      example: {
        _id: '673ee85fa9123b456c789012',
        patientIdentity: {
          name: 'Rajesh Varma',
          age: 42,
          gender: 'Male',
        },
        bodyMeasurements: {
          height: 172,
          weight: 68,
        },
        bloodPressureVitals: {
          systolic: 120,
          diastolic: 80,
        },
        registrationTimestamp: {
          date: '2026-11-21',
          time: '14:02:00',
        },
        createdAt: '2026-11-21T14:02:00.123Z',
        updatedAt: '2026-11-21T14:02:00.123Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed - Invalid input fields or missing required properties.',
  })
  create(@Body() createDto: CreatePatientRegistrationDto) {
    return this.patientRegistrationsService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all patient registrations (paginated)',
    description: 'Retrieves a paginated list of patient registrations sorted by creation date descending.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'List of patient registrations with pagination metadata.',
  })
  findAll(@Query() query: QueryPatientRegistrationDto) {
    return this.patientRegistrationsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a patient registration by ID',
    description: 'Retrieves a single patient registration record using its MongoDB ObjectId.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId hex string (24 characters)', example: '673ee85fa9123b456c789012' })
  @ApiResponse({ status: 200, description: 'Patient registration found.' })
  @ApiResponse({ status: 400, description: 'Invalid ObjectId format.' })
  @ApiResponse({ status: 404, description: 'Patient registration not found.' })
  findOne(@Param('id') id: string) {
    return this.patientRegistrationsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an existing patient registration',
    description: 'Updates specific patient identity, body measurements, or vitals fields for an existing record.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId hex string' })
  @ApiBody({ type: UpdatePatientRegistrationDto })
  @ApiResponse({ status: 200, description: 'Patient registration updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Patient registration not found.' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePatientRegistrationDto) {
    return this.patientRegistrationsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a patient registration',
    description: 'Deletes a patient registration record by ID from the MongoDB collection.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId hex string' })
  @ApiResponse({ status: 200, description: 'Patient registration deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid ObjectId format.' })
  @ApiResponse({ status: 404, description: 'Patient registration not found.' })
  remove(@Param('id') id: string) {
    return this.patientRegistrationsService.remove(id);
  }
}

