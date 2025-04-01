import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiResponse, IpFrequency, NetworkPacketPage, TimeBasedFrequency } from '../models/network.model';

@Injectable({
    providedIn: 'root'
})
export class NetworkService {
    constructor() { }

    getNetworkPackets(page: number = 0, size: number = 20): Observable<ApiResponse<NetworkPacketPage>> {
        const staticData: ApiResponse<NetworkPacketPage> = {
            "msg": "操作成功",
            "code": 200,
            "data": {
                "content": [
                    {
                        "id": 23904,
                        "netName": "veth6116042",
                        "srcMac": "02:42:ac:14:00:12",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.18",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "43250 (unknown)",
                        "dstPort": "8848 (unknown)",
                        "date": "2025-04-01T00:02:25.000+00:00"
                    },
                    {
                        "id": 23891,
                        "netName": "veth6116042",
                        "srcMac": "02:42:ac:14:00:12",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.18",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "44842 (unknown)",
                        "dstPort": "27017 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23894,
                        "netName": "veth6116042",
                        "srcMac": "02:42:ac:14:00:12",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.18",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "43200 (unknown)",
                        "dstPort": "8848 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23901,
                        "netName": "veth6116042",
                        "srcMac": "02:42:68:e2:56:8c",
                        "dstMac": "02:42:ac:14:00:12",
                        "srcIp": "/172.100.0.137",
                        "dstIp": "/172.20.0.18",
                        "protocol": "TCP",
                        "srcPort": "8848 (unknown)",
                        "dstPort": "43200 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23893,
                        "netName": "veth6116042",
                        "srcMac": "02:42:ac:14:00:12",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.18",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "43250 (unknown)",
                        "dstPort": "8848 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23900,
                        "netName": "veth6116042",
                        "srcMac": "02:42:ac:14:00:12",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.18",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "43256 (unknown)",
                        "dstPort": "8848 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23892,
                        "netName": "veth6116042",
                        "srcMac": "02:42:ac:14:00:12",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.18",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "43256 (unknown)",
                        "dstPort": "8848 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23895,
                        "netName": "veth6116042",
                        "srcMac": "02:42:68:e2:56:8c",
                        "dstMac": "02:42:ac:14:00:12",
                        "srcIp": "/172.100.0.137",
                        "dstIp": "/172.20.0.18",
                        "protocol": "TCP",
                        "srcPort": "8848 (unknown)",
                        "dstPort": "43256 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23897,
                        "netName": "veth6116042",
                        "srcMac": "02:42:68:e2:56:8c",
                        "dstMac": "02:42:ac:14:00:12",
                        "srcIp": "/172.100.0.137",
                        "dstIp": "/172.20.0.18",
                        "protocol": "TCP",
                        "srcPort": "8848 (unknown)",
                        "dstPort": "43256 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23890,
                        "netName": "veth6116042",
                        "srcMac": "02:42:68:e2:56:8c",
                        "dstMac": "02:42:ac:14:00:12",
                        "srcIp": "/172.100.0.137",
                        "dstIp": "/172.20.0.18",
                        "protocol": "TCP",
                        "srcPort": "27017 (unknown)",
                        "dstPort": "44842 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23898,
                        "netName": "veth6116042",
                        "srcMac": "02:42:68:e2:56:8c",
                        "dstMac": "02:42:ac:14:00:12",
                        "srcIp": "/172.100.0.137",
                        "dstIp": "/172.20.0.18",
                        "protocol": "TCP",
                        "srcPort": "8848 (unknown)",
                        "dstPort": "43250 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23899,
                        "netName": "veth6116042",
                        "srcMac": "02:42:68:e2:56:8c",
                        "dstMac": "02:42:ac:14:00:12",
                        "srcIp": "/172.100.0.137",
                        "dstIp": "/172.20.0.18",
                        "protocol": "TCP",
                        "srcPort": "8848 (unknown)",
                        "dstPort": "43200 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23902,
                        "netName": "veth6116042",
                        "srcMac": "02:42:ac:14:00:12",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.18",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "43250 (unknown)",
                        "dstPort": "8848 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23889,
                        "netName": "veth6116042",
                        "srcMac": "02:42:ac:14:00:12",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.18",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "44842 (unknown)",
                        "dstPort": "27017 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23896,
                        "netName": "veth6116042",
                        "srcMac": "02:42:68:e2:56:8c",
                        "dstMac": "02:42:ac:14:00:12",
                        "srcIp": "/172.100.0.137",
                        "dstIp": "/172.20.0.18",
                        "protocol": "TCP",
                        "srcPort": "8848 (unknown)",
                        "dstPort": "43250 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23903,
                        "netName": "veth6116042",
                        "srcMac": "02:42:ac:14:00:12",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.18",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "43200 (unknown)",
                        "dstPort": "8848 (unknown)",
                        "date": "2025-04-01T00:02:23.000+00:00"
                    },
                    {
                        "id": 23874,
                        "netName": "veth97309e9",
                        "srcMac": "02:42:68:e2:56:8c",
                        "dstMac": "02:42:ac:14:00:0a",
                        "srcIp": "/172.100.0.137",
                        "dstIp": "/172.20.0.10",
                        "protocol": "TCP",
                        "srcPort": "9092 (unknown)",
                        "dstPort": "56270 (unknown)",
                        "date": "2025-04-01T00:02:16.000+00:00"
                    },
                    {
                        "id": 23871,
                        "netName": "veth97309e9",
                        "srcMac": "02:42:68:e2:56:8c",
                        "dstMac": "02:42:ac:14:00:0a",
                        "srcIp": "/172.100.0.137",
                        "dstIp": "/172.20.0.10",
                        "protocol": "TCP",
                        "srcPort": "9092 (unknown)",
                        "dstPort": "56250 (unknown)",
                        "date": "2025-04-01T00:02:16.000+00:00"
                    },
                    {
                        "id": 23870,
                        "netName": "veth97309e9",
                        "srcMac": "02:42:ac:14:00:0a",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.10",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "56278 (unknown)",
                        "dstPort": "9092 (unknown)",
                        "date": "2025-04-01T00:02:16.000+00:00"
                    },
                    {
                        "id": 23873,
                        "netName": "veth97309e9",
                        "srcMac": "02:42:ac:14:00:0a",
                        "dstMac": "02:42:68:e2:56:8c",
                        "srcIp": "/172.20.0.10",
                        "dstIp": "/172.100.0.137",
                        "protocol": "TCP",
                        "srcPort": "56270 (unknown)",
                        "dstPort": "9092 (unknown)",
                        "date": "2025-04-01T00:02:16.000+00:00"
                    }
                ],
                "pageable": {
                    "sort": {
                        "sorted": true,
                        "unsorted": false,
                        "empty": false
                    },
                    "pageNumber": 0,
                    "pageSize": 20,
                    "offset": 0,
                    "unpaged": false,
                    "paged": true
                },
                "totalPages": 839,
                "totalElements": 16774,
                "last": false,
                "first": true,
                "sort": {
                    "sorted": true,
                    "unsorted": false,
                    "empty": false
                },
                "numberOfElements": 20,
                "size": 20,
                "number": 0,
                "empty": false
            }
        };
        return of(staticData).pipe(delay(300));
    }

