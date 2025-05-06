import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';
import { EtlProject } from '../models/project.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { XMessageService } from '@ng-nest/ui/message';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProjectService extends RepositoryService<EtlProject> {
  private projects = new BehaviorSubject<EtlProject[]>([]);
  projects$ = this.projects.asObservable();

  constructor(
    public override http: HttpService,
    private message: XMessageService
  ) {
    super(http, { controller: { name: 'api/projects' } });
    this.loadProjects();
  }

  loadProjects() {
    this.getList()
      .pipe(
        catchError(error => {
          this.message.error(`加载项目失败: ${error.message || '未知错误'}`);
          return of({ list: [] });
        })
      )
      .subscribe((result: any) => {
        this.projects.next(result.list || []);
      });
  }

  createProject(name: string, description: string): Observable<EtlProject> {
    const projectData: Partial<EtlProject> = { 
      name, 
      description,
      flow: { nodes: [], edges: [] }
    };
    
    return this.post(projectData as EtlProject).pipe(
      tap((newProject: EtlProject) => {
        const current = this.projects.value;
        this.projects.next([...current, newProject]);
      })
    );
  }

  updateProject(project: EtlProject): Observable<EtlProject> {
    return this.put(project).pipe(
      tap((updatedProject: EtlProject) => {
        const current = this.projects.value;
        const updated = current.map(p => p.id === updatedProject.id ? updatedProject : p);
        this.projects.next(updated);
      })
    );
  }

  deleteProject(id: string): Observable<any> {
    return this.delete(id).pipe(
      tap(() => {
        const current = this.projects.value;
        this.projects.next(current.filter(p => p.id !== id));
      })
    );
  }

  saveFlow(projectId: string, flow: any): Observable<EtlProject> {
    return this.http.put(`${this.option.controller?.name}/${projectId}`, { flow }) as Observable<EtlProject>;
  }

  saveNodeConfig(projectId: string, nodeId: string, config: any): Observable<any> {
    return this.get(projectId).pipe(
      switchMap((project: EtlProject) => {
        if (project?.flow?.nodes) {
          const node = project.flow.nodes.find((n: any) => n.id === nodeId);
          if (node) {
            node.properties = config;
            return this.saveFlow(projectId, project.flow);
          }
        }
        return of(null);
      })
    );
  }

  async loadNodeConfig(projectId: string, nodeId: string): Promise<any> {
    try {
      const project = await this.get(projectId).toPromise();
      if (project?.flow?.nodes) {
        const node = project.flow.nodes.find((n: any) => n.id === nodeId);
        return node ? node.properties : {};
      }
      return {};
    } catch (error: any) {
      this.message.error(`加载节点配置失败: ${error.message || '未知错误'}`);
      return {};
    }
  }
}
