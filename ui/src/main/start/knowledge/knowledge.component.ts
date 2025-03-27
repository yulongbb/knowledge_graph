import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from './models/category.model';
import { CategoryService } from './services/category.service';

@Component({
    selector: 'app-knowledge',
    templateUrl: './knowledge.component.html',
    styleUrls: ['./knowledge.component.scss']
})
export class KnowledgeComponent implements OnInit {
    searchText: string = '';
    categories: Category[] = [];
    isLoading: boolean = false;

    constructor(
        private categoryService: CategoryService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        const response: any = {
            "list": [
                {
                    "id": "327991d8-5d75-46b9-909f-65daa8bf5eb2",
                    "name": "新闻",
                    "label": "新闻",
                    "value": 1,
                    "description": null,
                    "collection": null,
                    "router": null,
                    "icon": null,
                    "sort": null,
                    "pid": null,
                    "path": "E4.327991d8-5d75-46b9-909f-65daa8bf5eb2",
                    "color": null,
                    "parent": null
                },
                {
                    "id": "54a90bf4-6921-cb57-a2e2-b3234ae18520",
                    "name": "教材",
                    "label": "教材",
                    "value": 1,
                    "description": null,
                    "collection": null,
                    "router": null,
                    "icon": null,
                    "sort": null,
                    "pid": null,
                    "path": "54a90bf4-6921-cb57-a2e2-b3234ae18520",
                    "color": null,
                    "parent": null
                },
                {
                    "id": "7eed2cf0-d708-6f48-4aeb-386dcb1165f0",
                    "name": "人物",
                    "label": "人物",
                    "value": 1,
                    "description": null,
                    "collection": null,
                    "router": null,
                    "icon": null,
                    "sort": null,
                    "pid": null,
                    "path": "7eed2cf0-d708-6f48-4aeb-386dcb1165f0",
                    "color": null,
                    "parent": null
                },
                {
                    "id": "E4",
                    "name": "其他",
                    "label": "其他",
                    "value": 1,
                    "description": null,
                    "collection": null,
                    "router": null,
                    "icon": null,
                    "sort": null,
                    "pid": null,
                    "path": "E4",
                    "color": null,
                    "parent": null
                },
                {
                    "id": "dcddad89-a727-a28b-1ac8-baa1aec5e9cc",
                    "name": "课程",
                    "label": "课程",
                    "value": 1,
                    "description": null,
                    "collection": null,
                    "router": null,
                    "icon": null,
                    "sort": null,
                    "pid": null,
                    "path": "dcddad89-a727-a28b-1ac8-baa1aec5e9cc",
                    "color": null,
                    "parent": null
                },
                {
                    "id": "dd2a65f6-5aa4-44db-b9e6-41c65bc75c82",
                    "name": "飞行器",
                    "label": "飞行器",
                    "value": 1,
                    "description": null,
                    "collection": null,
                    "router": null,
                    "icon": null,
                    "sort": null,
                    "pid": null,
                    "path": "dd2a65f6-5aa4-44db-b9e6-41c65bc75c82",
                    "color": null,
                    "parent": null
                },
                {
                    "id": "faf96bec-f50e-d45d-4e1c-9efb9e7f9c11",
                    "name": "机构",
                    "label": "机构",
                    "value": 1,
                    "description": null,
                    "collection": null,
                    "router": null,
                    "icon": null,
                    "sort": null,
                    "pid": null,
                    "path": "faf96bec-f50e-d45d-4e1c-9efb9e7f9c11",
                    "color": null,
                    "parent": null
                },
                {
                    "id": "803003cf-2cb3-2ef3-1cee-97e5bedfb50c",
                    "name": "知识点",
                    "label": "知识点",
                    "value": 1,
                    "description": null,
                    "collection": null,
                    "router": null,
                    "icon": null,
                    "sort": null,
                    "pid": "3111da94-2aa2-e38f-31a6-12d57b2f8614",
                    "path": "803003cf-2cb3-2ef3-1cee-97e5bedfb50c",
                    "color": null,
                    "parent": null
                },
                {
                    "id": "3111da94-2aa2-e38f-31a6-12d57b2f8614",
                    "name": "章节",
                    "label": "章节",
                    "value": 1,
                    "description": null,
                    "collection": null,
                    "router": null,
                    "icon": null,
                    "sort": null,
                    "pid": "dcddad89-a727-a28b-1ac8-baa1aec5e9cc",
                    "path": "3111da94-2aa2-e38f-31a6-12d57b2f8614",
                    "color": null,
                    "parent": null
                }
            ],
            "total": 9,
            "query": {
                "sort": [
                    {
                        "field": "pid",
                        "value": "asc"
                    },
                    {
                        "field": "sort",
                        "value": "asc"
                    }
                ]
            }

        };

        this.categories = this.categoryService.buildCategoryTree(response.list);

        // Handle route params
        this.route.queryParams.subscribe(params => {
            const category = params['category'];
            if (category) {
                console.log('Current category path:', category);
            }
        });
    }

    onSearch(): void {
        // Implement search logic
    }
}
