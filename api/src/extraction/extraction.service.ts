import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Script } from './entities/script.entity';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as util from 'util';

const execPromise = util.promisify(exec);
const writeFilePromise = util.promisify(fs.writeFile);
const unlinkPromise = util.promisify(fs.unlink);

@Injectable()
export class ExtractionService extends XRepositoryService<Script, XQuery> {
    constructor(
        @InjectRepository(Script)
        public readonly scriptRepository: Repository<Script>,
        private dataSource: DataSource
    ) {
        super(scriptRepository, dataSource);
    }

    async create(createScriptDto: Partial<Script>): Promise<Script> {
        const script = this.scriptRepository.create(createScriptDto as Script);
        return await this.scriptRepository.save(script);
    }

    async findAll(): Promise<Script[]> {
        return await this.scriptRepository.find();
    }

    async findAllByType(type: string): Promise<Script[]> {
        return await this.scriptRepository.find({
            where: { type }
        });
    }

    async findOne(id: string): Promise<Script> {
        const script = await this.scriptRepository.findOne({ where: { id } });
        if (!script) {
            throw new NotFoundException(`Script with ID ${id} not found`);
        }
        return script;
    }

    async update(id: string, updateScriptDto: any): Promise<Script> {
        const script = await this.findOne(id);
        Object.assign(script, updateScriptDto);
        return await this.scriptRepository.save(script);
    }

    async remove(id: string): Promise<void> {
        const result = await this.scriptRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Script with ID ${id} not found`);
        }
    }

    async testScript(testData: any): Promise<any> {
        const { script, sampleData } = testData;
        const startTime = Date.now();

        try {
            let result;

            switch (script.language) {
                case 'javascript':
                    result = await this.testJavaScriptScript(script.content, sampleData);
                    break;
                case 'python':
                    result = await this.testPythonScript(script.content, sampleData);
                    break;
                case 'sql':
                    result = await this.testSqlScript(script.content, sampleData);
                    break;
                default:
                    throw new BadRequestException('Unsupported script language');
            }

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                output: result,
                executionTime,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'An error occurred during script execution',
                executionTime: Date.now() - startTime,
            };
        }
    }

    private async testJavaScriptScript(scriptContent: string, sampleData: any): Promise<any> {
        // Create a temporary JS file
        const tempFile = path.join(os.tmpdir(), `script_${Date.now()}.js`);

        const scriptWithData = `
      const sampleData = ${JSON.stringify(sampleData)};
      
      // User script begins
      ${scriptContent}
      // User script ends
      
      // Print the result to stdout
      console.log(JSON.stringify(processData(sampleData)));
    `;

        await writeFilePromise(tempFile, scriptWithData);

        try {
            const { stdout } = await execPromise(`node ${tempFile}`);
            return JSON.parse(stdout);
        } finally {
            // Clean up the temporary file
            await unlinkPromise(tempFile).catch(() => { });
        }
    }

    private async testPythonScript(scriptContent: string, sampleData: any): Promise<any> {
        // Create temporary Python file
        const tempFile = path.join(os.tmpdir(), `script_${Date.now()}.py`);

        const scriptWithData = `
import json
import sys

sample_data = json.loads('''${JSON.stringify(sampleData)}''')

# User script begins
${scriptContent}
# User script ends

# Print the result to stdout
print(json.dumps(process_data(sample_data)))
`;

        await writeFilePromise(tempFile, scriptWithData);

        try {
            const { stdout } = await execPromise(`python ${tempFile}`);
            return JSON.parse(stdout);
        } finally {
            // Clean up the temporary file
            await unlinkPromise(tempFile).catch(() => { });
        }
    }

    private async testSqlScript(scriptContent: string, sampleData: any): Promise<any> {
        // SQL execution is more complex as it requires a database connection
        // For demo purposes, we'll just return a simulated result
        return {
            message: "SQL script testing requires database connection. This is a simulated result.",
            scriptLength: scriptContent.length,
            dataColumns: Object.keys(sampleData),
        };
    }

    async getScriptTypes(): Promise<any[]> {
        return [
            { value: 'extraction', label: '数据抽取', description: '从原始数据中提取结构化信息' },
            { value: 'transformation', label: '数据转换', description: '将数据从一种格式转换为另一种格式' },
            { value: 'cleaning', label: '数据清洗', description: '清理和规范化数据' },
        ];
    }
}
