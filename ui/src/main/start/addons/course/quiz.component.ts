import { Component, Input, Output, EventEmitter } from '@angular/core';

interface Question {
  id: number;
  type: 'single' | 'multiple' | 'boolean';
  content: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
}

@Component({
  selector: 'app-quiz',
  template: `
    <div class="quiz-container">
      <div *ngIf="!quizCompleted" class="quiz-content">
        <div class="quiz-header">
          <h3>知识测试</h3>
          <div class="progress-info">
            {{ currentQuestionIndex + 1 }} / {{ questions.length }}
          </div>
        </div>

        <div class="question-container">
          <div class="question-content">
            <div class="question-type">
              {{ getQuestionTypeText(currentQuestion.type) }}
            </div>
            {{ currentQuestion.content }}
          </div>

          <div class="options-container" [ngSwitch]="currentQuestion.type">
            <!-- 单选题和判断题 -->
            <div *ngSwitchCase="'single'" class="radio-options">
              <label *ngFor="let option of currentQuestion.options; let i = index" 
                     class="option-item">
                <input type="radio" 
                       [value]="option"
                       [(ngModel)]="selectedAnswer"
                       [name]="'question' + currentQuestion.id">
                <span class="option-text">{{ option }}</span>
              </label>
            </div>

            <!-- 判断题使用相同的模板 -->
            <div *ngSwitchCase="'boolean'" class="radio-options">
              <label *ngFor="let option of currentQuestion.options; let i = index" 
                     class="option-item">
                <input type="radio" 
                       [value]="option"
                       [(ngModel)]="selectedAnswer"
                       [name]="'question' + currentQuestion.id">
                <span class="option-text">{{ option }}</span>
              </label>
            </div>

            <!-- 多选题 -->
            <div *ngSwitchCase="'multiple'" class="checkbox-options">
              <label *ngFor="let option of currentQuestion.options; let i = index"
                     class="option-item">
                <input type="checkbox"
                       [value]="option"
                       (change)="toggleMultipleAnswer(option)"
                       [checked]="selectedAnswers.includes(option)">
                <span class="option-text">{{ option }}</span>
              </label>
            </div>

            <!-- 填空题 -->
            <div *ngSwitchCase="'text'" class="text-input">
              <input type="text"
                     [(ngModel)]="selectedAnswer"
                     placeholder="请输入你的答案">
            </div>
          </div>
        </div>

        <div class="quiz-actions">
          <button class="submit-btn"
                  [disabled]="!canSubmitAnswer()"
                  (click)="submitAnswer()">
            {{ isLastQuestion ? '完成测试' : '下一题' }}
          </button>
        </div>
      </div>

      <div *ngIf="quizCompleted" class="quiz-result">
        <h3>测试结果</h3>
        <div class="result-stats">
          <div class="stat-item">
            <div class="stat-label">正确答题</div>
            <div class="stat-value">{{ quizResult.correctAnswers }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">错误答题</div>
            <div class="stat-value">{{ quizResult.wrongAnswers }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">得分</div>
            <div class="stat-value">{{ quizResult.score }}%</div>
          </div>
        </div>
        <button class="retry-btn" (click)="retryQuiz()">重新测试</button>
        <button class="close-btn" (click)="closeQuiz()">返回学习</button>
      </div>
    </div>
  `,
  styles: [`
    .quiz-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .progress-info {
      font-size: 16px;
      color: #666;
    }

    .question-container {
      margin-bottom: 30px;
    }

    .question-content {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }

    .options-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }
    }

    .option-text {
      flex: 1;
    }

    .text-input input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;

      &:focus {
        outline: none;
        border-color: #007bff;
      }
    }

    .quiz-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .submit-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      background-color: #007bff;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: #0056b3;
      }

      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    }

    .quiz-result {
      text-align: center;
    }

    .result-stats {
      display: flex;
      justify-content: space-around;
      margin: 30px 0;
    }

    .stat-item {
      text-align: center;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .retry-btn, .close-btn {
      padding: 10px 20px;
      margin: 0 10px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .retry-btn {
      background-color: #28a745;
      color: white;

      &:hover {
        background-color: #218838;
      }
    }

    .close-btn {
      background-color: #6c757d;
      color: white;

      &:hover {
        background-color: #5a6268;
      }
    }

    .question-type {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      background-color: #e9ecef;
      color: #495057;
      font-size: 14px;
      margin-bottom: 10px;
    }
  `]
})
export class QuizComponent {
  @Input() pointId!: number;
  @Output() quizClose = new EventEmitter<void>();
  @Output() quizComplete = new EventEmitter<QuizResult>();

