import { create } from 'zustand';
import type { TicketsData, TicketData } from '@/types';

interface TicketState {
  gauge: number;
  maxGauge: number;
  level: number;
  ticketList: TicketData[];
  count: number;

  setTicketData: (data: TicketsData) => void;
  updateGauge: (gauge: number, maxGauge: number) => void;
  addTickets: (tickets: TicketData[]) => void;
  removeTicket: (ticketIdx: number) => void;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  gauge: 0,
  maxGauge: 0,
  level: 0,
  ticketList: [],
  count: 0,

  setTicketData: (data) =>
    set({
      gauge: data.gauge,
      maxGauge: data.maxGauge,
      level: data.level,
      ticketList: data.ticketList,
      count: data.ticketList.length,
    }),

  updateGauge: (gauge, maxGauge) => set({ gauge, maxGauge }),

  addTickets: (tickets) => {
    const ticketList = [...get().ticketList, ...tickets];
    set({ ticketList, count: ticketList.length });
  },

  removeTicket: (ticketIdx) => {
    const ticketList = get().ticketList.filter((t) => t.ticketIdx !== ticketIdx);
    set({ ticketList, count: ticketList.length });
  },
}));
