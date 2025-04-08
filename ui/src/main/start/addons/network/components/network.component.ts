import { Component, OnInit, OnDestroy } from '@angular/core';
import { NetworkService } from '../services/network.service';
import { Subscription, interval } from 'rxjs';
import { 
  ApiResponse, 
  IpFrequency, 
  NetworkPacket, 
  NetworkPacketPage, 
  TimeBasedFrequency 
} from '../models/network.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss'],
  providers: [DatePipe]
})
export class NetworkComponent implements OnInit, OnDestroy {
  // Packets data
  networkPackets: NetworkPacket[] = [];
  totalElements: number = 0;
  pageSize: number = 20;
  pageIndex: number = 0;
  
  // Frequencies
  ipFrequencies: IpFrequency[] = [];
  weeklyFrequencies: TimeBasedFrequency = {};
  hourlyFrequencies: TimeBasedFrequency = {};

  // Tab navigation
  activeTab: 'charts' | 'packets' = 'charts';

  isMonitoring = false;
  refreshInterval = 5000; // 5 seconds
  private monitoringSubscription: Subscription | null = null;
  displayedColumns: string[] = ['id', 'netName', 'srcIp', 'dstIp', 'protocol', 'srcPort', 'dstPort', 'date'];

  constructor(
    private networkService: NetworkService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.refreshNetworkData();
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }

  refreshNetworkData(): void {
    this.loadNetworkPackets();
    this.loadIpFrequencies();
    this.loadWeeklyFrequencies();
    this.loadHourlyFrequencies();
  }

  loadNetworkPackets(): void {
    this.networkService.getNetworkPackets(this.pageIndex, this.pageSize)
      .subscribe((response: ApiResponse<NetworkPacketPage>) => {
        if (response && response.data) {
          this.networkPackets = response.data.content;
          this.totalElements = response.data.totalElements;
        }
      });
  }

  loadIpFrequencies(): void {
    this.networkService.getIpFrequency()
      .subscribe((response: ApiResponse<IpFrequency[]>) => {
        if (response && response.data) {
          this.ipFrequencies = response.data;
        }
      });
  }

  loadWeeklyFrequencies(): void {
    this.networkService.getWeeklyFrequency()
      .subscribe((response: ApiResponse<TimeBasedFrequency>) => {
        if (response && response.data) {
          this.weeklyFrequencies = response.data;
        }
      });
  }

  loadHourlyFrequencies(): void {
    this.networkService.getHourlyFrequency()
      .subscribe((response: ApiResponse<TimeBasedFrequency>) => {
        if (response && response.data) {
          this.hourlyFrequencies = response.data;
        }
      });
  }

  onPreviousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadNetworkPackets();
    }
  }

  onNextPage(): void {
    if ((this.pageIndex + 1) * this.pageSize < this.totalElements) {
      this.pageIndex++;
      this.loadNetworkPackets();
    }
  }

  onSelectPageSize(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onPageSizeChange(target.value);
  }

  onPageSizeChange(value: any): void {
    // Convert string to number if needed
    this.pageSize = typeof value === 'string' ? parseInt(value, 10) : value;
    this.pageIndex = 0; // Reset to first page when changing page size
    this.loadNetworkPackets();
  }

  startMonitoring(): void {
    this.isMonitoring = true;
    this.monitoringSubscription = interval(this.refreshInterval)
      .subscribe(() => {
        this.refreshNetworkData();
      });
  }

  stopMonitoring(): void {
    if (this.monitoringSubscription) {
      this.monitoringSubscription.unsubscribe();
      this.monitoringSubscription = null;
    }
    this.isMonitoring = false;
  }

  testConnection(network: any): void {
    this.networkService.testConnection(network.id).subscribe(result => {
      const index = this.networkPackets.findIndex(n => n.id === network.id);
      if (index !== -1) {
        // Update the packet with test results
      }
    });
  }
}
