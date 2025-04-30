import { Injectable } from '@nestjs/common';
import * as nodejieba from 'nodejieba';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 自然语言处理服务
 * 提供中文分词和实体识别功能
 */
@Injectable()
export class NLPService {
    private customWordSet: Array<any>; // 存储自定义词库

    constructor() {
        nodejieba.load();  // 加载默认词典
    }

    /**
     * 加载自定义词汇字典
     * 从output.txt文件中读取知识实体作为自定义词典
     */
    private loadCustomDict() {
        const dictPath = path.join('output.txt');
   
        const data = fs.readFileSync(dictPath, 'utf-8');
        console.log(data);

        this.customWordSet = [];
    
        const lines = data.split('\n');
        console.log(lines);

        // 解析每行数据，格式为"id,word,namespace"
        lines.forEach(line => {
          if (line.trim()) {
            const parts = line.trim().split(',');
            this.customWordSet.push({
              id: parts[0].trim(), 
              word: parts[1].trim(),
              namespace: parts.length > 2 ? parts[2].trim() : 'default'
            });
            nodejieba.insertWord(parts[1].trim());  // 动态插入到jieba的词典
          }
        });
    }
    
    /**
     * 从文本中提取实体
     * @param text 输入文本
     * @param namespace 可选命名空间过滤
     * @returns 识别到的实体列表
     */
    extractEntities(text: string, namespace?: string): string[] {
        this.loadCustomDict();  // 加载自定义词典

        // 使用 nodejieba 进行分词
        const result = nodejieba.cut(text);
        console.log(this.customWordSet);
        
        // 过滤逻辑
        const filteredWords = this.customWordSet.filter(word => {
            // 按词匹配
            const wordMatch = result.filter(w => w == word.word).length > 0;
            
            // 如果指定了命名空间，则额外检查命名空间匹配
            const namespaceMatch = namespace ? 
                word.namespace === namespace : true;
                
            return wordMatch && namespaceMatch;
        });
        
        console.log(new Set(filteredWords));

        return filteredWords;
    }
}