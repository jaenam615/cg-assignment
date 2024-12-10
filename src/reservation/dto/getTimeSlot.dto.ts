import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class GetTimeSlotDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '시작일 식별자',
    example: '20210505',
  })
  start_day_identifier: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '타임존 식별자',
    example: 'Asia/Seoul',
  })
  timezone_identifier: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '서비스 소요시간',
    example: 3600
  })
  service_duration: number; //UnixInterval

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: '반환 일차 개수',
    example: 3
  })
  days?: number = 1;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: '예약 가능 인터벌',
    example: 1800
  })
  timeslot_interval?: number = 1800;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: '이미 예약된 스케줄',
    example: false
  })
  is_ignore_schedule?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: '영업시간',
    example: false
  })
  is_ignore_workhour?: boolean = false;
}