    getIpFrequency(): Observable<ApiResponse<IpFrequency[]>> {
        const staticData: ApiResponse<IpFrequency[]> = {
            "msg": "操作成功",
            "code": 200,
            "data": [
                {
                    "srcIp": "/172.100.0.137",
                    "dstIp": "/172.20.0.6",
                    "count": 9970
                },
                {
                    "srcIp": "/172.100.0.137",
                    "count": 1258,
                    "dstIp": "/172.19.0.2"
                },
                {
                    "srcIp": "/172.19.0.2",
                    "count": 924,
                    "dstIp": "/172.100.0.137"
                },
                {
                    "count": 617,
                    "srcIp": "/172.20.0.10",
                    "dstIp": "/172.100.0.137"
                },
                {
                    "srcIp": "/172.100.0.137",
                    "count": 556,
                    "dstIp": "/172.20.0.10"
                },
                {
                    "count": 414,
                    "dstIp": "/172.100.0.137",
                    "srcIp": "/172.20.0.6"
                },
                {
                    "srcIp": "/172.100.0.137",
                    "dstIp": "/172.20.0.21",
                    "count": 359
                },
                {
                    "srcIp": "/172.20.0.21",
                    "count": 238,
                    "dstIp": "/172.100.0.137"
                },
                {
                    "srcIp": "/172.19.0.2",
                    "dstIp": "/172.16.1.48",
                    "count": 222
                },
                {
                    "dstIp": "/172.19.0.2",
                    "srcIp": "/172.16.1.48",
                    "count": 215
                },
                {
                    "count": 201,
                    "srcIp": "/172.20.0.18",
                    "dstIp": "/172.100.0.137"
                },
                {
                    "srcIp": "/172.100.0.137",
                    "count": 174,
                    "dstIp": "/172.20.0.3"
                },
                {
                    "count": 168,
                    "srcIp": "/172.100.0.137",
                    "dstIp": "/172.20.0.18"
                },
                {
                    "srcIp": "/172.20.0.3",
                    "dstIp": "/172.100.0.137",
                    "count": 118
                },
                {
                    "srcIp": "/172.16.1.34",
                    "count": 108,
                    "dstIp": "/172.19.0.2"
                },
                {
                    "srcIp": "/172.19.0.2",
                    "count": 106,
                    "dstIp": "/172.16.1.34"
                },
                {
                    "srcIp": "/172.20.0.11",
                    "count": 81,
                    "dstIp": "/172.100.0.137"
                },
                {
                    "srcIp": "/172.20.0.20",
                    "dstIp": "/172.100.0.137",
                    "count": 70
                },
                {
                    "dstIp": "/172.100.0.137",
                    "count": 70,
                    "srcIp": "/172.20.0.14"
                },
                {
                    "srcIp": "/172.20.0.12",
                    "count": 66,
                    "dstIp": "/172.100.0.137"
                },
                {
                    "count": 61,
                    "dstIp": "/172.100.0.137",
                    "srcIp": "/172.20.0.17"
                },
                {
                    "count": 61,
                    "dstIp": "/172.20.0.6",
                    "srcIp": "/172.16.1.48"
                },
                {
                    "count": 59,
                    "srcIp": "/172.20.0.19",
                    "dstIp": "/172.100.0.137"
                },
                {
                    "count": 58,
                    "dstIp": "/172.20.0.3",
                    "srcIp": "/172.16.1.48"
                },
                {
                    "srcIp": "/172.100.0.137",
                    "count": 50,
                    "dstIp": "/172.20.0.11"
                },
                {
                    "dstIp": "/172.16.1.48",
                    "count": 49,
                    "srcIp": "/172.20.0.6"
                },
                {
                    "count": 48,
                    "dstIp": "/172.100.0.137",
                    "srcIp": "/172.20.0.15"
                },
                {
                    "srcIp": "/172.100.0.137",
                    "count": 43,
                    "dstIp": "/172.20.0.14"
                },
                {
                    "count": 40,
                    "srcIp": "/172.100.0.137",
                    "dstIp": "/172.20.0.12"
                },
                {
                    "srcIp": "/172.100.0.137",
                    "dstIp": "/172.20.0.20",
                    "count": 39
                },
                {
                    "srcIp": "/172.100.0.137",
                    "dstIp": "/172.20.0.19",
                    "count": 38
                },
                {
                    "srcIp": "/172.20.0.13",
                    "dstIp": "/172.100.0.137",
                    "count": 37
                },
                {
                    "srcIp": "/172.100.0.137",
                    "dstIp": "/172.20.0.17",
                    "count": 37
                },
                {
                    "dstIp": "/172.20.0.8",
                    "srcIp": "/172.20.0.9",
                    "count": 36
                },
                {
                    "srcIp": "/172.20.0.3",
                    "dstIp": "/172.16.1.48",
                    "count": 32
                },
                {
                    "srcIp": "/172.16.1.34",
                    "count": 29,
                    "dstIp": "/172.20.0.3"
                },
                {
                    "srcIp": "/172.100.0.137",
                    "dstIp": "/172.20.0.15",
                    "count": 22
                },
                {
                    "srcIp": "/172.20.0.3",
                    "dstIp": "/172.16.1.34",
                    "count": 18
                },
                {
                    "srcIp": "/172.16.1.32",
                    "count": 15,
                    "dstIp": "/172.20.0.3"
                },
                {
                    "dstIp": "/172.20.0.9",
                    "count": 15,
                    "srcIp": "/172.20.0.8"
                },
                {
                    "srcIp": "/172.100.0.137",
                    "count": 14,
                    "dstIp": "/172.20.0.13"
                },
                {
                    "count": 10,
                    "dstIp": "/172.20.0.14",
                    "srcIp": "/172.20.0.18"
                },
                {
                    "count": 8,
                    "srcIp": "/172.20.0.3",
                    "dstIp": "/172.16.1.32"
                },
                {
                    "dstIp": "/172.20.0.18",
                    "srcIp": "/172.20.0.14",
                    "count": 7
                },
                {
                    "srcIp": "/172.100.0.137",
                    "dstIp": "/172.19.0.3",
                    "count": 6
                },
                {
                    "dstIp": "/172.100.0.137",
                    "srcIp": "/172.19.0.3",
                    "count": 6
                },
                {
                    "dstIp": "/172.20.0.4",
                    "count": 1,
                    "srcIp": "/172.16.1.48"
                }
            ]
        }
            ;
        return of(staticData).pipe(delay(300));
    }

