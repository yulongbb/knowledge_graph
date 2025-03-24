import { Component, Input, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { EsService } from 'src/main/start/search/es.service';

interface DragItem {
    type: 'text' | 'image' | 'video';
    content?: string;
    url?: string;
    thumbnail?: string;
    label?: string;
}

interface EntityTemplate {
    value: {
        _source: {
            template: string;
            labels?: { zh?: { value: string } };
            descriptions?: { zh?: { value: string } };
        }
        _id: string;
    }
}

@Component({
    selector: 'app-entity-template',
    templateUrl: './entity-template.component.html',
    styleUrls: ['./entity-template.component.scss']
})
export class EntityTemplateComponent implements OnInit {
    @Input() id!: string;

    entity = signal<EntityTemplate | null>(null);
    private editor: any;

    editorModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            ['blockquote', 'code-block'],
            [{ 'header': [1, 2, 3, false] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ]
    };

    constructor(
        private entityService: EntityService,
        private esService: EsService,

        private message: XMessageService,
        private location: Location
    ) { }

    ngOnInit(): void {
        this.loadTemplateData();
    }

    private loadTemplateData(): void {
        this.esService.getEntity(this.id).subscribe({
            next: (data: any) => {
                this.entity.set(data);
            },
            error: (error: any) => {
                this.message.error(`加载模板失败: ${error.message}`);
            }
        });
    }

    onEditorCreated(editor: any): void {
        this.editor = editor;
    }

    onDragStart(event: DragEvent, type: string, item: any): void {
        if (!event.dataTransfer) return;

        event.dataTransfer.setData('text/plain', JSON.stringify({
            type,
            item
        }));
    }

    onEditorDragover(event: DragEvent): void {
        event.preventDefault();
    }

    onEditorDrop(event: DragEvent): void {
        event.preventDefault();
        if (!event.dataTransfer) return;

        try {
            const data = JSON.parse(event.dataTransfer.getData('text/plain')) as DragItem;
            const range = this.editor.getSelection(true);

            this.insertContent(data, range.index);
        } catch (error) {
            this.message.error('拖放操作失败');
        }
    }

    private insertContent(data: DragItem, index: number): void {
        switch (data.type) {
            case 'text':
                this.insertText(data, index);
                break;
            case 'image':
                this.insertImage(data, index);
                break;
            case 'video':
                this.insertVideo(data, index);
                break;
        }
    }

    private insertText(data: DragItem, index: number): void {
        // Insert handlebars template syntax
        const content = data.content ? `{{${data.content}}}` : '';
        this.editor.clipboard.dangerouslyPasteHTML(index, content);
    }

    private insertImage(data: DragItem, index: number): void {
        const imageHtml = `
      {{#if images}}
        <img src="${data.url}" alt="{{labels.zh.value}}" />
      {{/if}}
    `;
        this.editor.clipboard.dangerouslyPasteHTML(index, imageHtml);
    }

    private insertVideo(data: DragItem, index: number): void {
        const videoHtml = `
      {{#if videos}}
        <video controls>
          <source src="${data.url}" type="video/mp4">
        </video>
        {{#if videos.[0].label}}
          <p>{{videos.[0].label}}</p>
        {{/if}}
      {{/if}}
    `;
        this.editor.clipboard.dangerouslyPasteHTML(index, videoHtml);
    }

    save(): void {
        if (!this.entity()) return;

        const updateData = {
            id: this.id,
            template: this.entity()?.value._source.template
        };

    }

    back(): void {
        this.location.back();
    }
}
