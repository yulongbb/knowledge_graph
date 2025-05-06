import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExtractionService extends RepositoryService<Extraction> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/extraction' } });
  }
  
  // Helper method to get base controller name
  private get controllerName(): string {
    return this.option?.controller?.name || 'api/extraction';
  }
  
  // Get all script types
  getScriptTypes(): Observable<ScriptType[]> {
    return this.http.get(`${this.controllerName}/script-types`);
  }
  
  // Get scripts by type
  getScripts(type: string): Observable<Script[]> {
    return this.http.get(`${this.controllerName}/scripts`, { type });
  }
  
  // Create new script
  createScript(script: Script): Observable<Script> {
    // Ensure id is not present in the request body and language is lowercase
    const { id, ...scriptData } = script;
    
    // Force language to lowercase to match enum in database
    if (scriptData.language) {
      scriptData.language = scriptData.language.toLowerCase() as 'javascript' | 'python' | 'sql';
    }
  
    return this.http.post(`${this.controllerName}/scripts`, scriptData);
  }
  
  // Update existing script
  updateScript(script: Script): Observable<Script> {
    if (!script.id) {
      throw new Error('Cannot update script without id');
    }
  
    // Force language to lowercase to match enum in database
    const scriptData = { ...script };
    if (scriptData.language) {
      scriptData.language = scriptData.language.toLowerCase() as 'javascript' | 'python' | 'sql';
    }
    
    return this.http.put(`${this.controllerName}/scripts/${script.id}`, scriptData);
  }
  
  // Delete script
  deleteScript(id: string): Observable<any> {
    return this.http.delete(`${this.controllerName}/scripts/${id}`);
  }
  
  // Test script execution
  testScript(script: Script, sampleData: any): Observable<ScriptExecutionResult> {
    return this.http.post(`${this.controllerName}/scripts/test`, { script, sampleData });
  }
  
  // Run extraction job with script
  runExtractionJob(scriptId: string, data: any): Observable<ScriptExecutionResult> {
    return this.http.post(`${this.controllerName}/jobs/run`, { scriptId, data });
  }
}

export interface Extraction extends XId {
  subject?: string;
  property?: string;
  object?: string;
}

export interface Script extends XId {
  name: string;
  description?: string;
  type: 'extraction' | 'transformation' | 'cleaning';
  content: string;
  language: 'javascript' | 'python' | 'sql'; // Lowercase values as per DB enum
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
}

export interface ScriptType {
  value: string;
  label: string;
  description?: string;
}

export interface ScriptExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: number;
}
