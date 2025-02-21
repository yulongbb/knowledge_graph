import { Component, AfterViewInit } from '@angular/core';  // 移除 ElementRef, ViewChild
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

// 移除 LearningProgress 接口

interface Course {
    id: number;
    title: string;
    description: string;
    category: string;
    cover: string;
    path: string[];
}

Chart.register(...registerables);

@Component({
    selector: 'app-course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss']
})
export class CourseComponent implements AfterViewInit {
    searchQuery: string = '';
    categories = ['Web开发', '数据科学', '设计'];
    selectedCategories: string[] = [];
    allCourses: Course[] = [
        { id: 1, title: 'Angular - 完整指南', description: '从基础到高级学习Angular。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Introduction', 'Components', 'Services', 'Modules', 'Routing', 'Forms', 'Directives', 'Pipes', 'HTTP', 'Deployment'] },
        { id: 2, title: 'React - 完整指南', description: '掌握React并构建动态Web应用。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['JSX', 'Components', 'State', 'Props', 'Lifecycle', 'Hooks', 'Context', 'Redux', 'Routing', 'Testing'] },
        { id: 3, title: 'Vue.js - 完整指南', description: '学习Vue.js并创建惊人的Web应用。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Template Syntax', 'Components', 'Props', 'Events', 'Data Binding', 'Computed Properties', 'Watchers', 'Directives', 'Mixins', 'Routing', 'Vuex'] },
        { id: 4, title: 'Python数据科学', description: '学习Python及其在数据科学中的应用。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Data Cleaning', 'Data Visualization', 'Machine Learning', 'Scikit-learn', 'Model Evaluation'] },
        { id: 5, title: '机器学习A-Z', description: '掌握机器学习算法和技术。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Data Preprocessing', 'Regression', 'Classification', 'Clustering', 'Dimensionality Reduction', 'Model Selection', 'Evaluation Metrics'] },
        { id: 6, title: '深度学习专业化', description: '通过本课程成为深度学习专家。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Neural Networks', 'Convolutional NN', 'Recurrent NN', 'LSTMs', 'Transformers', 'Autoencoders', 'Generative Models'] },
        { id: 7, title: '平面设计大师班', description: '从基础到高级学习平面设计。', category: '设计', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Typography', 'Color Theory', 'Layout Design', 'Image Editing', 'Branding', 'Print Design', 'Web Design'] },
        { id: 8, title: 'UI/UX设计训练营', description: '掌握UI/UX设计原则和工具。', category: '设计', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Interaction Design', 'Visual Design', 'Accessibility'] },
        { id: 9, title: 'Adobe Photoshop CC', description: '从头开始学习Adobe Photoshop CC。', category: '设计', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Layers', 'Masks', 'Filters', 'Retouching', 'Color Correction', 'Compositing', 'Special Effects'] },
        { id: 10, title: 'JavaScript - 完整指南', description: '掌握JavaScript并构建动态Web应用。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Variables', 'Data Types', 'Operators', 'Control Flow', 'Functions', 'Objects', 'Arrays', 'DOM Manipulation', 'Events', 'Asynchronous JS'] },
        { id: 11, title: 'R语言数据科学', description: '使用R编程语言学习数据科学。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Data Structures', 'Data Manipulation', 'Data Visualization', 'Statistical Modeling', 'Linear Regression', 'Hypothesis Testing'] },
        { id: 12, title: '高级CSS和Sass', description: '掌握CSS和Sass，创建惊人的Web设计。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Selectors', 'Box Model', 'Layouts', 'Flexbox', 'Grid', 'Transitions', 'Animations', 'Responsive Design', 'Sass Basics', 'Advanced Sass'] },
        { id: 13, title: 'Node.js - 完整指南', description: '学习Node.js并构建可扩展的Web应用。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Modules', 'Asynchronous JS', 'Event Loop', 'File System', 'HTTP Server', 'Express.js', 'Middleware', 'REST APIs', 'Databases'] },
        { id: 14, title: 'SQL数据分析', description: '掌握SQL并轻松进行数据分析。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Data Definition', 'Data Manipulation', 'Data Querying', 'Functions', 'Indexes', 'Views', 'Stored Procedures'] },
        { id: 15, title: '数字营销大师班', description: '学习数字营销策略和技术。', category: '设计', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['SEO', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'Paid Advertising', 'Analytics'] },
        { id: 16, title: 'Kotlin安卓开发', description: '学习Kotlin并构建安卓应用。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Kotlin Basics', 'UI Layouts', 'Activities', 'Fragments', 'Data Persistence', 'Networking', 'Background Tasks'] },
        { id: 17, title: 'TensorFlow开发者认证', description: '成为认证的TensorFlow开发者。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Tensors', 'Variables', 'Layers', 'Models', 'Training Loops', 'Custom Layers', 'TensorBoard', 'Deployment'] },
        { id: 18, title: 'Illustrator CC大师班', description: '从基础到高级学习Adobe Illustrator CC。', category: '设计', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Paths', 'Shapes', 'Type', 'Color', 'Effects', 'Appearance Panel', 'Graphic Styles', 'Symbols'] },
        { id: 19, title: 'AWS认证解决方案架构师', description: '准备AWS解决方案架构师认证。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['Compute Services', 'Storage Services', 'Database Services', 'Networking', 'Security', 'Automation', 'Monitoring'] },
        { id: 20, title: 'Hadoop大数据', description: '学习大数据概念和Hadoop框架。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['HDFS', 'MapReduce', 'YARN', 'Spark', 'Hive', 'Pig', 'HBase', 'ZooKeeper'] }
    ];
    
    courses: Course[] = [...this.allCourses];
    selectedCourse: Course | null = null;
    currentPage: number = 1;
    itemsPerPage: number = 15;

    constructor(private route: ActivatedRoute, private router: Router) {
        this.route.queryParams.subscribe(params => {
            this.searchQuery = params['search'] || '';
            const category = params['category'] || '';
            this.selectedCategories = category ? category.split(',') : [];
            this.filterCourses();
            const courseId = params['courseId'];
            if (courseId) {
                this.selectedCourse = this.allCourses.find(course => course.id === +courseId) ?? null;
            }
        });
    }

    ngAfterViewInit() {
    }

    get paginatedCourses() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.courses.slice(start, end);
    }

    getPagesArray() {
        return Array(Math.ceil(this.courses.length / this.itemsPerPage)).fill(0).map((_, i) => i + 1);
    }

    searchCourses() {
        this.router.navigate([], {
            queryParams: {
                search: this.searchQuery,
                category: this.selectedCategories.join(',')
            }
        });
    }

    selectCourse(course: any) {
        this.selectedCourse = course;
        this.router.navigate([], {
            queryParams: {
                search: this.searchQuery,
                category: this.selectedCategories.join(','),
                courseId: course.id
            }
        });
    }

    changePage(page: number) {
        if (page >= 1 && page <= this.getPagesArray().length) {
            this.currentPage = page;
        }
    }

    filterCourses() {
        if (this.selectedCategories.length > 0) {
            this.courses = this.allCourses.filter(course => this.selectedCategories.includes(course.category));
        } else {
            this.courses = [...this.allCourses];
        }
    }

    toggleCategory(category: string) {
        const index = this.selectedCategories.indexOf(category);
        if (index > -1) {
            this.selectedCategories.splice(index, 1);
        } else {
            this.selectedCategories.push(category);
        }
        this.filterCourses();
        this.searchCourses();
    }

    navigateHome() {
        this.router.navigate(['/course']);
    }
}
