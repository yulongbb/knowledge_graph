import { PageBase } from 'src/share/base/base-page';
import { Component, ElementRef, OnInit, OnDestroy, signal, ViewChild, effect, AfterViewInit } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { ExtractionService, Script, ScriptType, ScriptExecutionResult } from './extraction.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { XMessageService } from '@ng-nest/ui/message';
import { finalize, take } from 'rxjs';
// Import codemirror modules without the theme CSS import
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';

@Component({
  selector: 'app-extraction',
  templateUrl: 'extraction.component.html',
  styleUrls: ['./extraction.component.scss']
})
export class ExtractionComponent extends PageBase implements OnInit, OnDestroy, AfterViewInit {
  // Signals and properties for the component
  scriptTypes = signal<ScriptType[]>([]);
  scripts = signal<Script[]>([]);
  selectedType = signal<string>('extraction');
  selectedScript = signal<Script | null>(null);
  isEditing = signal<boolean>(false);
  isCreating = signal<boolean>(false);
  isTesting = signal<boolean>(false);
  loading = signal<boolean>(false);
  testResult = signal<ScriptExecutionResult | null>(null);
  sampleData = signal<string>('');

  // Initialize with empty FormGroup to fix the TS2564 error
  scriptForm: FormGroup = this.fb.group({});
  
  @ViewChild('scriptEditor') scriptEditor!: ElementRef;
  
  // CodeMirror editor options
  editorOptions = {
    theme: 'default',
    mode: 'javascript',
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    autoCloseBrackets: true,
    matchBrackets: true,
    extraKeys: { 'Ctrl-Space': 'autocomplete' },
    readOnly: false
  };
  
  jsonEditorOptions = {
    theme: 'default',
    mode: { name: 'javascript', json: true },
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    autoCloseBrackets: true,
    matchBrackets: true
  };
  
  readOnlyJsonEditorOptions = {
    theme: 'default',
    mode: { name: 'javascript', json: true },
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    readOnly: true
  };
  
  languageOptions = [
    { label: 'JavaScript', value: 'javascript' }, // Note: value is lowercase
    { label: 'Python', value: 'python' },
    { label: 'SQL', value: 'sql' }
  ];

  // Code snippet templates
  codeSnippets: Record<string, string> = {
    javascript: `// 处理数据的函数
function processData(data) {
  // TODO: 在这里实现你的数据处理逻辑
  
  // 例如: 提取数据中的特定字段
  const result = {
    processed: true,
    extractedData: data.map(item => ({
      id: item.id,
      name: item.name,
      // 其他字段...
    }))
  };
  
  return result;
}`,
    python: `# 处理数据的函数
def process_data(data):
    # TODO: 在这里实现你的数据处理逻辑
    
    # 例如: 提取数据中的特定字段
    result = {
        "processed": True,
        "extractedData": [{
            "id": item["id"],
            "name": item["name"],
            # 其他字段...
        } for item in data]
    }
    
    return result`,
    sql: `-- 数据处理SQL脚本
-- 注意: 这里的SQL会在特定上下文中执行，具体取决于你的应用配置

-- 示例: 从输入表中选择数据并转换
SELECT 
  id,
  name,
  -- 其他字段转换示例
  CASE WHEN status = 'active' THEN 1 ELSE 0 END as is_active
FROM input_data
WHERE id IS NOT NULL
ORDER BY id ASC;`
  };

