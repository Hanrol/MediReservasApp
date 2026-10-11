import type { Schedule } from "../types/schedule";

export const mockSchedules: Schedule[] = [
  {
    id: 1,
    doctorId: 1,
    date: "2026-10-09",
    time: "09:00",
    available: false,
  },
  {
    id: 2,
    doctorId: 1,
    date: "2026-10-09",
    time: "10:00",
    available: false,
  },
  {
    id: 3,
    doctorId: 1,
    date: "2026-10-12",
    time: "11:30",
    available: true,
  },
  {
    id: 4,
    doctorId: 1,
    date: "2026-10-13",
    time: "14:00",
    available: true,
  },
  {
    id: 5,
    doctorId: 1,
    date: "2026-10-13",
    time: "15:00",
    available: true,
  },
  {
    id: 6,
    doctorId: 2,
    date: "2026-10-10",
    time: "11:30",
    available: false,
  },
  {
    id: 7,
    doctorId: 2,
    date: "2026-10-12",
    time: "11:30",
    available: true,
  },
  {
    id: 8,
    doctorId: 2,
    date: "2026-10-11",
    time: "16:00",
    available: true,
  },
  {
    id: 9,
    doctorId: 3,
    date: "2026-10-08",
    time: "15:00",
    available: false,
  },
  {
    id: 10,
    doctorId: 3,
    date: "2026-10-15",
    time: "15:00",
    available: true,
  },
];
