import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'chart.js';

@Component({
    selector: 'app-course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss']
})
export class CourseComponent implements AfterViewInit {
    searchQuery: string = '';
    categories = ['Web开发', '数据科学', '设计'];
    selectedCategories: string[] = [];
    allCourses = [
        { id: 1, title: 'Angular - 完整指南', description: '从基础到高级学习Angular。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '组件', '服务', '路由', '高级'] },
        { id: 2, title: 'React - 完整指南', description: '掌握React并构建动态Web应用。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '组件', '状态管理', '路由', '高级'] },
        { id: 3, title: 'Vue.js - 完整指南', description: '学习Vue.js并创建惊人的Web应用。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '组件', '指令', '路由', '高级'] },
        { id: 4, title: 'Python数据科学', description: '学习Python及其在数据科学中的应用。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '数据处理', '数据可视化', '机器学习', '高级'] },
        { id: 5, title: '机器学习A-Z', description: '掌握机器学习算法和技术。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '回归', '分类', '聚类', '高级'] },
        { id: 6, title: '深度学习专业化', description: '通过本课程成为深度学习专家。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '神经网络', '卷积神经网络', '递归神经网络', '高级'] },
        { id: 7, title: '平面设计大师班', description: '从基础到高级学习平面设计。', category: '设计', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '色彩理论', '排版', '图形设计', '高级'] },
        { id: 8, title: 'UI/UX设计训练营', description: '掌握UI/UX设计原则和工具。', category: '设计', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '用户研究', '线框图', '原型设计', '高级'] },
        { id: 9, title: 'Adobe Photoshop CC', description: '从头开始学习Adobe Photoshop CC。', category: '设计', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '图层', '蒙版', '滤镜', '高级'] },
        { id: 10, title: 'JavaScript - 完整指南', description: '掌握JavaScript并构建动态Web应用。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', 'DOM操作', '事件处理', '异步编程', '高级'] },
        { id: 11, title: 'R语言数据科学', description: '使用R编程语言学习数据科学。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '数据处理', '数据可视化', '统计分析', '高级'] },
        { id: 12, title: '高级CSS和Sass', description: '掌握CSS和Sass，创建惊人的Web设计。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '布局', '动画', '响应式设计', '高级'] },
        { id: 13, title: 'Node.js - 完整指南', description: '学习Node.js并构建可扩展的Web应用。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '模块', '异步编程', 'Express', '高级'] },
        { id: 14, title: 'SQL数据分析', description: '掌握SQL并轻松进行数据分析。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '查询', '数据操作', '数据建模', '高级'] },
        { id: 15, title: '数字营销大师班', description: '学习数字营销策略和技术。', category: '设计', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', 'SEO', '内容营销', '社交媒体', '高级'] },
        { id: 16, title: 'Kotlin安卓开发', description: '学习Kotlin并构建安卓应用。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '布局', '活动', '数据库', '高级'] },
        { id: 17, title: 'TensorFlow开发者认证', description: '成为认证的TensorFlow开发者。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '张量', '模型', '训练', '高级'] },
        { id: 18, title: 'Illustrator CC大师班', description: '从基础到高级学习Adobe Illustrator CC。', category: '设计', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '图层', '路径', '效果', '高级'] },
        { id: 19, title: 'AWS认证解决方案架构师', description: '准备AWS解决方案架构师认证。', category: 'Web开发', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', '计算', '存储', '网络', '高级'] },
        { id: 20, title: 'Hadoop大数据', description: '学习大数据概念和Hadoop框架。', category: '数据科学', cover: 'https://www.edx.org/_next/image?url=https%3A%2F%2Fprod-discovery.edx-cdn.org%2Fmedia%2Fcourse%2Fimage%2Ff11c9289-596e-4c46-a9cb-318052f259ae-0b7656599f64.jpeg&w=384&q=75', path: ['基础', 'HDFS', 'MapReduce', 'YARN', '高级'] }
    ];
    courses = [...this.allCourses];
    selectedCourse: any = null;
    currentPage: number = 1;
    itemsPerPage: number = 15;

    constructor(private route: ActivatedRoute, private router: Router) {
        this.route.queryParams.subscribe(params => {
            this.searchQuery = params['search'] || '';
            const category = params['category'] || '';
            this.selectedCategories = category ? category.split(',') : [];
            this.filterCourses();
        });
    }

    ngAfterViewInit() {
        this.initializeChart();
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
        this.updateChart(course.path);
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

    initializeChart() {
        const ctx = (document.getElementById('learningPathChart') as HTMLCanvasElement).getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Learning Path',
                        data: [],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    updateChart(path: string[]) {
        const chart = Chart.getChart('learningPathChart');
        if (chart) {
            chart.data.labels = path;
            chart.data.datasets[0].data = path.map((_, index) => index + 1);
            chart.update();
        }
    }

    navigateHome() {
        this.router.navigate(['/course']);
    }
}