  // Initialize the form with improved validation
  initForm(): void {
    this.scriptForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      type: ['extraction', [Validators.required]],
      language: ['javascript', [Validators.required]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      tags: [''] // Changed from array to string
    });
  }

  constructor(
    public override indexService: IndexService,
    private extractionService: ExtractionService,
    private fb: FormBuilder,
    private message: XMessageService
  ) {
    super(indexService);
    this.initForm(); // Call initForm in constructor to ensure initialization
    
    // Use Angular's effect() to respond to signal changes
    effect(() => {
      // Update editor readOnly state when editing or creating state changes
      const isEditMode = this.isEditing() || this.isCreating();
      this.editorOptions = {
        ...this.editorOptions,
        readOnly: !isEditMode
      };
    });
  }

  ngOnInit(): void {
    this.loadScriptTypes();
    this.loadScripts(this.selectedType());
    
    // Update editor language when language selection changes
    this.scriptForm.get('language')?.valueChanges.subscribe(lang => {
      this.onLanguageChange(lang);
    });
  }
  
  ngAfterViewInit(): void {
    // Give time for CodeMirror to initialize
    setTimeout(() => {
      if (this.scriptEditor?.nativeElement) {
        // Force CodeMirror refresh if needed
        const cmInstance = this.scriptEditor.nativeElement.querySelector('.CodeMirror')?.CodeMirror;
        if (cmInstance) {
          cmInstance.refresh();
        }
      }
    }, 100);
  }

  loadScriptTypes(): void {
    this.loading.set(true);
    this.extractionService.getScriptTypes()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (types: ScriptType[]) => {
          this.scriptTypes.set(types);
        },
        error: (error: any) => {
          this.handleError(error, '加载脚本类型失败');
        }
      });
  }

  loadScripts(type: string): void {
    this.loading.set(true);
    this.extractionService.getScripts(type)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (scripts: Script[]) => {
          this.scripts.set(scripts);
        },
        error: (error: any) => {
          this.handleError(error, '加载脚本列表失败');
        }
      });
  }

  onTypeChange(type: string): void {
    this.selectedType.set(type);
    this.loadScripts(type);
    // Clear selection to avoid showing scripts from different types
    this.selectedScript.set(null);
    this.isEditing.set(false);
    this.isCreating.set(false);
    this.isTesting.set(false);
  }

  selectScript(script: Script): void {
    this.selectedScript.set(script);
    
    // Convert tags array to string format with # prefix
    const tagString = script.tags && script.tags.length 
      ? script.tags.map(tag => `#${tag}`).join(' ') 
      : '';
    
    this.scriptForm.patchValue({
      ...script,
      tags: tagString
    } as any);
    
    this.isEditing.set(false);
    this.isCreating.set(false);
    this.isTesting.set(false);
    
    // Update editor mode
    this.updateEditorMode(script.language);
    
    // Refresh editor after data is loaded
    setTimeout(() => this.refreshEditors(), 100);
  }

  createScript(): void {
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.selectedScript.set(null);
    this.isTesting.set(false);
    
    // Reset form with default template code based on selected language
    const defaultLanguage = 'javascript'; // Ensure lowercase
    this.scriptForm.reset({
      id: null, // Explicitly set to null
      type: this.selectedType(),
      language: defaultLanguage,
      content: this.getCodeSnippet(defaultLanguage),
      tags: '' // Reset tags as empty string
    });
    
    // Update editor mode
    this.updateEditorMode(defaultLanguage);
    
    // Refresh editor after data is reset
    setTimeout(() => this.refreshEditors(), 100);
  }
  
  // Get code snippet safely with type checking
  getCodeSnippet(language: string): string {
    if (language in this.codeSnippets) {
      return this.codeSnippets[language];
    }
    return '// Please enter your code here';
  }

  editScript(): void {
    this.isEditing.set(true);
    this.isCreating.set(false);
    this.isTesting.set(false);
    
    // Refresh editor after switching to edit mode
    setTimeout(() => this.refreshEditors(), 100);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.isCreating.set(false);
    
    const currentScript = this.selectedScript();
    if (currentScript) {
      this.scriptForm.patchValue(currentScript as any);
      
      // Refresh editor after data is reset
      setTimeout(() => this.refreshEditors(), 100);
    } else {
      // If cancelling a new script creation, clear selection
      this.selectedScript.set(null);
    }
  }

  saveScript(): void {
    if (!this.validateForm()) {
      return;
    }

    // Process tags from string format to array before saving
    const formValue = { ...this.scriptForm.value };
    
    // Force language to lowercase to match backend enum
    formValue.language = formValue.language.toLowerCase();
    
    const tagString: string = formValue.tags || '';
    
    // Extract tags by finding words that start with # and removing the # symbol
    const tagArray = tagString
      .split(/\s+/) // Split by whitespace
      .filter(word => word.startsWith('#') && word.length > 1) // Find words starting with #
      .map(tag => tag.substring(1)); // Remove the # symbol
    
    // Create a new script object with proper handling of the id field
    const scriptData: Script = {
      ...formValue,
      tags: tagArray
    };
    
    // When creating new script, remove the id field to let the server generate it
    if (this.isCreating()) {
      delete scriptData.id; // Delete the id field so the server will generate a new one
    }
    
    this.loading.set(true);

    const saveObs = this.isCreating() 
      ? this.extractionService.createScript(scriptData)
      : this.extractionService.updateScript(scriptData);

    saveObs.pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (savedScript: Script) => {
          this.message.success(`脚本${this.isCreating() ? '创建' : '更新'}成功`);
          this.loadScripts(this.selectedType());
          this.selectedScript.set(savedScript);
          this.isEditing.set(false);
          this.isCreating.set(false);
        },
        error: (error: any) => {
          this.handleError(error, `${this.isCreating() ? '创建' : '更新'}脚本失败`);
        }
      });
  }

  deleteScript(): void {
    const script = this.selectedScript();
    if (!script || !script.id) {
      return;
    }

    if (!confirm(`确定要删除脚本 "${script.name}" 吗？此操作不可恢复。`)) {
      return;
    }

    this.loading.set(true);
    this.extractionService.deleteScript(script.id as string)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('脚本删除成功');
          this.selectedScript.set(null);
          this.loadScripts(this.selectedType());
        },
        error: (error: any) => {
          this.handleError(error, '删除脚本失败');
        }
      });
  }

  testScript(): void {
    if (this.scriptForm.invalid) {
      this.message.warning('请完成所有必填字段后再进行测试');
      return;
    }

    // Ensure the language value matches the expected enum value
    const scriptData = { ...this.scriptForm.value };
    
    // Validate language matches allowed values
    if (!['javascript', 'python', 'sql'].includes(scriptData.language?.toLowerCase())) {
      this.message.error('不支持的脚本语言，请选择 javascript, python 或 sql');
      return;
    }
    
    // Force lowercase to match enum values
    scriptData.language = scriptData.language.toLowerCase();
    
    // Parse sample data from textarea
    let sampleDataObj;
    try {
      const sampleDataStr = this.sampleData().trim();
      if (!sampleDataStr) {
        this.message.warning('请提供测试数据');
        return;
      }
      
      sampleDataObj = JSON.parse(sampleDataStr);
    } catch (e) {
      this.message.error('无效的JSON格式，请检查测试数据');
      return;
    }

    this.loading.set(true);
    this.extractionService.testScript(scriptData, sampleDataObj)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result: ScriptExecutionResult) => {
          this.testResult.set(result);
        },
        error: (error: any) => {
          this.handleError(error, '脚本测试失败');
          this.testResult.set(null);
        }
      });
  }

  updateEditorMode(language: string): void {
    let mode: string | object = 'javascript';
    switch (language) {
      case 'python':
        mode = 'python';
        break;
      case 'sql':
        mode = 'text/x-sql';
        break;
      default:
        mode = 'javascript';
    }
    
    this.editorOptions = {
      ...this.editorOptions,
      mode: mode
    };
  }

  // Handle language change - update editor and code template
  onLanguageChange(language: string): void {
    this.updateEditorMode(language);
    
    // Only update content if creating new script and content is empty or default
    if (this.isCreating()) {
      const currentContent = this.scriptForm.get('content')?.value || '';
      const isDefaultSnippet = Object.values(this.codeSnippets).includes(currentContent);
      
      if (!currentContent || isDefaultSnippet) {
        this.scriptForm.patchValue({
          content: this.getCodeSnippet(language)
        });
      }
    }
    
    // Refresh editor after language change
    setTimeout(() => this.refreshEditors(), 100);
  }

  // Get description for the selected script type
  getTypeDescription(type: string): string {
    const typeObj = this.scriptTypes().find(t => t.value === type);
    return typeObj?.description || '';
  }

  // Get label for the selected script type
  getTypeLabel(type: string): string {
    const typeObj = this.scriptTypes().find(t => t.value === type);
    return typeObj?.label || '';
  }

  // Get language-specific tips
  getLanguageTips(language: string): string {
    switch (language) {
      case 'javascript':
        return '使用 processData(data) 函数处理输入数据，该函数应该返回处理结果。';
      case 'python':
        return '使用 process_data(data) 函数处理输入数据，该函数应该返回处理结果。';
      case 'sql':
        return 'SQL脚本应该从 input_data 表中查询，并生成结果数据集。';
      default:
        return '请输入处理数据的代码逻辑。';
    }
  }

  // Get icon for different script types - enhanced with icon prefix
  getTypeIcon(type: string): string {
    switch (type) {
      case 'extraction':
        return 'fto-filter';
      case 'transformation':
        return 'fto-refresh-cw';
      case 'cleaning':
        return 'fto-sliders';
      default:
        return 'fto-code';
    }
  }
  
  // Find and refresh all CodeMirror instances
  private refreshEditors(): void {
    // Only refresh result editor if present
    const cmElements = document.querySelectorAll('.result-editor .CodeMirror');
    cmElements.forEach(el => {
      const cm = (el as any).CodeMirror;
      if (cm) {
        cm.refresh();
      }
    });
  }
  
  // Generic error handler with friendly messages
  private handleError(error: any, fallbackMessage: string): void {
    console.error(error);
    
    let errorMessage = fallbackMessage;
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    this.message.error(errorMessage);
  }

  ngOnDestroy(): void {
    // Clean up any resources
  }

  // Form validation helper
  validateForm(): boolean {
    if (this.scriptForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.scriptForm.controls).forEach(key => {
        const control = this.scriptForm.get(key);
        control?.markAsTouched();
      });
      
      this.message.warning('请完成所有必填字段并修正错误');
      return false;
    }
    return true;
  }
}