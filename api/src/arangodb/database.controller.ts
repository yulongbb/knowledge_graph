import { Controller, Post, Body } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
    constructor(private readonly databaseService: DatabaseService) { }

    @Post('switch')
    switchDatabase(@Body('databaseName') databaseName: string) {
        this.databaseService.switchDatabase(databaseName);
        return { message: `Switched to database ${databaseName}` };
    }
}