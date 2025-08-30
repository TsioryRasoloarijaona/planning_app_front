import type { ApiDay, ApiLabel , LabelType } from "@/types/planning";

export const labelPretty: Record<ApiLabel, string> = {
  INBOUND: "Inbound",
  OUTBOUND: "Outbound",
  EMAILING: "Emailing",
  CHAT: "Chat",
  BREAK: "Break",
  LUNCH: "Lunch",
};

export const labelColors: Record<ApiLabel, string> = {
  INBOUND: "bg-blue-100 text-blue-800 ring-blue-200",
  OUTBOUND: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  EMAILING: "bg-sky-100 text-sky-800 ring-sky-200",
  CHAT: "bg-purple-100 text-purple-800 ring-purple-200",
  BREAK: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  LUNCH: "bg-orange-100 text-orange-800 ring-orange-200",
};

export const daysTitle = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const dayToEnum: Record<(typeof daysTitle)[number], ApiDay> = {
  Monday: "MONDAY",
  Tuesday: "TUESDAY",
  Wednesday: "WEDNESDAY",
  Thursday: "THURSDAY",
  Friday: "FRIDAY",
  Saturday: "SATURDAY",
  Sunday: "SUNDAY",
};

export const labelColorUI: Record<LabelType, string> = {
  Inbound: "bg-blue-100 text-blue-800 ring-blue-200",
  Outbound: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Emailing: "bg-sky-100 text-sky-800 ring-sky-200",
  Chat: "bg-purple-100 text-purple-800 ring-purple-200",
  Break: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  Lunch: "bg-orange-100 text-orange-800 ring-orange-200",
};

export const enumToDay = (d: ApiDay) =>
  (d.charAt(0) + d.slice(1).toLowerCase()) as (typeof daysTitle)[number];
