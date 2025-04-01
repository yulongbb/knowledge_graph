import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NetworkService } from '../services/network.service';
import { Subscription, interval } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { 
  ApiResponse, 
  IpFrequency, 
  NetworkPacket, 
  NetworkPacketPage, 
  TimeBasedFrequency 
} from '../models/network.model';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
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

  constructor(private networkService: NetworkService) { }

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

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
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
