interface ScheduleSelectorProps {
  date: string;
  time: string;
  availableTimes: string[];
  minDate?: string;
  disabled?: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  dateError?: string;
  timeError?: string;
}

export function ScheduleSelector({
  date,
  time,
  availableTimes,
  minDate,
  disabled = false,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
}: ScheduleSelectorProps) {
  const timeDisabled = disabled || !date || availableTimes.length === 0;

  const timePlaceholder = !date
    ? "Primero seleccione una fecha"
    : availableTimes.length === 0
      ? "No hay horarios disponibles"
      : "Seleccione una hora";

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <label
          htmlFor="appointmentDate"
          className="mb-2 block text-sm font-medium"
        >
          Fecha de atención <span className="text-red-600">*</span>
        </label>

        <input
          id="appointmentDate"
          name="appointmentDate"
          type="date"
          required
          min={minDate}
          value={date}
          disabled={disabled}
          onChange={(event) => onDateChange(event.target.value)}
          aria-invalid={Boolean(dateError)}
          aria-describedby={
            dateError ? "appointmentDate-error" : undefined
          }
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:bg-gray-50 ${
            dateError ? "border-red-500" : "border-line"
          }`}
        />

        {dateError && (
          <p
            id="appointmentDate-error"
            className="mt-2 text-sm text-red-600"
          >
            {dateError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="appointmentTime"
          className="mb-2 block text-sm font-medium"
        >
          Hora de atención <span className="text-red-600">*</span>
        </label>

        <select
          id="appointmentTime"
          name="appointmentTime"
          required
          value={time}
          disabled={timeDisabled}
          onChange={(event) => onTimeChange(event.target.value)}
          aria-invalid={Boolean(timeError)}
          aria-describedby={
            timeError ? "appointmentTime-error" : undefined
          }
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
            timeError ? "border-red-500" : "border-line"
          }`}
        >
          <option value="">{timePlaceholder}</option>

          {availableTimes.map((availableTime) => (
            <option key={availableTime} value={availableTime}>
              {availableTime}
            </option>
          ))}
        </select>

        {timeError && (
          <p
            id="appointmentTime-error"
            className="mt-2 text-sm text-red-600"
          >
            {timeError}
          </p>
        )}

        {date && !timeDisabled && availableTimes.length === 0 && (
          <p className="mt-2 text-sm text-amber-700">
            No hay horarios disponibles para esta fecha. Prueba con
            otro día.
          </p>
        )}
      </div>
    </div>
  );
}