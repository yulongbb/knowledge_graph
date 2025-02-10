import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, Renderer2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { faPaperPlane, faUser, faRobot, faEllipsisV, faSave, faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { marked, MarkedOptions } from 'marked';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import { EsService } from '../search/es.service';
import { EntityService } from 'src/main/entity/entity.service';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { PropertyService } from 'src/main/ontology/property/property.service';

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
  faPlus = faPlus;
  faRobot = faRobot;
  faEllipsisV = faEllipsisV;
  faSave = faSave;
  faEdit = faEdit;
  faTrash = faTrash;
  fa = faEdit;
  faTimes = faTimes;
  sessions: any = [];
  selectedSession: number | null = null;
  apiKey: string = ''; // Replace with your actual API key
  keyword: string = '';
  entities: any;
  constructor(private http: HttpClient, private renderer: Renderer2,
    private service: EsService, private nodeService: EntityService,
    private ontologyService: OntologyService,
    public propertyService: PropertyService,
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
    this.renderer.listen('window', 'click', (e: Event) => {
      this.sessions.forEach((session: any) => {
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
        .subscribe(() => {
          if (sender === 'user' && this.messages.length === 1) {
            const truncatedTitle = text.length > 20 ? text.substring(0, 20) + '...' : text;
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
    this.http.post<{ id: number, name: string }>('/api/sessions', { name: 'New Session' })
      .subscribe(session => {
        this.sessions.push(session);
        this.selectSession(session.id);
      });
  }

  deleteSession(sessionId: number): void {
    this.http.delete(`/api/sessions/${sessionId}`)
      .subscribe(() => {
        this.sessions = this.sessions.filter((session: any) => session.id !== sessionId);
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

  updateSession(sessionId: any, sessionName: string): void {
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

  saveSession(session: { id: number, name: string, isEditing?: boolean }): void {
    this.updateSession(session.id, session.name);
  }

  cancelEditSession(session: { id: number, name: string, isEditing?: boolean }): void {
    session.isEditing = false;
  }

  parseMarkdown(text: string): any {
    return marked(text);
  }

  toggleMenu(event: Event, session: any): void {
    event.stopPropagation();
    session.showMenu = !session.showMenu;
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

    // Title from first label
    const title = (Object.values(data.labels)[0] as { value: string })?.value || data.type;
    lines.push(`> ### ${title}`);
    lines.push('> ');

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
}