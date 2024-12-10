import { Injectable } from '@nestjs/common';
import { GetTimeSlotDto } from '../dto/getTimeSlot.dto';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);


@Injectable()
export class ReservationService {
  private eventsJsonPath = path.join(process.cwd(), './src/reservation/json/events.json');
  private workhoursJsonPath = path.join(process.cwd(), './src/reservation/json/workhours.json')

  async getTimeSlot(getTimeSlot: GetTimeSlotDto): Promise<DayTimetable[]> {
    const {
      start_day_identifier,
      timezone_identifier,
      service_duration,
      days,
      timeslot_interval,
      is_ignore_schedule,
      is_ignore_workhour,
    } = getTimeSlot;

    const result: DayTimetable[] = [];
    const workhours: Workhour[] = JSON.parse(fs.readFileSync(this.workhoursJsonPath, 'utf-8'));
    const events: Event[] = is_ignore_schedule ? [] : JSON.parse(fs.readFileSync(this.eventsJsonPath, 'utf-8'));

    //'2021-05-08'
    //'20210508'
    // 타임존에 맞는 00:00:00을 생성
    const timeZoneTime = dayjs(`${start_day_identifier.slice(0, 4)}-${start_day_identifier.slice(4, 6)}-${start_day_identifier.slice(6, 8)}T00:00:00`, timezone_identifier);
    const utcTime = timeZoneTime.utc();

    console.log(timeZoneTime)
    console.log(utcTime)
    for (let i = 0; i < days; i++) {
      const currentDay = utcTime.add(i, 'day');

      const dayChecker = dayjs.utc(currentDay).tz(timezone_identifier);
      const weekdayKey: string = dayChecker.format('ddd').toLowerCase();

      const workhour: Workhour = workhours.find(workhour => workhour.key == weekdayKey);

      const openAt: number = currentDay.add(workhour.open_interval, 'second').unix();
      const closedAt: number = currentDay.add(workhour.close_interval, 'second').unix();

      // 요구사항 step1 & 3
      let timeslots: Timeslot[];
      if (is_ignore_workhour) {
        timeslots = this.makeSlots(currentDay.unix(), currentDay.unix() + 86400, timeslot_interval, service_duration)
      } else {
        // workhour가 존재하지 않거나, day off이거나, 영업 시작 시간과 종료 시간의 차이가 서비스를 하기 충분하지 않은 경우 
        if (!workhour || workhour.is_day_off || openAt + service_duration > closedAt) {
          timeslots = []
        } else {
          timeslots = this.makeSlots(openAt, closedAt, timeslot_interval, service_duration)
        }
      }

      //요구사항 step2
      //event가 있는 시간대는 빼고 반환
      if (!is_ignore_schedule && timeslots.length > 0) {
        timeslots = this.filterEvents(timeslots, events);
      }

      const daySchedule: DayTimetable = {
        start_of_day: openAt,
        day_modifier: i,
        is_day_off: workhour.is_day_off,
        timeslots
      }

      result.push(daySchedule)
    }

    return result;
  }

  // 모든 슬롯 생성 헬퍼메서드 (영업시간 이내)  
  private makeSlots(start: number, end: number, interval: number, duration: number): Timeslot[] {
    const timeslots: Timeslot[] = []
    for (let i = start; i < end - duration; i += interval) {
      timeslots.push({
        begin_at: i,
        end_at: i + duration
      })
    }
    return timeslots;
  }

  // 이벤트 있는 시간대는 반환 X
  private filterEvents(timeslots: Timeslot[], events: any[]): Timeslot[] {
    return timeslots.filter(slot => {
      return !events.some(event => {
        return (slot.begin_at < event.end_at && slot.end_at > event.begin_at);
      })
    })
  }
}