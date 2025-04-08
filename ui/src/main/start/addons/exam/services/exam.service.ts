import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Exam, QuestionType, FillBlankQuestion, TrueFalseQuestion, SingleChoiceQuestion, MultipleChoiceQuestion, ShortAnswerQuestion, ChoiceOption } from '../models/question.model';

@Injectable()
export class ExamService {
  constructor(private http: HttpClient) {}

  getExams(): Observable<Exam[]> {
    // Replace with actual API call
    return of([]);
  }

  getExamById(id: string): Observable<Exam> {
    // Replace with actual API call
    return of({
      id: '',
      title: '',
      description: '',
      fillBlankQuestions: [],
      trueFalseQuestions: [],
      singleChoiceQuestions: [],
      multipleChoiceQuestions: [],
      shortAnswerQuestions: [],
      totalScore: 100
    });
  }

  createExam(exam: Exam): Observable<Exam> {
    // Replace with actual API call
    return of(exam);
  }

  updateExam(exam: Exam): Observable<Exam> {
    // Replace with actual API call
    return of(exam);
  }

  deleteExam(id: string): Observable<boolean> {
    // Replace with actual API call
    return of(true);
  }

  parseExamText(text: string): Partial<Exam> {
    console.log('ExamService: Starting to parse exam text');
    
    const result: Partial<Exam> = {
      title: '',
      description: '',
      fillBlankQuestions: [],
      trueFalseQuestions: [],
      singleChoiceQuestions: [],
      multipleChoiceQuestions: [],
      shortAnswerQuestions: []
    };
    
    // Extract title (first line of text)
    const titleMatch = text.match(/^(.+?)(?:\r?\n|$)/);
    if (titleMatch) {
      result.title = titleMatch[1].trim();
      console.log('Found title:', result.title);
    }
    
    // Split text into sections based on question types
    const sections = [
      { type: 'fillBlank', pattern: /一、填空题[\s\S]*?(?=二、|$)/ },
      { type: 'trueFalse', pattern: /二、判断题[\s\S]*?(?=三、|$)/ },
      { type: 'singleChoice', pattern: /三、单项选择题[\s\S]*?(?=四、|$)/ },
      { type: 'multipleChoice', pattern: /四、多选题[\s\S]*?(?=五、|$)/ },
      { type: 'shortAnswer', pattern: /五、简答题[\s\S]*?(?=$)/ }
    ];
    
    for (const section of sections) {
      const sectionMatch = text.match(section.pattern);
      if (sectionMatch) {
        const sectionText = sectionMatch[0];
        console.log(`Found ${section.type} section with length ${sectionText.length}`);
        this.parseSectionQuestions(sectionText, section.type, result);
      } else {
        console.log(`Did not find ${section.type} section`);
      }
    }
    
    // Fixed logging to avoid TypeScript errors
    const nonEmptySections = [
      result.fillBlankQuestions && result.fillBlankQuestions.length > 0 ? 'fillBlankQuestions' : null,
      result.trueFalseQuestions && result.trueFalseQuestions.length > 0 ? 'trueFalseQuestions' : null,
      result.singleChoiceQuestions && result.singleChoiceQuestions.length > 0 ? 'singleChoiceQuestions' : null,
      result.multipleChoiceQuestions && result.multipleChoiceQuestions.length > 0 ? 'multipleChoiceQuestions' : null,
      result.shortAnswerQuestions && result.shortAnswerQuestions.length > 0 ? 'shortAnswerQuestions' : null
    ].filter(Boolean);
    
    console.log('ExamService: Parsing complete, returning result with sections:', nonEmptySections);
    
    return result;
  }

  private parseSectionQuestions(sectionText: string, type: string, result: Partial<Exam>): void {
    // Different parsing logic based on question type
    switch (type) {
      case 'fillBlank':
        this.parseFillBlankQuestions(sectionText, result);
        break;
      case 'trueFalse':
        this.parseTrueFalseQuestions(sectionText, result);
        break;
      case 'singleChoice':
        this.parseSingleChoiceQuestions(sectionText, result);
        break;
      case 'multipleChoice':
        this.parseMultipleChoiceQuestions(sectionText, result);
        break;
      case 'shortAnswer':
        this.parseShortAnswerQuestions(sectionText, result);
        break;
    }
  }

  private parseFillBlankQuestions(sectionText: string, result: Partial<Exam>): void {
    // Match questions that contain numbers followed by text
    const questionRegex = /\d+、(.*?)(?=\d+、|$)/gs;
    let match;
    
    while ((match = questionRegex.exec(sectionText)) !== null) {
      const questionText = match[1].trim();
      
      // Extract answers within parentheses or underscores
      const answers: string[] = [];
      const answerMatches = questionText.match(/[（\(]([^）\)]+)[）\)]|_{3,}/g) || [];
      
      for (const answerMatch of answerMatches) {
        if (answerMatch.startsWith('_')) {
          answers.push(''); // Empty answer for underscores
        } else {
          // Extract content from parentheses
          const content = answerMatch.match(/[（\(]([^）\)]+)[）\)]/)![1].trim();
          answers.push(content);
        }
      }
      
      // Create question object
      const fillBlankQuestion: FillBlankQuestion = {
        id: this.generateId(),
        title: questionText,
        score: 1,
        type: QuestionType.FillBlank,
        answers: answers.length > 0 ? answers : ['']
      };
      
