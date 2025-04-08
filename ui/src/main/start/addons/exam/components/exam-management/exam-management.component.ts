import { Component, OnInit } from '@angular/core';
import { ExamService } from '../../services/exam.service';
import { Exam } from '../../models/question.model';

@Component({
  selector: 'app-exam-management',
  templateUrl: './exam-management.component.html',
  styleUrls: ['./exam-management.component.scss']
})
export class ExamManagementComponent implements OnInit {
  examText: string = '';
  parsedExam: Partial<Exam> | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    console.log('ExamManagementComponent initialized');
  }

  parseExamText(): void {
    console.log('Parse button clicked');
    this.errorMessage = null;
    
    // Reset parsed exam to force re-evaluation of display conditions
    this.parsedExam = null;

    if (!this.examText) {
      this.errorMessage = '请先输入试卷文本';
      console.log('No exam text provided');
      return;
    }
    
    // Set loading state before parsing
    this.isLoading = true;
    console.log('Loading state set to true');
    
    // Use setTimeout to ensure the loading state is rendered before heavy processing begins
    setTimeout(() => {
      try {
        console.log('Inside setTimeout, parsing exam text');
        
        // Parse the exam text
        const parsedResult = this.examService.parseExamText(this.examText);
        console.log('Parsing complete, result:', parsedResult);
        
        // Debug sections
        console.log('Sections status:',
          'fill:', parsedResult.fillBlankQuestions?.length || 0,
          'tf:', parsedResult.trueFalseQuestions?.length || 0,
          'single:', parsedResult.singleChoiceQuestions?.length || 0,
          'multiple:', parsedResult.multipleChoiceQuestions?.length || 0,
          'short:', parsedResult.shortAnswerQuestions?.length || 0
        );
        
        // Check if we got a valid result with at least one type of question
        const hasQuestions = (
          (parsedResult.fillBlankQuestions && parsedResult.fillBlankQuestions.length > 0) ||
          (parsedResult.trueFalseQuestions && parsedResult.trueFalseQuestions.length > 0) ||
          (parsedResult.singleChoiceQuestions && parsedResult.singleChoiceQuestions.length > 0) ||
          (parsedResult.multipleChoiceQuestions && parsedResult.multipleChoiceQuestions.length > 0) ||
          (parsedResult.shortAnswerQuestions && parsedResult.shortAnswerQuestions.length > 0)
        );
        
        console.log('Has questions:', hasQuestions);
        
        if (!hasQuestions) {
          console.warn('No questions parsed from the exam text');
          this.errorMessage = '未能从试卷文本中解析出题目，请检查格式是否正确';
          this.isLoading = false;
          return;
        }
        
        console.log('Successfully parsed questions:', {
          fill: parsedResult.fillBlankQuestions?.length || 0,
          tf: parsedResult.trueFalseQuestions?.length || 0,
          single: parsedResult.singleChoiceQuestions?.length || 0,
          multiple: parsedResult.multipleChoiceQuestions?.length || 0,
          short: parsedResult.shortAnswerQuestions?.length || 0
        });
        
        // Calculate total score based on question counts and scores
        let totalScore = 0;
        
        if (parsedResult.fillBlankQuestions && parsedResult.fillBlankQuestions.length > 0) {
          totalScore += parsedResult.fillBlankQuestions.reduce((sum, q) => sum + q.score, 0);
        }
        
        if (parsedResult.trueFalseQuestions && parsedResult.trueFalseQuestions.length > 0) {
          totalScore += parsedResult.trueFalseQuestions.reduce((sum, q) => sum + q.score, 0);
        }
        
        if (parsedResult.singleChoiceQuestions && parsedResult.singleChoiceQuestions.length > 0) {
          totalScore += parsedResult.singleChoiceQuestions.reduce((sum, q) => sum + q.score, 0);
        }
        
        if (parsedResult.multipleChoiceQuestions && parsedResult.multipleChoiceQuestions.length > 0) {
          totalScore += parsedResult.multipleChoiceQuestions.reduce((sum, q) => sum + q.score, 0);
        }
        
        if (parsedResult.shortAnswerQuestions && parsedResult.shortAnswerQuestions.length > 0) {
          totalScore += parsedResult.shortAnswerQuestions.reduce((sum, q) => sum + q.score, 0);
        }
        
        parsedResult.totalScore = totalScore;
        
        // Ensure parsedExam is updated and trigger change detection
        this.parsedExam = {...parsedResult};
        
        console.log('Parse complete, this.parsedExam set:', this.parsedExam);
      } catch (error) {
        console.error('Error parsing exam:', error);
        this.errorMessage = `解析错误: ${error instanceof Error ? error.message : '未知错误'}`;
      } finally {
        // Always ensure loading state is turned off
        this.isLoading = false;
        console.log('Loading state set to false');
      }
    }, 100); // Short timeout to allow UI to update
  }

  saveExam(): void {
    if (this.parsedExam) {
      try {
        // Add id if missing
        if (!this.parsedExam.id) {
          this.parsedExam.id = this.generateId();
        }
        
        // Convert to full Exam object
        const exam = this.parsedExam as Exam;
        
        this.isLoading = true;
        this.examService.createExam(exam).subscribe({
          next: () => {
            alert('试卷保存成功！');
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error saving exam:', err);
            alert('保存失败，请重试');
            this.isLoading = false;
          }
        });
      } catch (error) {
        console.error('Error preparing exam for save:', error);
        alert('保存准备过程中出错，请重试');
        this.isLoading = false;
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
