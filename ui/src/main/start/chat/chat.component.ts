import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { faPaperPlane, faUser, faRobot, faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { marked, MarkedOptions } from 'marked';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';

// Register languages you need
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageInput') messageInput: ElementRef | undefined;
  @ViewChild('messagesContainer') messagesContainer: ElementRef | undefined;
  messages: { text: string, sender: string, avatar: any }[] = [];
  userInput: string = '';
  faPaperPlane = faPaperPlane;
  faUser = faUser;
  faRobot = faRobot;
  faTrash = faTrash;
  faEdit = faEdit;
  faPlus = faPlus;
  sessions: { id: number, name: string }[] = [];
  selectedSession: number | null = null;
  apiKey: string = ''; // Replace with your actual API key

  constructor(private http: HttpClient) {
    marked.setOptions({
      highlight: (code: string, lang: string) => {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(lang, code).value;
        }
        return hljs.highlightAuto(code).value;
      }
    } as MarkedOptions);
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadSessions(): void {
    this.http.get<{ id: number, name: string }[]>('/api/sessions')
      .subscribe(sessions => {
        this.sessions = sessions;
        if (sessions.length > 0) {
          this.selectSession(sessions[0].id);
        }
      });
  }

  selectSession(sessionId: number): void {
    this.selectedSession = sessionId;
    this.loadMessages(sessionId);
  }

  loadMessages(sessionId: number): void {
    this.http.get<{ text: string, sender: string, avatar: any }[]>(`/api/sessions/${sessionId}/messages`)
      .subscribe(messages => {
        console.log(messages);
        this.messages = messages;
      });
  }

  sendMessage(): void {
    if (this.userInput.trim() && this.selectedSession !== null) {
      const userMessage = this.userInput;
      this.messages.push({ text: userMessage, sender: 'user', avatar: this.faUser });
      this.userInput = '';
      this.messageInput?.nativeElement.focus();
      this.saveMessage(userMessage, 'user');
      this.getAIResponse(userMessage);
    }
  }

  private saveMessage(text: string, sender: string): void {
    if (this.selectedSession !== null) {
      this.http.post(`/api/sessions/${this.selectedSession}/messages`, { text, sender })
        .subscribe();
    }
  }

  private getAIResponse(userMessage: string): void {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const body = {
      model: 'qwen-plus',
      messages: this.messages.map(message => ({
        role: message.sender === 'user' ? 'user' : 'system',
        content: message.text
      })),
      stream: true
    };

    fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
    .then(response => response.body)
    .then(body => {
      const reader = body?.getReader(); 
      let aiMessage = '';
      this.messages.push({ text: aiMessage, sender: 'ai', avatar: this.faRobot });

      const read = () => {
        reader?.read().then(({ done, value }) => {
          if (done) {
            this.saveMessage(aiMessage, 'ai');
            return;
          }
          const text = new TextDecoder().decode(value);
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              if (line === 'data: [DONE]') {
                this.saveMessage(aiMessage, 'ai');
                return;
              }
              if (line.startsWith('data: ')) {
                const json = JSON.parse(line.replace(/^data: /, ''));
                if (json.choices[0].delta.content) {
                  aiMessage += json.choices[0].delta.content;
                  this.messages[this.messages.length - 1].text = aiMessage;
                  this.messages = [...this.messages]; // Trigger change detection
                }
              }
            }
          }
          read();
        });
      };
      read();
    })
    .catch(error => {
      console.error('Error fetching AI response:', error);
    });
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer?.nativeElement.scrollTo({
        top: this.messagesContainer.nativeElement.scrollHeight,
        behavior: 'smooth'
      });
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }

  addSession(): void {
    this.http.post<{ id: number, name: string }>('/api/sessions', { name: `Session ${this.sessions.length + 1}` })
      .subscribe(session => {
        this.sessions.push(session);
        this.selectSession(session.id);
      });
  }

  deleteSession(sessionId: number): void {
    this.http.delete(`/api/sessions/${sessionId}`)
      .subscribe(() => {
        this.sessions = this.sessions.filter(session => session.id !== sessionId);
        if (this.selectedSession === sessionId) {
          this.selectedSession = this.sessions.length > 0 ? this.sessions[0].id : null;
          if (this.selectedSession !== null) {
            this.loadMessages(this.selectedSession);
          } else {
            this.messages = [];
          }
        }
      });
  }

  updateSession(sessionId: number): void {
    const sessionName = `Session ${sessionId}`;
    this.http.put(`/api/sessions/${sessionId}`, { name: sessionName })
      .subscribe(() => {
        const session = this.sessions.find(session => session.id === sessionId);
        if (session) {
          session.name = sessionName;
        }
      });
  }

  parseMarkdown(text: string): any {
    return marked(text);
  }
}