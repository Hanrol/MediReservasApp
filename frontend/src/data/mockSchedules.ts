import type { Schedule } from "../types/schedule";

export const mockSchedules: Schedule[] = [
  {
    id: "schedule-001",
    doctorId: "doctor-001",
    date: "2026-10-12",
    time: "09:00",
    available: true,
  },
  {
    id: "schedule-002",
    doctorId: "doctor-001",
    date: "2026-10-12",
    time: "10:00",
    available: true,
  },
  {
    id: "schedule-003",
    doctorId: "doctor-001",
    date: "2026-10-12",
    time: "11:30",
    available: true,
  },
  {
    id: "schedule-004",
    doctorId: "doctor-001",
    date: "2026-10-13",
    time: "14:00",
    available: true,
  },
  {
    id: "schedule-005",
    doctorId: "doctor-001",
    date: "2026-10-13",
    time: "15:00",
    available: true,
  },
  {
    id: "schedule-006",
    doctorId: "doctor-002",
    date: "2026-10-12",
    time: "09:00",
    available: true,
  },
  {
    id: "schedule-007",
    doctorId: "doctor-002",
    date: "2026-10-12",
    time: "11:30",
    available: true,
  },
  {
    id: "schedule-008",
    doctorId: "doctor-002",
    date: "2026-10-14",
    time: "16:00",
    available: true,
  },
  {
    id: "schedule-009",
    doctorId: "doctor-003",
    date: "2026-10-12",
    time: "10:00",
    available: true,
  },
  {
    id: "schedule-010",
    doctorId: "doctor-003",
    date: "2026-10-15",
    time: "15:00",
    available: true,
  },
];