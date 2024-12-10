type ResponseBody = DayTimetable[];

interface DayTimetable {
  start_of_day: number; // utc
  day_modifier: number; // number
  is_day_off: boolean; // boolean
  timeslots: Timeslot[];
}

interface Timeslot {
  begin_at: number; // utc
  end_at: number; // utc
}

interface Workhour {
  close_interval: number,
  is_day_off: boolean,
  key: string,
  open_interval: number,
  weekday: number
}

interface Event {
  begin_at: number,
  end_at: number,
  created_at: number,
  updated_at: number
}
