export interface TicketsData {
  gauge: number;
  maxGauge: number;
  level: number;
  ticketList: TicketData[];
}

export interface TicketData {
  ticketIdx: number;
  ticketType: number;
  ticketName: string;
  imgUrl: string;
  value: number;
  startDate: string;
  endDate: string;
}

export interface TicketUseResponse {
  cash: number;
}
