import { Injectable } from '@nestjs/common';
import { GetTimeSlotDto } from '../dto/getTimeSlot.dto';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import * as fs from 'fs';
import * as path from 'path';

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
    const workhours = JSON.parse(fs.readFileSync(this.workhoursJsonPath, 'utf-8'));
    const events = is_ignore_schedule ? [] : JSON.parse(fs.readFileSync(this.eventsJsonPath, 'utf-8'));

    // 타임존에 맞는 00:00:00을 생성
    const startDayInTimeZone = `${start_day_identifier.slice(0, 4)}-${start_day_identifier.slice(4, 6)}-${start_day_identifier.slice(6, 8)}T00:00:00`;

    // UTC로 변환
    const startDay = fromZonedTime(startDayInTimeZone, timezone_identifier);

    // // 해당 타임존으로 변환
    // const startDay = toZonedTime(startDayUtc, timezone_identifier);


    for (let i = 0; i < days; i++) {
      const currentDay = new Date(startDay);
      currentDay.setDate(currentDay.getDate() + i);
      // workhours JSON의 객체별 key : weekdayKey
      const weekdayKey = currentDay.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();

      const workhour = workhours.find(workhour => workhour.key == weekdayKey);
      if (!workhour) continue;

      //UnixStamp는 초 단위, JS Date는 밀리초 단위
      // openAt, closedAt은 초 단위
      const openAt = (currentDay.getTime() + (workhour.open_interval) * 1000) / 1000;
      const closedAt = (currentDay.getTime() + (workhour.close_interval * 1000)) / 1000;

      // openAt, closedAt, timeslot_interval, service_duration 모두 초 단위
      // 요구사항 step1
      // service_duration = 3600(1시간)일 때 10시부터 20시까지 영업하면 19시까지 총 18개의 슬롯 생성되는 거 확인
      let timeslots = this.makeSlots(openAt, closedAt, timeslot_interval, service_duration)

      // 요구사항 step2
      // event가 있는 시간대는 빼고 반환
      if (!is_ignore_schedule) {
        timeslots = this.filterEvents(timeslots, events);
      }

      // 
      const daySchedule: DayTimetable = {
        start_of_day: openAt,
        day_modifier: i,
        is_day_off: workhour.is_day_off,
        timeslots
      }

      result.push(daySchedule)
    }

    console.log(result)

    return result;
  }

  // 모든 슬롯 생성 헬퍼메서드 (영업시간 이내)
  private makeSlots(start: number, end: number, interval: number, duration: number) {
    const timeslots: Array<Timeslot> = []
    console.log(start)
    console.log(end)
    for (let i = start; i < end - duration; i += interval) {
      timeslots.push({
        begin_at: i,
        end_at: i + duration
      })
    }
    return timeslots;
  }

  // 이벤트 있는 시간대는 반환 X
  private filterEvents(timeslots: Timeslot[], events: any[]) {
    return timeslots.filter(slot => {
      return !events.some(event => {
        return (slot.begin_at < event.end_at && slot.end_at > event.begin_at);
      })
    })
  }

  private filterWorkhours() { }
}
