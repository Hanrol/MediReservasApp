import {BASE_APPOINTMENTS} from "./mock-data.js";

const SCHEDULE_SLOTS_KEY = "medireservas_schedule_slots";

const SLOT_TEMPLATES = Object.freeze([
    {scheduleSlotId: 7, doctorId: 1, dayOffset: 1, startTime: "09:00:00", endTime: "09:30:00"},
    {scheduleSlotId: 8, doctorId: 1, dayOffset: 1, startTime: "10:00:00", endTime: "10:30:00"},
    {scheduleSlotId: 9, doctorId: 1, dayOffset: 2, startTime: "14:00:00", endTime: "14:30:00"},
    {scheduleSlotId: 10, doctorId: 2, dayOffset: 1, startTime: "10:00:00", endTime: "10:30:00"},
    {scheduleSlotId: 11, doctorId: 2, dayOffset: 2, startTime: "15:00:00", endTime: "15:30:00"},
    {scheduleSlotId: 12, doctorId: 2, dayOffset: 3, startTime: "16:00:00", endTime: "16:30:00"}
]);

function getDateWithOffset(dayOffset) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function initializeBaseScheduleSlots() {
    const reservedSlots = BASE_APPOINTMENTS.map((appointment) => ({
        scheduleSlotId: appointment.scheduleSlotId,
        doctorId: appointment.doctorId,
        slotDate: appointment.date,
        startTime: `${appointment.time}:00`,
        endTime: `${String(Number(appointment.time.slice(0, 2)) + 1).padStart(2, "0")}:00:00`,
        slotStatus: {
            CANCELLED: "LIBERADO_POR_CANCELACION",
            COMPLETED: "COMPLETADO",
            NO_SHOW: "NO_ASISTIO"
        }[appointment.appointmentStatus] ?? "RESERVADO",
        appointmentId: appointment.appointmentId
    }));
    const availableSlots = SLOT_TEMPLATES.map(({dayOffset, ...slot}) => ({
        ...slot,
        slotDate: getDateWithOffset(dayOffset),
        slotStatus: "DISPONIBLE",
        appointmentId: null
    }));
    const storedSlots = getScheduleSlots();
    if (storedSlots.length) {
        const storedIds = new Set(storedSlots.map(({scheduleSlotId}) => scheduleSlotId));
        const missingReservedSlots = reservedSlots.filter(({scheduleSlotId}) => !storedIds.has(scheduleSlotId));
        if (missingReservedSlots.length) {
            localStorage.setItem(SCHEDULE_SLOTS_KEY, JSON.stringify([...missingReservedSlots, ...storedSlots]));
        }
        return;
    }

    localStorage.setItem(SCHEDULE_SLOTS_KEY, JSON.stringify([...reservedSlots, ...availableSlots]));
}

export function getScheduleSlots() {
    try {
        return JSON.parse(localStorage.getItem(SCHEDULE_SLOTS_KEY)) ?? [];
    } catch {
        return [];
    }
}

export function getAvailableScheduleSlots(doctorId) {
    const today = getDateWithOffset(0);
    return getScheduleSlots().filter(
        (slot) =>
            slot.doctorId === Number(doctorId) &&
            slot.slotDate >= today &&
            ["DISPONIBLE", "LIBERADO_POR_CANCELACION"].includes(slot.slotStatus)
    );
}

export function reserveScheduleSlot(scheduleSlotId, appointmentId) {
    const slots = getScheduleSlots();
    const slotIndex = slots.findIndex(
        (slot) =>
            slot.scheduleSlotId === Number(scheduleSlotId) &&
            ["DISPONIBLE", "LIBERADO_POR_CANCELACION"].includes(slot.slotStatus)
    );
    if (slotIndex < 0) return null;

    slots[slotIndex] = {
        ...slots[slotIndex],
        slotStatus: "RESERVADO",
        appointmentId: Number(appointmentId)
    };
    localStorage.setItem(SCHEDULE_SLOTS_KEY, JSON.stringify(slots));
    return slots[slotIndex];
}

export function releaseScheduleSlot(scheduleSlotId) {
    const slots = getScheduleSlots();
    const slotIndex = slots.findIndex((slot) => slot.scheduleSlotId === Number(scheduleSlotId));
    if (slotIndex < 0) return null;

    slots[slotIndex] = {
        ...slots[slotIndex],
        slotStatus: "LIBERADO_POR_CANCELACION",
        appointmentId: null
    };
    localStorage.setItem(SCHEDULE_SLOTS_KEY, JSON.stringify(slots));
    return slots[slotIndex];
}

export function rescheduleScheduleSlot(currentSlotId, newSlotId, appointmentId) {
    const slots = getScheduleSlots();
    const currentIndex = slots.findIndex((slot) => slot.scheduleSlotId === Number(currentSlotId));
    const newIndex = slots.findIndex(
        (slot) =>
            slot.scheduleSlotId === Number(newSlotId) &&
            ["DISPONIBLE", "LIBERADO_POR_CANCELACION"].includes(slot.slotStatus)
    );
    if (currentIndex < 0 || newIndex < 0 || currentIndex === newIndex) return null;

    slots[currentIndex] = {...slots[currentIndex], slotStatus: "LIBERADO_POR_CANCELACION", appointmentId: null};
    slots[newIndex] = {...slots[newIndex], slotStatus: "RESERVADO", appointmentId: Number(appointmentId)};
    localStorage.setItem(SCHEDULE_SLOTS_KEY, JSON.stringify(slots));
    return slots[newIndex];
}

export function completeScheduleSlot(scheduleSlotId) {
    const slots = getScheduleSlots();
    const slotIndex = slots.findIndex((slot) => slot.scheduleSlotId === Number(scheduleSlotId));
    if (slotIndex < 0) return null;

    slots[slotIndex] = {...slots[slotIndex], slotStatus: "COMPLETADO"};
    localStorage.setItem(SCHEDULE_SLOTS_KEY, JSON.stringify(slots));
    return slots[slotIndex];
}