  questions: Question[] = [
    {
      id: 1,
      type: 'single',
      content: 'Angular中用于声明组件的装饰器是哪个？',
      options: ['@Component', '@Directive', '@Injectable', '@Module'],
      correctAnswer: '@Component',
      explanation: '@Component装饰器用于声明Angular组件'
    },
    {
      id: 2,
      type: 'multiple',
      content: '以下哪些是Angular的数据绑定方式？',
      options: ['插值绑定{{}}', '属性绑定[]', '事件绑定()', '双向绑定[()]'],
      correctAnswer: ['插值绑定{{}}', '属性绑定[]', '事件绑定()', '双向绑定[()]'],
      explanation: 'Angular提供了四种数据绑定方式'
    },
    {
      id: 3,
      type: 'boolean',
      content: 'Angular中的服务是单例的？',
      options: ['正确', '错误'],
      correctAnswer: '正确',
      explanation: '默认情况下，Angular的服务是单例模式，在整个应用中共享同一个实例'
    },
    {
      id: 4,
      type: 'single',
      content: 'Angular中用于获取子组件实例的装饰器是？',
      options: ['@Input', '@Output', '@ViewChild', '@HostBinding'],
      correctAnswer: '@ViewChild',
      explanation: '@ViewChild用于获取子组件或DOM元素的引用'
    },
    {
      id: 5,
      type: 'multiple',
      content: '以下哪些是Angular的生命周期钩子？',
      options: ['ngOnInit', 'ngOnChanges', 'ngAfterViewInit', 'ngOnUpdate'],
      correctAnswer: ['ngOnInit', 'ngOnChanges', 'ngAfterViewInit'],
      explanation: 'ngOnUpdate不是Angular的生命周期钩子'
    },
    {
      id: 6,
      type: 'boolean',
      content: 'Angular的管道操作符是"|"？',
      options: ['正确', '错误'],
      correctAnswer: '正确',
      explanation: 'Angular使用"|"作为管道操作符，例如：{{ date | date }}'
    }
  ];

  currentQuestionIndex = 0;
  selectedAnswer: string = '';
  selectedAnswers: string[] = [];
  quizCompleted = false;
  quizResult: QuizResult = {
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    score: 0
  };

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  toggleMultipleAnswer(option: string) {
    const index = this.selectedAnswers.indexOf(option);
    if (index > -1) {
      this.selectedAnswers.splice(index, 1);
    } else {
      this.selectedAnswers.push(option);
    }
  }

  canSubmitAnswer(): boolean {
    switch (this.currentQuestion.type) {
      case 'single':
      case 'boolean':
        return !!this.selectedAnswer;
      case 'multiple':
        return this.selectedAnswers.length > 0;
      default:
        return false;
    }
  }

  submitAnswer() {
    let isCorrect = false;
    const currentQuestion = this.currentQuestion;

    switch (currentQuestion.type) {
      case 'single':
      case 'boolean':
        isCorrect = this.selectedAnswer === currentQuestion.correctAnswer;
        break;
      case 'multiple':
        const correctAnswers = currentQuestion.correctAnswer as string[];
        isCorrect = this.selectedAnswers.length === correctAnswers.length &&
                   this.selectedAnswers.every(answer => correctAnswers.includes(answer));
        break;
    }

    if (isCorrect) {
      this.quizResult.correctAnswers++;
    } else {
      this.quizResult.wrongAnswers++;
    }

    if (this.isLastQuestion) {
      this.completeQuiz();
    } else {
      this.nextQuestion();
    }
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.selectedAnswer = '';
    this.selectedAnswers = [];
  }

  completeQuiz() {
    this.quizResult.totalQuestions = this.questions.length;
    this.quizResult.score = Math.round(
      (this.quizResult.correctAnswers / this.quizResult.totalQuestions) * 100
    );
    this.quizCompleted = true;
    this.quizComplete.emit(this.quizResult);
  }

  retryQuiz() {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = '';
    this.selectedAnswers = [];
    this.quizCompleted = false;
    this.quizResult = {
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      score: 0
    };
  }

  closeQuiz() {
    this.quizClose.emit();
  }

  getQuestionTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'single': '单选题',
      'multiple': '多选题',
      'boolean': '判断题'
    };
    return typeMap[type] || '未知题型';
  }
}
