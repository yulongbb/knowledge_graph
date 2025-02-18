import { Component, HostListener } from '@angular/core';
import { EsService } from './es.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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

  constructor(private esService: EsService) {
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
      should: [{ term: { 'labels.zh.value.keyword': query } }],
    };
    this.esService.searchEntity(1, 10, { bool: this.query }).subscribe(response => {
      console.log(response);
      if (response && response.list && response.list.length > 0) {
        const entity = response.list[0]['_source'];
        this.basicInfo = {
          name: entity.labels.zh.value,
          photo: 'http://' + this.ip + ':9000/kgms/' + entity.images[0],
          description: entity.descriptions.zh.value,
        };
        this.mediaList = entity.videos || [];
      } else {
        this.basicInfo = {};
        this.mediaList = [];
      }
    });
    // 实现搜索功能，更新人物基本资料和媒体资料列表
    // ...existing code...
  }

  loadGroupedPersons() {
    // Load grouped persons data
    this.groupedPersons = [
      { name: 'Group 1', persons: [{ name: 'Person 1' }, { name: 'Person 2' }] },
      { name: 'Group 2', persons: [{ name: 'Person 3' }, { name: 'Person 4' }] }
    ];
  }

  selectGroup(group: any) {
    this.selectedGroup = group;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.mediaList.length > 0) {
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
}
