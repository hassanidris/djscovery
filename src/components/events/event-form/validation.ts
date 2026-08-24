import type { EventFormData, EventFormErrors } from "./types";

export function validateEventForm(data: EventFormData): EventFormErrors {
  const newErrors: EventFormErrors = {};
  if (!data.title.trim()) newErrors.title = "Title is required.";
  if (!data.category) newErrors.category = "Category is required.";
  if (!data.startDate) newErrors.startDate = "Start date is required.";
  if (!data.countryId) newErrors.countryId = "Country is required.";
  if (data.ticketUrl && !/^https?:\/\/.+/.test(data.ticketUrl)) {
    newErrors.ticketUrl = "Ticket URL must be a valid URL.";
  }
  if (data.audioLink && !/^https?:\/\/.+/.test(data.audioLink)) {
    newErrors.audioLink = "Audio link must be a valid URL.";
  }
  if (data.startTime && !/^\d{2}:\d{2}$/.test(data.startTime)) {
    newErrors.startTime = "Use HH:MM format.";
  }
  if (data.endTime && !/^\d{2}:\d{2}$/.test(data.endTime)) {
    newErrors.endTime = "Use HH:MM format.";
  }
  return newErrors;
}
