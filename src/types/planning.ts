export type ApiLabel =
  | "INBOUND"
  | "OUTBOUND"
  | "EMAILING"
  | "CHAT"
  | "BREAK"
  | "LUNCH";

export type ApiDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

  export type LabelType =
  | "Inbound"
  | "Outbound"
  | "Emailing"
  | "Chat"
  | "Break"
  | "Lunch";

export type SlotForm = { day: ApiDay; start: string; end: string; label: ApiLabel };

export type FormValues = {
  isoWeek: string;
  accountId: number | null;
  slots: SlotForm[];
};

export type ApiWeek = {
  id: number;
  accountId: number;
  isoWeek: string;
  weekEnd: string;
  createdAt: string;
  updatedAt: string;
  slots: ApiSlot[];
};

export type ApiSlot = {
  id: number;
  weekId: number;
  day: ApiDay;
  startMinutes: number;
  endMinutes: number;
  label: ApiLabel;
  createdAt: string;
  updatedAt: string;
};

export type EventItem = { start: string; end: string; label: LabelType };
export type WeekSchedule = Record<string, EventItem[]>;
