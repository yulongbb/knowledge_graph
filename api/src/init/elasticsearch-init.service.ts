import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ElasticsearchInitService {
  private readonly logger = new Logger(ElasticsearchInitService.name);
  private readonly client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get<string>('ELASTICSEARCH_NODE'),
      auth: {
        username: this.configService.get<string>('ELASTICSEARCH_USER'),
        password: this.configService.get<string>('ELASTICSEARCH_PASSWORD'),
      },
    });
  }

  async initIndices() {
    // entity 索引定义，直接从 README.md 复制
    const entityIndex = {
      name: 'entity',
      body: {
        aliases: {},
        mappings: {
          properties: {
            _key: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword', ignore_above: 256 },
              },
            },
            aliases: {
              properties: {
                zh: {
                  properties: {
                    language: {
                      type: 'text',
                      fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                    },
                    value: {
                      type: 'text',
                      fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                    },
                  },
                },
              },
            },
            descriptions: {
              properties: {
                zh: {
                  properties: {
                    language: {
                      type: 'text',
                      fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                    },
                    value: {
                      type: 'text',
                      fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                    },
                  },
                },
              },
            },
            documents: {
              properties: {
                description: {
                  type: 'text',
                  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                },
                label: {
                  type: 'text',
                  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                },
                thumbnail: {
                  type: 'text',
                  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                },
                url: {
                  type: 'text',
                  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                },
              },
            },
            id: {
              type: 'text',
              fields: { keyword: { type: 'keyword', ignore_above: 256 } },
            },
            images: {
              type: 'text',
              fields: { keyword: { type: 'keyword', ignore_above: 256 } },
            },
            items: {
              type: 'text',
              fields: { keyword: { type: 'keyword', ignore_above: 256 } },
            },
            labels: {
              properties: {
                zh: {
                  properties: {
                    language: {
                      type: 'text',
                      fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                    },
                    value: {
                      type: 'text',
                      fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                    },
                  },
                },
              },
            },
            mod: { type: 'date' },
            modified: { type: 'date' },
            namespace: {
              type: 'text',
              fields: { keyword: { type: 'keyword', ignore_above: 256 } },
            },
            properties: {
              properties: {
                isNew: { type: 'boolean' },
                property: {
                  type: 'text',
                  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                },
                value: {
                  type: 'text',
                  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                },
              },
            },
            tags: {
              type: 'text',
              fields: { keyword: { type: 'keyword', ignore_above: 256 } },
            },
            template: {
              type: 'text',
              fields: { keyword: { type: 'keyword', ignore_above: 256 } },
            },
            type: {
              type: 'text',
              fields: { keyword: { type: 'keyword', ignore_above: 256 } },
            },
            videos: {
              properties: {
                description: {
                  type: 'text',
                  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                },
                label: {
                  type: 'text',
                  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                },
                thumbnail: {
                  type: 'text',
                  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                },
                url: {
                  type: 'text',
                  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
                },
              },
            },
          },
        },
        settings: {
          index: {
            routing: {
              allocation: {
                include: {
                  _tier_preference: 'data_content',
                },
              },
            },
            number_of_shards: '1',
            number_of_replicas: '1',
          },
        },
      },
    };

    try {
      const exists = await this.client.indices.exists({ index: entityIndex.name });
      if (!exists) {
        await this.client.indices.create({
          index: entityIndex.name,
          body: entityIndex.body as any,
        });
        this.logger.log(`Created index: ${entityIndex.name} successfully.`);
        console.log(`[Elasticsearch] 索引 ${entityIndex.name} 创建成功`);
      } else {
        this.logger.log(`Index already exists: ${entityIndex.name}`);
        console.log(`[Elasticsearch] 索引 ${entityIndex.name} 已存在`);
      }
    } catch (error) {
      this.logger.error(`Failed to create index: ${entityIndex.name}`, error);
      console.error(`[Elasticsearch] 索引 ${entityIndex.name} 创建失败:`, error?.meta?.body?.error || error);
    }
  }
}
