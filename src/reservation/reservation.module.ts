import { Module } from '@nestjs/common';
import { ReservationService } from './service/reservation.service';
import { ReservationController } from './controller/reservation.controller';

@Module({
  providers: [ReservationService],
  controllers: [ReservationController],
})
export class ReservationModule {}
