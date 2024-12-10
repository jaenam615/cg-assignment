import { Body, Controller, Post } from '@nestjs/common';
import { ReservationService } from '../service/reservation.service';
import { GetTimeSlotDto } from '../dto/getTimeSlot.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('getTimeSlots')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) { }

  @Post()
  @ApiOperation({ summary: '살롱 스케줄 조회' })
  async getTimeSlot(@Body() getTimeSlot: GetTimeSlotDto) {
    try {
      const schedules = await this.reservationService.getTimeSlot(getTimeSlot);
      return schedules;
    } catch (error) {
      return error instanceof Error ? error.message : error;
    }
  }
}
