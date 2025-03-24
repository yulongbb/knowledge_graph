import { Component, Input, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EsService } from 'src/main/start/search/es.service';
import { EntityService } from 'src/main/entity/entity.service';
import { Signal, signal } from '@angular/core';

@Component({
    selector: 'app-entity-info',
    templateUrl: './entity-info.component.html',
    styleUrls: ['./entity-info.component.scss']
})
export class EntityInfoComponent implements OnInit, AfterViewInit {
    @Input() id!: string;
    @ViewChild('contentMain') contentMain!: ElementRef;

    @ViewChild('wikiInfo') wikiInfo!: ElementRef;

    entity: any;
    item: any;
    imgs: any = [];
    tag = signal([]);
    renderedContent: string = '';
    tableOfContents: any[] = []; // Initialize as empty array
    currentSection: string = '';
    isTocVisible: boolean = false;
    hasTableOfContents: boolean = true;

    constructor(
        private router: Router,
        private esService: EsService,
        private entityService: EntityService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {

        window.addEventListener('hashchange', () => this.onHashChange());

        // 监听滚动以更新当前章节
        window.addEventListener('scroll', () => this.checkActiveSection(), { passive: true });

        // 如果有初始 hash，滚动到对应位置
        if (window.location.hash) {
            setTimeout(() => {
                this.scrollToSection(window.location.hash.slice(1));
            }, 100);
        }
        this.loadEntityData();

        window.addEventListener('hashchange', () => this.onHashChange());
        window.addEventListener('scroll', () => this.checkActiveSection(), { passive: true });

        if (window.location.hash) {
            setTimeout(() => {
                this.scrollToSection(window.location.hash.slice(1));
            }, 100);
        }
    }

    ngAfterViewInit() {
        // 添加滚动事件监听
        if (this.contentMain?.nativeElement) {
            this.contentMain.nativeElement.addEventListener('scroll', () => {
                this.onContentScroll();
            }, { passive: true });
        }

        this.hasTableOfContents = this.tableOfContents.length > 0;
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        window.removeEventListener('hashchange', () => this.onHashChange());
        window.removeEventListener('scroll', () => this.checkActiveSection());
    }

    onContentScroll() {
        const scrollPosition = window.pageYOffset;
        const headings = document.querySelectorAll('.section-heading');
        const offset = 100;

        // 找到当前可见的标题
        let currentSection = '';

        headings.forEach(heading => {
            const elementTop = heading.getBoundingClientRect().top + window.pageYOffset;
            if (elementTop - offset <= scrollPosition) {
                currentSection = heading.id;
            }
        });

        if (this.currentSection !== currentSection && currentSection) {
            this.currentSection = currentSection;
            this.cdr.detectChanges();
        }
    }


    private loadEntityData() {
        this.esService.getEntity(this.id).subscribe((x: any) => {
            this.entity = signal({ value: x });
            this.item = x._source;
            this.tag.set(this.item?.tags || []);

            // Handle images
            this.imgs = this.item?.images?.map((image: any) => ({
                url: `http://localhost:9000/kgms/${image}`
            })) || [];

            // Render content
            this.entityService.render(this.id).subscribe({
                next: (response: any) => {
                    if (response.success) {
                        this.renderedContent = response.content;
                        
                        // 等待 DOM 更新后解析目录
                        setTimeout(() => {
                            // 使用 DOMParser 解析 HTML 内容
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(this.renderedContent, 'text/html');
                            const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));
                            
                            console.log('Found headings:', headings.length); // Debug log
                            
                            this.tableOfContents = headings.map((heading, index) => {
                                const title = heading.textContent?.trim() || '';
                                const level = parseInt(heading.tagName[1]);
                                const anchor = `section-${index}`;
                                
                                return {
                                    title,
                                    level,
                                    anchor
                                };
                            });
                            
                            console.log('Generated TOC:', this.tableOfContents); // Debug log
                            this.cdr.detectChanges();
                            
                            // 更新实际 DOM 中的标题
                            setTimeout(() => {
                                document.querySelectorAll('.wiki-body h1, .wiki-body h2, .wiki-body h3')
                                    .forEach((heading, index) => {
                                        heading.id = `section-${index}`;
                                        heading.classList.add('section-heading');
                                    });
                            }, 0);
                        }, 0);
                    }
                }
            });
        });
    }



    editEntity() {
        this.router.navigate(['/start/search/edit', this.id]);
    }

    editTemplate() {
        this.router.navigate(['/start/search/template', this.id]);
    }










    toggleToc() {
        this.isTocVisible = !this.isTocVisible;
    }

    closeToc() {
        this.isTocVisible = false;
    }

    scrollToSection(anchor: string) {
        this.closeToc(); // 点击目录项时关闭目录
        const element = document.getElementById(anchor);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    onHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            this.currentSection = hash;
            this.highlightSection(hash);
        }
    }

    highlightSection(anchor: string) {
        const element = document.getElementById(anchor);
        if (element) {
            // 移除之前的高亮
            document.querySelectorAll('.highlight-section').forEach(el => {
                el.classList.remove('highlight-section');
            });

            // 添加新的高亮
            element.classList.add('highlight-section');
            setTimeout(() => {
                element.classList.remove('highlight-section');
            }, 2000);
        }
    }

    checkActiveSection() {
        const headings: any = document.querySelectorAll('.section-heading');
        const scrollPosition = window.scrollY;

        for (const heading of headings) {
            const sectionTop = heading.offsetTop - 100;
            const sectionBottom = sectionTop + heading.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                const newSection = heading.id;
                if (this.currentSection !== newSection) {
                    this.currentSection = newSection;
                    // 更新 URL 但不触发新的滚动
                    history.replaceState(null, '', `#${newSection}`);
                    this.cdr.detectChanges();
                }
                break;
            }
        }
    }



    private generateAnchor(text: string | null): string {
        if (!text) return '';
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphen
            .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
    }


}
