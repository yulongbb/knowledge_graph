export interface BaseQuestion {
  id: string;
  title: string;
  score: number;
  type: QuestionType;
}

export enum QuestionType {
  FillBlank = 'fillBlank',
  TrueFalse = 'trueFalse',
  SingleChoice = 'singleChoice',
  MultipleChoice = 'multipleChoice',
  ShortAnswer = 'shortAnswer'
}

export interface FillBlankQuestion extends BaseQuestion {
  type: QuestionType.FillBlank;
  answers: string[];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: QuestionType.TrueFalse;
  answer: boolean;
}

export interface ChoiceOption {
  id: string;
  content: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: QuestionType.SingleChoice;
  options: ChoiceOption[];
  answer: string;  // Option id
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MultipleChoice;
  options: ChoiceOption[];
  answers: string[];  // Option ids
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: QuestionType.ShortAnswer;
  suggestedAnswer: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  fillBlankQuestions: FillBlankQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
  singleChoiceQuestions: SingleChoiceQuestion[];
  multipleChoiceQuestions: MultipleChoiceQuestion[];
  shortAnswerQuestions: ShortAnswerQuestion[];
  totalScore: number;
}
