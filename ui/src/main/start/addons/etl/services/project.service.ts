import { Injectable } from '@angular/core';
import { EtlProject } from '../models/project.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects = new BehaviorSubject<EtlProject[]>([]);
  projects$ = this.projects.asObservable();
  
  constructor() {
    this.loadProjects();
  }

  private loadProjects() {
    const stored = localStorage.getItem('etl-projects');
    if (stored) {
      this.projects.next(JSON.parse(stored));
    }
  }

  private saveProjects(projects: EtlProject[]) {
    localStorage.setItem('etl-projects', JSON.stringify(projects));
    this.projects.next(projects);
  }

  createProject(name: string, description: string): EtlProject {
    const project: EtlProject = {
      id: Date.now().toString(),
      name,
      description,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    };

    const current = this.projects.value;
    this.saveProjects([...current, project]);
    return project;
  }

  updateProject(project: EtlProject) {
    const current = this.projects.value;
    const updated = current.map(p => 
      p.id === project.id ? { ...project, updateTime: new Date().toISOString() } : p
    );
    this.saveProjects(updated);
  }

  deleteProject(id: string) {
    const current = this.projects.value;
    this.saveProjects(current.filter(p => p.id !== id));
  }
}
