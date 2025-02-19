import { Component, HostListener, OnInit } from '@angular/core';
import { EsService } from './es.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css']
})
export class PersonComponent {
  ip = environment.ip;
  searchQuery: string = '';
  query: any = {};
  basicInfo: any = {};
  mediaList: any[] = [];
  selectedMediaIndex: number = 0;
  isVideoPlaying: boolean = false;
  private searchSubject: Subject<string> = new Subject();
  groupedPersons: any[] = [];
  selectedGroup: any = null;
  persons: any[] = [];
  breadcrumb: any[] = [{ label: '分组', link: null }];
  selectedGroupIndex: number = 0;
  selectedPersonIndex: number = -1;

  constructor(private esService: EsService, private router: Router) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      this.performSearch(query);
    });
    this.loadGroupedPersons();
  }


  updateSearchQuery(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  performSearch(query: string) {
    if (!query) {
      this.loadGroupedPersons();
      return;
    }
    this.query = {
      must: [{ match: { 'type': '7eed2cf0-d708-6f48-4aeb-386dcb1165f0' } }, { term: { 'labels.zh.value.keyword': query } }],
    };
    this.esService.searchEntity(1, 10, { bool: this.query }).subscribe(response => {
      console.log(response);
      if (response && response.list && response.list.length > 0) {
        const entity = response.list[0]['_source'];
        this.basicInfo = {
          name: entity.labels.zh.value,
          photo: entity.images && entity.images.length > 0 ? 'http://' + this.ip + ':9000/kgms/' + entity.images[0] : null,
          description: entity.descriptions.zh.value,
        };
        this.mediaList = entity.videos || [];
      } else {
        this.basicInfo = {};
        this.mediaList = [];
      }
      this.updateBreadcrumb();
    });
    // 实现搜索功能，更新人物基本资料和媒体资料列表
    // ...existing code...
  }

  loadGroupedPersons() {
    this.query = {
      must: [{ match: { 'type': '7eed2cf0-d708-6f48-4aeb-386dcb1165f0' } }],
    };
    this.esService.searchEntity(1, 10, { bool: this.query }).subscribe(response => {
      console.log(response);
      this.groupedPersons = response.tags;
      this.selectedGroup = null;
      this.basicInfo = {};
      this.selectedGroupIndex = 0;
      this.updateBreadcrumb();
    });
  }

  selectGroup(index: any) {
    this.selectedGroupIndex = index;

  }
  enterGroup(group: any) {
    this.selectedGroup = group;
    this.updateBreadcrumb();
    this.query = {
      must: [
        { match: { 'type': '7eed2cf0-d708-6f48-4aeb-386dcb1165f0' } },
        { term: { 'tags.keyword': this.selectedGroup.key } } // 使用terms而非term
      ],
    };
    this.esService.searchEntity(1, 10, { bool: this.query }).subscribe(response => {
      console.log(response);
      this.persons = response.list.map((person: any) => {
        if (!person._source.images || person._source.images.length === 0) {
          person._source.images = [null];
        }
        return person;
      });
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.groupedPersons.length > 0 && !this.selectedGroup) {
      if (event.key === 'ArrowRight') {
        this.selectedGroupIndex = (this.selectedGroupIndex + 1) % this.groupedPersons.length;
      } else if (event.key === 'ArrowLeft') {
        this.selectedGroupIndex = (this.selectedGroupIndex - 1 + this.groupedPersons.length) % this.groupedPersons.length;
      } else if (event.key === 'Enter') {
        this.selectGroup(this.groupedPersons[this.selectedGroupIndex]);
      }
    } else if (this.mediaList.length > 0) {
      if (event.key === 'ArrowDown') {
        this.selectedMediaIndex = (this.selectedMediaIndex + 1) % this.mediaList.length;
      } else if (event.key === 'ArrowUp') {
        this.selectedMediaIndex = (this.selectedMediaIndex - 1 + this.mediaList.length) % this.mediaList.length;
      } else if (event.key === 'Enter') {
        this.playVideo(this.selectedMediaIndex);
      } else if (event.key === 'Escape') {
        this.closeVideo();
      }
    }
  }

  playVideo(index: number) {
    this.selectedMediaIndex = index;
    this.isVideoPlaying = true;
    (document.activeElement as HTMLElement).blur(); // Remove focus from the search input
    // Implement video playback logic, e.g., open a modal with the video player
    console.log('Playing video:', this.mediaList[this.selectedMediaIndex].url);
  }

  closeVideo() {
    this.isVideoPlaying = false;
    // Implement logic to close the video player
    console.log('Closing video player');
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getFirstLetter(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '';
  }

  navigateToPerson(person: any, index: number) {
    this.selectedPersonIndex = index;
    this.basicInfo = {
      name: person._source.labels.zh.value,
      photo: person._source.images && person._source.images.length > 0 ? 'http://' + this.ip + ':9000/kgms/' + person._source.images[0] : null,
      description: person._source.descriptions.zh.value,
    };
    this.mediaList = person._source.videos || [];
    this.updateBreadcrumb();
  }

  updateBreadcrumb() {
    this.breadcrumb = [{ label: '首页', link: '/' }];
    if (this.selectedGroup) {
      this.breadcrumb.push({ label: this.selectedGroup.key, link: 'group' });
    }
    if (this.basicInfo.name) {
      this.breadcrumb.push({ label: this.basicInfo.name, link: null });
    }
  }
}
