"use client";

import { useState } from "react";
import { directoryEvents } from "@/lib/data";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EventCalendar = () => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const eventDates = new Set(directoryEvents.map((e) => e.date));

  const selectedEvents = selectedDate
    ? directoryEvents.filter((e) => e.date === selectedDate)
    : [];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateStr = (day: number) =>
    `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-h_blackLight/50 sticky top-28 flex flex-col gap-4 rounded-xl p-4">
      {/* Header */}
      <h3 className="text-h_white text-sm font-semibold">Events Calendar</h3>

      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="hover:text-h_white px-1 text-xl leading-none text-gray-400"
        >
          ‹
        </button>
        <span className="text-h_white text-sm">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="hover:text-h_white px-1 text-xl leading-none text-gray-400"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-400">
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const ds = dateStr(day);
          const hasEvent = eventDates.has(ds);
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(isSelected ? null : ds)}
              className={`relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs transition-colors ${
                isSelected
                  ? "bg-h_red font-bold text-white"
                  : isToday
                    ? "ring-h_red text-h_red/80 ring-1"
                    : "hover:bg-h_blackLight text-gray-300"
              }`}
            >
              {day}
              {hasEvent && (
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                    isSelected ? "bg-black" : "bg-h_red"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="bg-h_red inline-block h-2 w-2 rounded-full" />
        <span>Event day — click to view</span>
      </div>

      {/* Event list for selected date */}
      {selectedDate && (
        <div className="flex flex-col gap-2 border-t border-gray-700 pt-3">
          <p className="text-xs font-medium text-gray-400">
            {selectedEvents.length > 0
              ? `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} on ${selectedDate}`
              : `No events on ${selectedDate}`}
          </p>
          {selectedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-h_black/60 border-h_red rounded-lg border-l-2 p-3"
            >
              <p className="text-h_white text-sm font-semibold">
                {event.djName}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">{event.venue}</p>
              <p className="text-xs text-gray-400">{event.location}</p>
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-400">
                <span>Dress: {event.dressCode}</span>
                <span>Entry: {event.entryFee}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
