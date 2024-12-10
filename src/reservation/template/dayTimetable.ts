type ResponseBody = DayTimetable[];

interface DayTimetable {
  start_of_day: number;
  day_modifier: number;
  is_day_off: boolean;
  timeslots: Timeslot[];
}

interface Timeslot {
  begin_at: number;
  end_at: number;
}
