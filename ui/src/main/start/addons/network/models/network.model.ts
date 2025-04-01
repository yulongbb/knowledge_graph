export interface NetworkPacket {
  id: number;
  netName: string;
  srcMac: string;
  dstMac: string;
  srcIp: string;
  dstIp: string;
  protocol: string;
  srcPort: string;
  dstPort: string;
  date: string;
}

export interface NetworkPacketPage {
  content: NetworkPacket[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}

export interface ApiResponse<T> {
  msg: string;
  code: number;
  data: T;
}

export interface IpFrequency {
  srcIp: string;
  dstIp: string;
  count: number;
}

export interface TimeBasedFrequency {
  [timeKey: string]: IpFrequency[];
}
