import { create } from "zustand";

type MonthStore = {
  month: number;
  year: number;
  setMonth: (month: number, year: number) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
};

export const useMonthStore = create<MonthStore>((set, get) => ({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),

  setMonth: (month, year) => set({ month, year }),

  goToPrevMonth: () => {
    const { month, year } = get();
    if (month === 1) set({ month: 12, year: year - 1 });
    else set({ month: month - 1, year });
  },

  goToNextMonth: () => {
    const { month, year } = get();
    if (month === 12) set({ month: 1, year: year + 1 });
    else set({ month: month + 1, year });
  },
}));