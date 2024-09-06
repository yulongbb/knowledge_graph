import { Injectable } from '@nestjs/common';
import * as nodejieba from 'nodejieba';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class NLPService {
    private customWordSet: Array<any>;

    constructor() {
        nodejieba.load();  // 加载默认词典
    }

    // 加载自定义词汇
    private loadCustomDict() {
        const dictPath = path.join('D:\\workspace\\knowledge_graph\\api\\src\\es\\output.txt');
   
        const data = fs.readFileSync(dictPath, 'utf-8');
        console.log(data);

        this.customWordSet = [];
    
        const lines = data.split('\n');
        console.log(lines);

        lines.forEach(line => {
          this.customWordSet.push({id: line.trim().split(',')[0].trim(), word:line.trim().split(',')[1].trim()});
          nodejieba.insertWord(line.trim().split(',')[1].trim());  // 动态插入到jieba的词典
        
        });
    

      
    }
    extractEntities(text: string): string[] {
        this.loadCustomDict();  // 加载自定义词典

        // 使用 nodejieba 进行分词
        const result = nodejieba.cut(text);
        console.log(this.customWordSet);
        // 过滤掉不在自定义词库中的词汇
        const filteredWords =  this.customWordSet.filter(word => result.filter(w=> w == word.word).length>0);
        console.log(new Set(filteredWords));

        return filteredWords;
    }
}