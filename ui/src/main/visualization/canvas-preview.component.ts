import { Component, Input, AfterViewInit, OnChanges, ElementRef, ViewChild, OnInit } from '@angular/core';

declare const echarts: any;

@Component({
    selector: 'app-canvas-preview',
    templateUrl: './canvas-preview.component.html',
    styleUrls: ['./canvas-preview.component.scss']
})
export class CanvasPreviewComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() elements: any[] = [];
    @Input() width: number = 800;
    @Input() height: number = 600;
    @ViewChild('previewArea', { static: true }) previewArea!: ElementRef<HTMLDivElement>;

    ngOnInit() {
        // 仅在新tab页面自动从localStorage读取数据
        if (!this.elements || this.elements.length === 0) {
            const els = localStorage.getItem('canvasPreviewElements');
            if (els) {
                this.elements = JSON.parse(els);
            }
            // 预览页面默认占满屏幕
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            const w = localStorage.getItem('canvasPreviewWidth');
            if (w) this.width = Math.max(Number(w), window.innerWidth);
            const h = localStorage.getItem('canvasPreviewHeight');
            if (h) this.height = Math.max(Number(h), window.innerHeight);
        }
    }

    ngAfterViewInit() {
        this.renderEcharts();
    }

    ngOnChanges() {
        setTimeout(() => this.renderEcharts(), 0);
    }

    renderEcharts() {
        if (!this.previewArea) return;
        // 清理所有 ECharts 实例
        const echartsDivs = this.previewArea.nativeElement.querySelectorAll('.echarts-preview');
        echartsDivs.forEach(div => {
            if ((div as any).__echartsInstance) {
                (div as any).__echartsInstance.dispose();
                (div as any).__echartsInstance = null;
            }
            div.innerHTML = '';
        });
        // 渲染所有 ECharts 元素
        this.elements.forEach((el, idx) => {
            if (el.type === 'echarts' && el.option) {
                const chartDiv = this.previewArea.nativeElement.querySelector(`#echarts-preview-${idx}`);
                if (chartDiv) {
                    const isWordcloud = el.option?.series?.[0]?.type === 'wordCloud';
                    const renderChart = (echarts: any) => {
                        const instance = echarts.init(chartDiv as HTMLElement);
                        instance.setOption(el.option);
                        (chartDiv as any).__echartsInstance = instance;
                    };
                    // 主动加载 echarts 库（兼容新tab页面）
                    if (isWordcloud) {
                        Promise.all([
                            window['echarts'] ? Promise.resolve(window['echarts']) : import('echarts'),
                            import('echarts-wordcloud')
                        ]).then(([echarts]) => {
                            renderChart(echarts);
                        });
                    } else {
                        (window['echarts']
                            ? Promise.resolve(window['echarts'])
                            : import('echarts')
                        ).then((echarts) => {
                            renderChart(echarts);
                        });
                    }
                }
            }
        });
    }
}