    getWeeklyFrequency(): Observable<ApiResponse<TimeBasedFrequency>> {
        const staticData: ApiResponse<TimeBasedFrequency> = {
            "msg": "操作成功",
            "code": 200,
            "data": {
                "2025-03-31": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 3920,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 459,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 344,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 336,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 306,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 173,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-04-01": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 6050,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 799,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 588,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 345,
                        "dstIp": "/172.20.0.21"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 273,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 250,
                        "dstIp": "/172.20.0.10"
                    }
                ]
            }
        }
            ;
        return of(staticData).pipe(delay(300));
    }

    getHourlyFrequency(): Observable<ApiResponse<TimeBasedFrequency>> {
        const staticData: ApiResponse<TimeBasedFrequency> = {
            "msg": "操作成功",
            "code": 200,
            "data": {
                "2025-04-01 08": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 866,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 88,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 71,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 65,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 56,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 22,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-04-01 06": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 529,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 86,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 64,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 29,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.18",
                        "count": 28,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 22,
                        "dstIp": "/172.20.0.18"
                    }
                ],
                "2025-04-01 07": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 516,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 91,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 64,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 28,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 22,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 21,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-04-01 04": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 648,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 70,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 52,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 32,
                        "dstIp": "/172.16.1.48"
                    },
                    {
                        "srcIp": "/172.16.1.48",
                        "count": 30,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 24,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-04-01 05": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 887,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 73,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 52,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 25,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.16.1.34",
                        "count": 16,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 16,
                        "dstIp": "/172.16.1.34"
                    }
                ],
                "2025-04-01 02": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 533,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 118,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 84,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 58,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 50,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 31,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-04-01 03": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 501,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 88,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 58,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 32,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.18",
                        "count": 29,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 26,
                        "dstIp": "/172.20.0.18"
                    }
                ],
                "2025-04-01 00": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 699,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 74,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 61,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 61,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 53,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 25,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-04-01 01": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 871,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 312,
                        "dstIp": "/172.20.0.21"
                    },
                    {
                        "srcIp": "/172.20.0.21",
                        "count": 166,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 111,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 82,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 45,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-03-31 20": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 658,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 71,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 59,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 54,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 54,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 33,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-03-31 21": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 793,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 76,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 56,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 51,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 44,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 25,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-03-31 22": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 499,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 93,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 65,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 57,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 51,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 31,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-03-31 23": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 507,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 78,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 61,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 55,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 52,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 29,
                        "dstIp": "/172.100.0.137"
                    }
                ],
                "2025-03-31 18": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 681,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 74,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 57,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 53,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 48,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 26,
                        "dstIp": "/172.16.1.48"
                    }
                ],
                "2025-03-31 19": [
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 782,
                        "dstIp": "/172.20.0.6"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 67,
                        "dstIp": "/172.19.0.2"
                    },
                    {
                        "srcIp": "/172.20.0.10",
                        "count": 63,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.100.0.137",
                        "count": 57,
                        "dstIp": "/172.20.0.10"
                    },
                    {
                        "srcIp": "/172.19.0.2",
                        "count": 49,
                        "dstIp": "/172.100.0.137"
                    },
                    {
                        "srcIp": "/172.20.0.6",
                        "count": 34,
                        "dstIp": "/172.100.0.137"
                    }
                ]
            }
        };
        return of(staticData).pipe(delay(300));
    }

    testConnection(nodeId: number): Observable<any> {
        const staticResponse = { success: true, message: `Tested connection for node ${nodeId}` };
        return of(staticResponse).pipe(delay(300));
    }
}
