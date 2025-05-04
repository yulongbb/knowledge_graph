import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 模板渲染响应
 */
export class TemplateRenderResponse {
  @ApiProperty({ description: '操作成功标志', example: true })
  success: boolean;

  @ApiPropertyOptional({ description: '渲染的HTML内容' })
  content?: string;

  @ApiPropertyOptional({ description: '错误信息', example: 'Template compilation failed' })
  error?: string;

  @ApiPropertyOptional({ description: '提示信息', example: 'No template defined for this entity' })
  message?: string;
}
