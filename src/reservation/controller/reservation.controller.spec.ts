import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from '../service/reservation.service';
import { GetTimeSlotDto } from '../dto/getTimeSlot.dto';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: ReservationService;

  const mockReservationService = {
    getTimeSlot: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    service = module.get<ReservationService>(ReservationService);
  });

  describe('getTimeSlot', () => {
    it('should return schedules', async () => {
      const getTimeSlotDto: GetTimeSlotDto = {
        start_day_identifier: '20210509',
        timezone_identifier: 'UTC',
        service_duration: 3600,
        days: 3,
        timeslot_interval: 1800,
        is_ignore_schedule: false,
        is_ignore_workhour: false,
      };

      const expectedSchedules = [
        { start: '2021-05-09T10:00:00Z', end: '2021-05-09T11:00:00Z' },
        { start: '2021-05-09T11:00:00Z', end: '2021-05-09T12:00:00Z' },
      ];

      mockReservationService.getTimeSlot.mockResolvedValue(expectedSchedules);

      const result = await controller.getTimeSlot(getTimeSlotDto);
      expect(result).toEqual(expectedSchedules);
      expect(service.getTimeSlot).toHaveBeenCalledWith(getTimeSlotDto);
    });

    it('should handle errors', async () => {
      const getTimeSlotDto: GetTimeSlotDto = {
        start_day_identifier: '20210509',
        timezone_identifier: 'UTC',
        service_duration: 3600,
        days: 3,
        timeslot_interval: 1800,
        is_ignore_schedule: false,
        is_ignore_workhour: false,
      };

      const errorMessage = 'Error occurred';
      mockReservationService.getTimeSlot.mockRejectedValue(new Error(errorMessage));

      const result = await controller.getTimeSlot(getTimeSlotDto);
      expect(result).toEqual(errorMessage);
    });
  });
});