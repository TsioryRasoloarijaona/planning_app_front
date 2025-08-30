import type { ApiDay, ApiLabel, LabelType, WeekSchedule } from "@/types/planning";

export function dayEnumToTitle(d: ApiDay): keyof WeekSchedule {
  switch (d) {
    case "MONDAY": return "Monday";
    case "TUESDAY": return "Tuesday";
    case "WEDNESDAY": return "Wednesday";
    case "THURSDAY": return "Thursday";
    case "FRIDAY": return "Friday";
    case "SATURDAY": return "Saturday";
    case "SUNDAY": return "Sunday";
  }
}

export function labelEnumToTitle(l: ApiLabel): LabelType {
  switch (l) {
    case "INBOUND": return "Inbound";
    case "OUTBOUND": return "Outbound";
    case "EMAILING": return "Emailing";
    case "CHAT": return "Chat";
    case "BREAK": return "Break";
    case "LUNCH": return "Lunch";
  }
}

export function emptyWeek(): WeekSchedule {
  return {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };
}
