import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { faToggleOn, faToggleOff, faEdit, faTrash, faCogs, faSave, faPlus, faEllipsisV, faTimes, faPaperPlane, faUser, faRobot, faPause } from '@fortawesome/free-solid-svg-icons';
import { marked, MarkedOptions } from 'marked';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';

// Register languages you need
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);

interface Plugin {
  id?: number;
  name: string;
  description: string;
  enabled: boolean;
  isEditing?: boolean;
  showMenu?: boolean;
  prompt?: string;
  inputParams?: { name: string, type: string }[];
  outputFormat?: string;
}

@Component({
  selector: 'app-plugin',
  templateUrl: './plugin.component.html',
  styleUrls: ['./plugin.component.scss']
})
export class PluginComponent implements OnInit, AfterViewChecked {
  plugins: Plugin[] = [];
  newPlugin: Plugin = { name: '', description: '', enabled: false, inputParams: [] };
  editingPlugin: Plugin | null = null;

  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faEdit = faEdit;
  faTrash = faTrash;
  faCogs = faCogs;
  faSave = faSave;
  faPlus = faPlus;
  faEllipsisV = faEllipsisV;
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;
  faUser = faUser;
  faRobot = faRobot;
  faPause = faPause;

  @ViewChild('messageInput') messageInput: ElementRef | undefined;
  @ViewChild('messagesContainer') messagesContainer: ElementRef | undefined;
  messages: { text: string, sender: string, avatar: any }[] = [];
  userInput: string = '';
  isAnswering: boolean = false;
  reader: any;

  constructor(private http: HttpClient, private renderer: Renderer2) {
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
    this.loadPlugins();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();

    // 使用新版highlight.js API
    document.querySelectorAll('pre code').forEach((block: any) => {
      hljs.highlightElement(block);
    });
  }

  loadPlugins(): void {
    this.http.get<Plugin[]>('/api/plugins')
      .subscribe(plugins => this.plugins = plugins);
  }

  togglePlugin(plugin: Plugin) {
    plugin.enabled = !plugin.enabled;
    this.savePlugin(plugin);
  }

  addPlugin() {
    const defaultName = '新插件';
    const name = this.newPlugin.name || defaultName;
    const truncatedName = name.length > 20 ? name.substring(0, 20) + '...' : name;
    this.http.post<Plugin>('/api/plugins', { ...this.newPlugin, name: truncatedName })
      .subscribe(plugin => {
        this.plugins.push({ ...plugin, isEditing: false });
        this.newPlugin = { name: '', description: '', enabled: false, inputParams: [] };
      }, error => {
        console.error('Error creating plugin:', error);
      });
  }

  editPlugin(plugin: Plugin) {
    this.editingPlugin = { ...plugin, isEditing: true };
    this.loadMessages(plugin.id!);
  }

  savePlugin(plugin?: Plugin) {
    if (this.editingPlugin) {
      const index = this.plugins.findIndex(p => p.id === this.editingPlugin!.id);
      if (index !== -1) {
        const { isEditing, ...pluginData } = this.editingPlugin;
        this.http.put(`/api/plugins/${this.editingPlugin.id}`, pluginData)
          .subscribe(() => {
            this.plugins[index] = { ...this.editingPlugin!, isEditing: false };
            this.editingPlugin = null;
          }, error => {
            console.error('Error updating plugin:', error);
          });
      }
    } else if (plugin) {
      const { isEditing, ...pluginData } = plugin;
      this.http.put(`/api/plugins/${plugin.id}`, pluginData)
        .subscribe(() => {
          const index = this.plugins.findIndex(p => p.id === plugin.id);
          if (index !== -1) {
            this.plugins[index] = { ...plugin, isEditing: false };
          }
        }, error => {
          console.error('Error updating plugin:', error);
        });
    }
  }

  deletePlugin(plugin: Plugin) {
    this.http.delete(`/api/plugins/${plugin.id}`)
      .subscribe(() => {
        this.plugins = this.plugins.filter(p => p !== plugin);
      }, error => {
        console.error('Error deleting plugin:', error);
      });
  }

  cancelEditPlugin(plugin: Plugin) {
    plugin.isEditing = false;
  }

  toggleMenu(event: Event, plugin: Plugin) {
    event.stopPropagation();
    this.plugins.forEach(p => {
      if (p !== plugin) {
        p.showMenu = false;
      }
    });
    plugin.showMenu = !plugin.showMenu;
  }

  configurePlugin(plugin: Plugin) {
    // Add your configuration logic here
    alert(`Configuring ${plugin.name}`);
  }

  addInputParam() {
    if (this.editingPlugin) {
      this.editingPlugin.inputParams!.push({ name: '', type: 'string' });
    }
  }

  removeInputParam(index: number) {
    if (this.editingPlugin) {
      this.editingPlugin.inputParams!.splice(index, 1);
  }
}

  sendMessage(): void {
    if (this.userInput.trim()) {
      const userMessage = this.userInput;
      this.messages.push({ text: userMessage, sender: 'user', avatar: this.faUser });
      this.userInput = '';
      this.messageInput?.nativeElement.focus();
      this.getAIResponse(userMessage);
    }
  }

  private getAIResponse(userMessage: string): void {
    if (!this.editingPlugin) {
      console.error('No plugin selected for configuration.');
      return;
    }

    const body = {
      messages: [
        ...this.messages.map(message => ({
          text: message.text,
          sender: message.sender
        }))
      ]
    };

    this.http.post(`/api/plugins/${this.editingPlugin.id}/call-model`, body, { responseType: 'text' })
      .subscribe(response => {
        let aiMessage = '';
        this.messages.push({ text: aiMessage, sender: 'ai', avatar: this.faRobot });
        this.isAnswering = true;

        const responseBody = new Response(response).body;
        if (!responseBody) {
          console.error('Response body is null');
          return;
        }
        const reader = responseBody.getReader();
        const read = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              this.isAnswering = false;
              return;
            }
            const text = new TextDecoder().decode(value);
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.trim()) {
                if (line === 'data: [DONE]') {
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
      }, error => {
        console.error('Error fetching AI response:', error);
        this.isAnswering = false;
      });
  }

  loadMessages(pluginId: number): void {
    this.http.get<{ text: string, sender: string, avatar: any }[]>(`/api/plugins/${pluginId}/messages`)
      .subscribe(messages => {
        this.messages = messages;
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

  parseMarkdown(text: string): any {
    return marked(text);
  }
}