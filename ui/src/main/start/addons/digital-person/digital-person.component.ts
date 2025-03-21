import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { DigitalPersonService } from './digital-person.service';
import { faPaperPlane, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { marked } from 'marked';
import { VirtualCharacterComponent } from './virtual-character/virtual-character.component';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-digital-person',
  templateUrl: './digital-person.component.html',
  styleUrls: ['./digital-person.component.scss']
})
export class DigitalPersonComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('virtualCharacter') virtualCharacter!: VirtualCharacterComponent;
  
  messages: ChatMessage[] = [];
  currentMessage: string = '';
  faPaperPlane = faPaperPlane;
  faPause = faPause;
  isAnswering: boolean = false;
  private reader: ReadableStreamDefaultReader | undefined;

  // 添加模型选择相关属性
  models: any[] = [
    { name: 'DeepSeek-R1', api: 'http://10.117.1.238:8106/chat/completions' }, 
    { name: '通义千问', api: 'http://10.117.1.238:8100/chat/completions' }
  ];
  selectedModel: any = this.models[0].api;

  constructor(private digitalPersonService: DigitalPersonService) {
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  ngOnInit(): void {
    this.messages = [
      { content: '你好！我是你的数字助手，有什么可以帮你的吗？', isUser: false, timestamp: new Date() }
    ];
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) { }
  }

  async sendMessage() {
    if (!this.currentMessage.trim() || this.isAnswering) return;

    this.isAnswering = true;
    
    // 确保在回答时播放动画
    if (this.virtualCharacter) {
      this.virtualCharacter.playAnimation();
    }

    const userMessage = this.currentMessage.trim();
    this.messages.push({
      content: userMessage,
      isUser: true,
      timestamp: new Date()
    });

    this.currentMessage = '';
    this.isAnswering = true;

    try {
      // 移除Authorization header，因为不需要
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      };

      const body = {
        model: 'DeepSeek-R1-Distill-Qwen-14B',
        messages: this.messages.map(message => ({
          role: message.isUser ? 'user' : 'assistant',  // 修改system为assistant
          content: message.content
        })),
        stream: true
      };

      console.log('Sending request to:', this.selectedModel);
      console.log('Request body:', body);

      const response = await fetch(this.selectedModel, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      this.reader = reader;
      
      let botMessage = '';
      this.messages.push({
        content: botMessage,
        isUser: false,
        timestamp: new Date()
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.choices?.[0]?.delta?.content) {
                botMessage += data.choices[0].delta.content;
                this.messages[this.messages.length - 1].content = botMessage;
              }
            } catch (e) {
              console.error('Failed to parse line:', line, e);
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      // 提供更具体的错误信息
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.messages.push({
        content: `抱歉，发生了错误：${errorMessage}`,
        isUser: false,
        timestamp: new Date()
      });
    } finally {
      this.isAnswering = false;
      this.reader = undefined;
    }
  }

  stopResponse(): void {
    if (this.reader) {
      console.log('Force stopping animation');
      this.reader.cancel();
      this.isAnswering = false;
      this.reader = undefined;
    }
  }

  changeModel(event: any): void {
    this.selectedModel = event.target.value;
    this.messages = [
      { content: '你好！我是你的数字助手，有什么可以帮你的吗？', isUser: false, timestamp: new Date() }
    ];
  }

  parseMarkdown(text: string): string {
    if (!text) return '';
    return marked.parse(text) as string;
  }
}
