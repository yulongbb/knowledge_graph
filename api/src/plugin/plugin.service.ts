import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from './entities/plugin.entity';
import { PluginMessage } from './entities/plugin-message.entity';

@Injectable()
export class PluginService {
    constructor(
        @InjectRepository(Plugin)
        private pluginRepository: Repository<Plugin>,
        @InjectRepository(PluginMessage)
        private pluginMessageRepository: Repository<PluginMessage>,
        private httpService: HttpService,
    ) { }

    findAllPlugins(): Promise<Plugin[]> {
        return this.pluginRepository.find();
    }

    findPluginById(id: number): Promise<Plugin> {
        return this.pluginRepository.findOne({ where: { id } });
    }

    createPlugin(plugin: Plugin): Promise<Plugin> {
        return this.pluginRepository.save(plugin);
    }

    async updatePlugin(id: number, plugin: Plugin): Promise<void> {
        await this.pluginRepository.update(id, plugin);
    }

    async deletePlugin(id: number): Promise<void> {
        await this.pluginRepository.delete(id);
    }

    async callModelApi(pluginId: number, messages: { text: string, sender: string }[]): Promise<any> {
        const plugin = await this.findPluginById(pluginId);
        if (!plugin) {
            throw new Error('Plugin not found');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer YOUR_API_KEY`, // Replace with your actual API key
        };

        const body = {
            model: 'YOUR_MODEL_NAME', // Replace with your actual model name
            messages: [
                { role: 'system', content: plugin.prompt },
                ...messages.map(message => ({
                    role: message.sender === 'user' ? 'user' : 'system',
                    content: message.text,
                })),
            ],
            stream: true,
        };

        const response = await this.httpService.post('http://10.117.1.238:5013/chat/completions', body, { headers, responseType: 'stream' }).toPromise();
        return new Promise((resolve, reject) => {
            const chunks: any[] = [];
            response.data.on('data', (chunk: any) => chunks.push(chunk));
            response.data.on('end', async () => {
                const aiMessage = Buffer.concat(chunks).toString();
                console.log(aiMessage);
                const answerContent = aiMessage.split('\n').filter(line => line.startsWith('data: ')).map(line => {
                    try {
                        const json = JSON.parse(line.replace(/^data: /, ''));
                        return json.choices && json.choices[0].delta.content;
                    } catch (error) {
                        return '';
                    }
                }).join('');

                await this.pluginMessageRepository.save(messages.map(message => ({
                    text: message.text,
                    sender: message.sender,
                    pluginId: pluginId,
                })));
                await this.pluginMessageRepository.save({
                    text: answerContent,
                    sender: 'ai',
                    pluginId: pluginId,
                });
                resolve(aiMessage);
            });
            response.data.on('error', (err: any) => reject(err));
        });
    }

    async findAllMessages(pluginId: number): Promise<PluginMessage[]> {
        return this.pluginMessageRepository.find({ where: { pluginId } });
    }
}
