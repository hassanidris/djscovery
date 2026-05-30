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
    <div className="bg-h_blackLight/50 rounded-xl p-4 flex flex-col gap-4 sticky top-28">
      {/* Header */}
      <h3 className="text-h_white font-semibold text-sm">Events Calendar</h3>

      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="text-gray-400 hover:text-h_white text-xl px-1 leading-none"
        >
          ‹
        </button>
        <span className="text-h_white text-sm">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="text-gray-400 hover:text-h_white text-xl px-1 leading-none"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-500">
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
              className={`relative flex flex-col items-center justify-center h-8 w-8 mx-auto rounded-full text-xs transition-colors
                ${
                  isSelected
                    ? "bg-h_purple text-black font-bold"
                    : isToday
                    ? "ring-1 ring-h_purple text-h_purple"
                    : "text-gray-300 hover:bg-h_blackLight"
                }`}
            >
              {day}
              {hasEvent && (
                <span
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                    isSelected ? "bg-black" : "bg-h_purple"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="w-2 h-2 rounded-full bg-h_purple inline-block" />
        <span>Event day — click to view</span>
      </div>

      {/* Event list for selected date */}
      {selectedDate && (
        <div className="flex flex-col gap-2 border-t border-gray-700 pt-3">
          <p className="text-gray-400 text-xs font-medium">
            {selectedEvents.length > 0
              ? `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} on ${selectedDate}`
              : `No events on ${selectedDate}`}
          </p>
          {selectedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-h_black/60 rounded-lg p-3 border-l-2 border-h_purple"
            >
              <p className="text-h_white text-sm font-semibold">{event.djName}</p>
              <p className="text-gray-400 text-xs mt-0.5">{event.venue}</p>
              <p className="text-gray-500 text-xs">{event.location}</p>
              <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
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
