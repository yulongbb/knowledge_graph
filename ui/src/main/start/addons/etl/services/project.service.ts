import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { EtlProject } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects = new BehaviorSubject<EtlProject[]>([]);
  projects$ = this.projects.asObservable();
  private apiUrl = '/api/projects';

  constructor(private http: HttpClient) {
    this.loadProjects();
  }

  private loadProjects() {
    this.http.get<EtlProject[]>(this.apiUrl).subscribe(projects => {
      this.projects.next(projects);
    });
  }

  createProject(name: string, description: string): void {
    const project: Partial<EtlProject> = { name, description };
    this.http.post<EtlProject>(this.apiUrl, project).subscribe(newProject => {
      const current = this.projects.value;
      this.projects.next([...current, newProject]);
    });
  }

  updateProject(project: EtlProject): void {
    this.http.put<EtlProject>(`${this.apiUrl}/${project.id}`, project).subscribe(updatedProject => {
      const current = this.projects.value;
      const updated = current.map(p => p.id === updatedProject.id ? updatedProject : p);
      this.projects.next(updated);
    });
  }

  deleteProject(id: string): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe(() => {
      const current = this.projects.value;
      this.projects.next(current.filter(p => p.id !== id));
    });
  }

  saveFlow(projectId: string, flow: any): void {
    this.http.put<EtlProject>(`${this.apiUrl}/${projectId}`, { flow }).subscribe(updatedProject => {
      const current = this.projects.value;
      const updated = current.map(p => p.id === updatedProject.id ? updatedProject : p);
      this.projects.next(updated);
    });
  }

  loadFlow(projectId: string): any {
    return this.http.get<EtlProject>(`${this.apiUrl}/${projectId}`).toPromise().then((project: any) => project.flow);
  }

  saveNodeConfig(projectId: string, nodeId: string, config: any): void {
    this.http.put<EtlProject>(`${this.apiUrl}/${projectId}/nodes/${nodeId}`, { config }).subscribe(updatedProject => {
      const current = this.projects.value;
      const updated = current.map(p => p.id === updatedProject.id ? updatedProject : p);
      this.projects.next(updated);
    });
  }

  loadNodeConfig(projectId: string, nodeId: string): any {
    return this.http.get<EtlProject>(`${this.apiUrl}/${projectId}/nodes/${nodeId}`).toPromise().then((node: any) => node.config);
  }
}