      result.fillBlankQuestions!.push(fillBlankQuestion);
    }
  }

  private parseTrueFalseQuestions(sectionText: string, result: Partial<Exam>): void {
    // Match questions with true/false indicators
    const questionRegex = /\d+、(.*?)（\s*）([√×✓✗])/g;
    let match;
    
    while ((match = questionRegex.exec(sectionText)) !== null) {
      const questionText = match[1].trim();
      const answerMark = match[2];
      
      // Create question object
      const trueFalseQuestion: TrueFalseQuestion = {
        id: this.generateId(),
        title: questionText,
        score: 1,
        type: QuestionType.TrueFalse,
        answer: answerMark === '√' || answerMark === '✓'
      };
      
      result.trueFalseQuestions!.push(trueFalseQuestion);
    }
  }

  private parseSingleChoiceQuestions(sectionText: string, result: Partial<Exam>): void {
    // First, split the text into individual questions
    const questions = sectionText.split(/\d+、/).filter(q => q.trim() !== '');
    console.log(`Found ${questions.length} potential single choice questions`);
    
    // Process each question
    for (let i = 0; i < questions.length; i++) {
      const questionContent = questions[i].trim();
      
      // Extract answer from patterns like (D) or （D）
      const answerMatch = questionContent.match(/[（\(]\s*([A-D])\s*[）\)]/);
      if (!answerMatch) {
        console.log(`Question ${i+1}: No answer match found`);
        continue;
      }
      
      const answerLetter = answerMatch[1];
      
      // Get the question title (text before the options)
      const optionStartIdx = questionContent.search(/[A-D]\s*[\.．]/);
      if (optionStartIdx === -1) {
        console.log(`Question ${i+1}: No options found`);
        continue;
      }
      
      const questionTitle = questionContent.substring(0, optionStartIdx).trim();
      
      // Extract options
      const optionsText = questionContent.substring(optionStartIdx);
      const optionMatches = optionsText.match(/([A-D])\s*[\.．]\s*(.*?)(?=[A-D]\s*[\.．]|$)/g) || [];
      
      const options: ChoiceOption[] = [];
      for (const optionText of optionMatches) {
        const optionParts = optionText.match(/([A-D])\s*[\.．]\s*(.*)/);
        if (optionParts) {
          options.push({
            id: optionParts[1],
            content: optionParts[2].trim()
          });
        }
      }
      
      if (options.length === 0) {
        console.log(`Question ${i+1}: No options parsed`);
      }
      
      // Create question object
      const singleChoiceQuestion: SingleChoiceQuestion = {
        id: this.generateId(),
        title: questionTitle,
        score: 2,
        type: QuestionType.SingleChoice,
        options: options,
        answer: answerLetter
      };
      
      result.singleChoiceQuestions!.push(singleChoiceQuestion);
      console.log(`Added single choice question ${i+1} with ${options.length} options`);
    }
  }

  private parseMultipleChoiceQuestions(sectionText: string, result: Partial<Exam>): void {
    // First, split the text into individual questions
    const questions = sectionText.split(/\d+、/).filter(q => q.trim() !== '');
    console.log(`Found ${questions.length} potential multiple choice questions`);
    
    // Process each question
    for (let i = 0; i < questions.length; i++) {
      const questionContent = questions[i].trim();
      
      // Extract answers from patterns like (ABCD) or （ABCD）
      const answerMatch = questionContent.match(/[（\(]\s*([A-D]+)\s*[）\)]/);
      if (!answerMatch) {
        console.log(`Question ${i+1}: No answer match found`);
        continue;
      }
      
      const answerLetters = answerMatch[1].split('');
      
      // Get the question title (text before the options)
      const optionStartIdx = questionContent.search(/[A-D]\s*[\.．]/);
      if (optionStartIdx === -1) {
        console.log(`Question ${i+1}: No options found`);
        continue;
      }
      
      const questionTitle = questionContent.substring(0, optionStartIdx).trim();
      
      // Extract options
      const optionsText = questionContent.substring(optionStartIdx);
      const optionMatches = optionsText.match(/([A-D])\s*[\.．]\s*(.*?)(?=[A-D]\s*[\.．]|$)/g) || [];
      
      const options: ChoiceOption[] = [];
      for (const optionText of optionMatches) {
        const optionParts = optionText.match(/([A-D])\s*[\.．]\s*(.*)/);
        if (optionParts) {
          options.push({
            id: optionParts[1],
            content: optionParts[2].trim()
          });
        }
      }
      
      if (options.length === 0) {
        console.log(`Question ${i+1}: No options parsed`);
      }
      
      // Create question object
      const multipleChoiceQuestion: MultipleChoiceQuestion = {
        id: this.generateId(),
        title: questionTitle,
        score: 3,
        type: QuestionType.MultipleChoice,
        options: options,
        answers: answerLetters
      };
      
      result.multipleChoiceQuestions!.push(multipleChoiceQuestion);
      console.log(`Added multiple choice question ${i+1} with ${options.length} options and ${answerLetters.length} answers`);
    }
  }

  private parseShortAnswerQuestions(sectionText: string, result: Partial<Exam>): void {
    // Match questions and their answers
    const questionRegex = /\d+、(.*?)(?=答：|$)/gs;
    const answerRegex = /答：([\s\S]+?)(?=\d+、|$)/g;
    let match;
    
    while ((match = questionRegex.exec(sectionText)) !== null) {
      const questionText = match[1].trim();
      
      // Find answer that follows this question
      answerRegex.lastIndex = match.index + match[0].length;
      const answerMatch = answerRegex.exec(sectionText);
      const suggestedAnswer = answerMatch ? answerMatch[1].trim() : '';
      
      // Create question object
      const shortAnswerQuestion: ShortAnswerQuestion = {
        id: this.generateId(),
        title: questionText,
        score: 3,
        type: QuestionType.ShortAnswer,
        suggestedAnswer: suggestedAnswer
      };
      
      result.shortAnswerQuestions!.push(shortAnswerQuestion);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
