import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, Renderer2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { faPaperPlane, faUser, faRobot, faEllipsisV, faSave, faTimes, faPlus, faEdit, faTrash, faPencilSquare, faPause, faTentArrowLeftRight, faArrowLeft, faArrowRight, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { marked, MarkedOptions } from 'marked';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import { EntityService } from 'src/main/entity/entity.service';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { PropertyService } from 'src/main/ontology/property/property.service';
import { EsService } from '../home/es.service';
import { Router } from '@angular/router';

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
  faPause =faPause;
  faPuzzlePiece = faPuzzlePiece;
  faPencilSquare = faPencilSquare;
  faPaperPlane = faPaperPlane;
  faUser = faUser;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faRobot = faRobot;
  faEllipsisV = faEllipsisV;
  faSave = faSave;
  faEdit = faEdit;
  faTrash = faTrash;
  fa = faEdit;
  faTimes = faTimes;
  sessions: any = [];
  todaySessions: any[] = [];
  yesterdaySessions: any[] = [];
  earlierSessions: any[] = [];
  selectedSession: number | null = null;
  apiKey: string = ''; // Replace with your actual API key
  keyword: string = '';
  entities: any;
  sessionsVisible: boolean = false;
  knowledgesVisible: boolean = false;
  hots: any[] | undefined;
  models: string[] = ['DeepSeek-R1','通义千问-Max-Latest',  'Baichuan2-开源版-7B'];
  selectedModel: string = this.models[0];
  isAnswering: boolean = false;
  private reader: ReadableStreamDefaultReader | undefined;
  knowledgeResults: any;

  constructor(private http: HttpClient, private renderer: Renderer2,
    private service: EsService, private nodeService: EntityService,
    private ontologyService: OntologyService,
    public propertyService: PropertyService,
    private router: Router // Add Router to the constructor
  ) {
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
    this.queryKeyword('')
    this.service.getHot().subscribe((res: any) => {
      console.log(res); // 输出原始数据，便于调试
      this.hots = res; // 调用处理函数，将结果存入组件变量
    });

    this.renderer.listen('window', 'click', (e: Event) => {
      [...this.todaySessions, ...this.yesterdaySessions, ...this.earlierSessions].forEach((session: any) => {
        session.showMenu = false;
      });
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();

    // 使用新版highlight.js API
    document.querySelectorAll('pre code').forEach((block: any) => {
      hljs.highlightElement(block);
    });

  }


  loadSessions(): void {
    this.http.get<{ id: number, name: string, createdAt: string }[]>('/api/sessions')
      .subscribe(sessions => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        this.todaySessions = sessions.filter(session => {
          const sessionDate = new Date(session.createdAt);
          return sessionDate.toDateString() === today.toDateString();
        });

        this.yesterdaySessions = sessions.filter(session => {
          const sessionDate = new Date(session.createdAt);
          return sessionDate.toDateString() === yesterday.toDateString();
        });

        this.earlierSessions = sessions.filter(session => {
          const sessionDate = new Date(session.createdAt);
          return sessionDate < yesterday;
        });
      });
  }

  selectSession(sessionId: number): void {
    this.selectedSession = sessionId;
    this.loadMessages(sessionId);
  }

  loadMessages(sessionId: number): void {
    this.http.get<{ text: string, sender: string, avatar: any }[]>(`/api/sessions/${sessionId}/messages`)
      .subscribe(messages => {
        this.messages = messages;
      });
  }

  sendMessage(): void {
    if (this.userInput.trim()) {
      if (this.selectedSession === null) {
        this.createSessionAndSendMessage();
      } else {
        const userMessage = this.userInput;
        this.messages.push({ text: userMessage, sender: 'user', avatar: this.faUser });
        this.userInput = '';
        this.messageInput?.nativeElement.focus();
        this.saveMessage(userMessage, 'user');
        this.getAIResponse(userMessage);
        this.searchKnowledgeBase(userMessage); // Add this line to search the knowledge base
      }
    }
  }

  private createSessionAndSendMessage(): void {
    const userMessage = this.userInput;
    const truncatedTitle = userMessage.length > 20 ? userMessage.substring(0, 20).split(':')[0] + '...' : userMessage.split(':')[0];
    this.http.post<{ id: number, name: string, createdAt: string }>('/api/sessions', { name: truncatedTitle })
      .subscribe(session => {
        const sessionDate = new Date(session.createdAt);
        const today = new Date();
        if (sessionDate.toDateString() === today.toDateString()) {
          this.todaySessions.push(session);
        }
        this.selectedSession = session.id;
        this.messages.push({ text: userMessage, sender: 'user', avatar: this.faUser });
        this.userInput = '';
        this.messageInput?.nativeElement.focus();
        this.saveMessage(userMessage, 'user');
        this.getAIResponse(userMessage);
        this.searchKnowledgeBase(userMessage); // Add this line to search the knowledge base

      });
  }

  private saveMessage(text: string, sender: string): void {
    if (this.selectedSession !== null) {
      this.http.post(`/api/sessions/${this.selectedSession}/messages`, { text, sender })
        .subscribe(() => {
          console.log('Message saved:', text, sender);
          console.log(this.messages);
          if (sender === 'user' && this.messages.length <= 2) {
            const truncatedTitle = text.length > 20 ? text.substring(0, 20).split(':')[0] + '...' : text.split(':')[0];
            this.updateSession(this.selectedSession, truncatedTitle);
          }
        });
    }
  }

  private getAIResponse(userMessage: string): void {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const body = {
      // model: 'qwen-plus',
      model: 'DeepSeek-R1-Distill-Qwen-14B',
      messages: this.messages.map(message => ({
        role: message.sender === 'user' ? 'user' : 'system',
        content: message.text
      })),
      stream: true
    };

    // fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    fetch('http://10.117.1.238:5013/chat/completions', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
      .then(response => response.body)
      .then(body => {
        this.reader = body?.getReader();
        let aiMessage = '';
        this.messages.push({ text: aiMessage, sender: 'ai', avatar: this.faRobot });
        this.isAnswering = true;

        const read = () => {
          this.reader?.read().then(({ done, value }) => {

            if (done) {
              this.saveMessage(aiMessage, 'ai');
              this.isAnswering = false;
              return;
            }
            const text = new TextDecoder().decode(value);
            const lines = text.split('\n');
            for (const line of lines) {
              console.log(line);

              if (line.trim()) {
                if (line === 'data: [DONE]') {
                  this.saveMessage(aiMessage, 'ai');
                  this.isAnswering = false;
                  return;
                }
                if (line.startsWith('data: ')) {
                  const json = JSON.parse(line.replace(/^data: /, ''));
                  if (json.choices && json.choices[0].delta.content) {
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
        this.isAnswering = false;
      });
  }

  private searchKnowledgeBase(query: string): void {
    this.knowledgeResults = [];
    this.keyword = query;
    this.service.searchEntity(1, 10, { bool: { must: [{ match: { 'labels.zh.value': query } }, { match: { 'descriptions.zh.value': query } }] } })
      .subscribe((data: any) => {
        this.knowledgeResults = data.list;
        console.log(data);
      });
  }

  stopResponse(): void {
    this.reader?.cancel();
    this.isAnswering = false;
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
    this.selectedSession = null;
    this.messages = [];

  }

  deleteSession(sessionId: number): void {
    this.http.delete(`/api/sessions/${sessionId}/messages`)
      .subscribe(() => {
        this.http.delete(`/api/sessions/${sessionId}`)
          .subscribe(() => {
            this.todaySessions = this.todaySessions.filter((session: any) => session.id !== sessionId);
            this.yesterdaySessions = this.yesterdaySessions.filter((session: any) => session.id !== sessionId);
            this.earlierSessions = this.earlierSessions.filter((session: any) => session.id !== sessionId);
            this.addSession();
          });
      });
  }

  updateSession(sessionId: any, sessionName: string): void {
    console.log('更新会话');
    console.log(sessionId, sessionName);
    this.http.put(`/api/sessions/${sessionId}`, { name: sessionName })
      .subscribe(() => {
        const session = this.sessions.find((session: any) => session.id === sessionId);
        if (session) {
          session.name = sessionName;
          session.isEditing = false;
        }
      });
  }

  editSession(session: { id: number, name: string, isEditing?: boolean }): void {
    session.isEditing = true;
  }

  saveSession(session: { id: number, name: string, isEditing?: boolean, createdAt:string}): void {
    this.updateSession(session.id, session.name);
    session.isEditing = false;
    const sessionDate = new Date(session.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (sessionDate.toDateString() === today.toDateString()) {
      this.todaySessions = this.todaySessions.map(s => s.id === session.id ? session : s);
    } else if (sessionDate.toDateString() === yesterday.toDateString()) {
      this.yesterdaySessions = this.yesterdaySessions.map(s => s.id === session.id ? session : s);
    } else {
      this.earlierSessions = this.earlierSessions.map(s => s.id === session.id ? session : s);
    }
  }

  cancelEditSession(session: { id: number, name: string, isEditing?: boolean }): void {
    session.isEditing = false;
  }

  parseMarkdown(text: string): any {
    return marked(text);
  }

  toggleMenu(event: Event, session: any): void {
    event.stopPropagation();
    [...this.todaySessions, ...this.yesterdaySessions, ...this.earlierSessions].forEach((s: any) => {
      if (s !== session) {
        s.showMenu = false;
      }
    });
    session.showMenu = !session.showMenu;
  }

  toggleSessions(): void {
    this.sessionsVisible = !this.sessionsVisible;
  }

  toggleKnowledges(): void {
    this.knowledgesVisible = !this.knowledgesVisible;
  }

  queryKeyword(keyword: any) {
    if (keyword === '') {
      this.service
        .searchEntity(1, 10, { bool: { should: [{ match_all: {} }] } })
        .subscribe((data: any) => {
          console.log(data);
          this.entities = data.list;
        });
    } else {
      this.service
        .searchEntity(1, 10, { bool: { should: [{ match: { 'labels.zh.value': keyword } }, { match: { 'descriptions.zh.value': keyword } }] } })
        .subscribe((data: any) => {
          console.log(data);
          this.entities = data.list;
        });
    }


  }

  selectKnowledge(entity: any) {
    console.log(entity);
    this.ontologyService
      .getAllParentIds(entity['_source'].type)
      .subscribe((parents: any) => {
        parents.push(entity['_source'].type);

        this.propertyService
          .getList(1, 50, {
            filter: [
              {
                field: 'id',
                value: parents as string[],
                relation: 'schemas',
                operation: 'IN',
              },
            ],
          })
          .subscribe((x: any) => {
            console.log(x.list);

            let properties: any = {}
            x.list.forEach((p: any) => {
              properties[`P${p.id}`] = p.name
            });
            this.nodeService
              .getLinks(1, 50, entity['_id'], {})
              .subscribe((c: any) => {
                let statements: any = [];
                c.list.forEach((p: any) => {
                  if (p.edges[0].mainsnak.property != 'P31') {
                    p.edges[0].mainsnak.label = properties[p.edges[0].mainsnak.property];
                    if (p.edges[0]['_from'] != p.edges[0]['_to']) {
                      console.log(p.edges[0].mainsnak.property);
                      p.edges[0].mainsnak.datavalue.value.id =
                        p.vertices[1]?.id;
                      p.edges[0].mainsnak.datavalue.value.label =
                        p.vertices[1]?.labels?.zh?.value;
                    }
                    statements.push(p.edges[0]);
                  }
                });
                entity['_source'].statements = statements
                this.userInput = this.jsonToMarkdown(entity['_source']);
                this.sendMessage();
              });
          });
      });
  }

  jsonToMarkdown(data: any): string {
    console.log(data);
    const lines: string[] = [];

    // Title from first label
    const title = (Object.values(data.labels)[0] as { value: string })?.value || data.type;
    lines.push(`${title}:`);


    // Start blockquote
    lines.push('> ');
    // Tags
    if (data?.tags?.length > 0) {
      data.tags.forEach((tag: any) => {
        lines.push(`> \`${tag}\``);
      });
      lines.push('> ');
    }

    // Images
    if (data?.images?.length > 0) {
      data.images.forEach((image: any) => {
        lines.push(`> <img src="http://localhost:9000/kgms/${image}" alt="描述" height="120">`);
      });
      lines.push('> ');
    }


    // Description
    const description = (Object.values(data.descriptions)[0] as { value: string })?.value;
    if (description) {
      lines.push(`> ${description}`);
      lines.push('> ');
    }

    data.statements.forEach((statement: any) => {
      const property = statement.mainsnak.label;
      const value = statement.mainsnak.datavalue.value;
      const label = statement.mainsnak.datavalue.label;
      lines.push(`> - ${property}: ${label || value}`);
    });
    return lines.join('\n');
  }

  openPluginManagement(): void {
    this.router.navigate(['/start/chat/plugin']);
  }
}