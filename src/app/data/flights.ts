export interface FlightLeg {
  dir: 'Depart' | 'Return';
  date: string;          // e.g. "Thu, 11 Jun"
  depTime: string;       // "09:55"
  depCode: string;       // "LHR"
  depCity: string;       // "London"
  arrTime: string;       // "20:05"
  arrCode: string;
  arrCity: string;
  duration: string;      // "11h 40m"
  stops: number;         // 0 = direct
  stopLabel?: string;    // "1 stop · CMN"
}

export interface Flight {
  id: string;
  airlineName: string;
  airlineCode: string;   // "KL1004 + KL587"
  initials: string;      // avatar fallback, e.g. "KL"
  fullFare: number;      // per passenger, in NGN
  wasFare?: number;      // struck-through original
  out: FlightLeg;
  ret: FlightLeg;
  cabinBag: string;      // "1 × 7kg cabin"
  checkedBag: string;    // "1 × 23kg checked"
  refundable: boolean;
  bestDeal?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  desc: string;
  price: number;
  preselected?: boolean;
}

/** "Enhance your trip" extras shown on the booking page. */
export const ADDONS: AddOn[] = [
  { id: 'cancel-refund', name: 'Medical Cancellation Refund', desc: 'Full refund of airfare and taxes if sudden illness, death or hospitalisation stops you travelling.', price: 5_450 },
  { id: 'call-reminder', name: 'Call Reminder', desc: 'Get call reminders for your flights and stay updated on schedule or time changes.', price: 2_500, preselected: true },
  { id: 'insurance-70', name: 'Comprehensive Travel Insurance (70–80 yrs)', desc: 'Cover for travellers aged 70–80, valid for 30 days, against loss, delay and medical expenses.', price: 35_000 },
  { id: 'sms-reminder', name: 'SMS Reminder', desc: 'Get SMS reminders and stay informed about any updates or changes to flight times.', price: 2_000, preselected: true },
  { id: 'sms-ticket', name: 'Ticket details via SMS', desc: 'Receive your ticket details by SMS.', price: 1_000, preselected: true },
  { id: 'flex-dates', name: 'Flexible Travel Dates', desc: 'Change your travel date without airline penalty fees, up to 48 hours before departure.', price: 40_000 },
  { id: 'insurance-69', name: 'Comprehensive Travel Insurance (0–69 yrs)', desc: 'Cover for travellers aged 0–69, valid for 30 days, against loss, delay and medical expenses.', price: 25_000 },
  { id: 'whatsapp-ticket', name: 'Ticket details via WhatsApp', desc: 'Receive your ticket details on WhatsApp.', price: 3_000, preselected: true },
  { id: 'protocol', name: 'Wakanow Protocol Service (Lagos & Abuja)', desc: 'Meet-and-greet from drop-off to arrival gate for business travellers and VIPs.', price: 25_000 },
  { id: 'liquidation', name: 'Airline Liquidation Protection', desc: 'Full refund if the airline is liquidated prior to departure.', price: 3_750 },
  { id: 'wheelchair', name: 'Wheelchair Assistance', desc: 'An agent assists with wheelchair requests to the airline.', price: 10_500 },
];

/** Prime shaves 5% off the full fare (member fare). */
export const PRIME_DISCOUNT = 0.05;

export function primeFare(full: number): number {
  return Math.round(full * (1 - PRIME_DISCOUNT));
}

/** Pay Small Small: three equal monthly instalments, 0% interest. */
export function pssMonthly(full: number): number {
  return Math.round(full / 3);
}

const leg = (
  dir: 'Depart' | 'Return',
  date: string,
  depTime: string, depCode: string, depCity: string,
  arrTime: string, arrCode: string, arrCity: string,
  duration: string, stops: number, stopLabel?: string,
): FlightLeg => ({ dir, date, depTime, depCode, depCity, arrTime, arrCode, arrCity, duration, stops, stopLabel });

export const FLIGHTS: Flight[] = [
  {
    id: 'klm',
    airlineName: 'KLM Royal Dutch Airlines',
    airlineCode: 'KL1004 + KL587',
    initials: 'KL',
    fullFare: 1_373_308,
    wasFare: 1_512_000,
    out: leg('Depart', 'Thu, 11 Jun', '09:55', 'LHR', 'London', '20:05', 'LOS', 'Lagos', '11h 40m', 2, '2 stops · AMS'),
    ret: leg('Return', 'Sat, 20 Jun', '22:10', 'LOS', 'Lagos', '07:40', 'LHR', 'London', '11h 30m', 2, '2 stops · AMS'),
    cabinBag: '1 × 7kg cabin',
    checkedBag: '1 × 23kg checked',
    refundable: false,
    bestDeal: true,
  },
  {
    id: 'af',
    airlineName: 'Air France',
    airlineCode: 'AF1681 + AF110',
    initials: 'AF',
    fullFare: 1_373_467,
    out: leg('Depart', 'Thu, 11 Jun', '11:30', 'LHR', 'London', '21:30', 'LOS', 'Lagos', '11h 00m', 1, '1 stop · CDG'),
    ret: leg('Return', 'Sat, 20 Jun', '22:10', 'LOS', 'Lagos', '07:40', 'LHR', 'London', '11h 30m', 1, '1 stop · CDG'),
    cabinBag: '1 × 7kg cabin',
    checkedBag: '1 × 23kg checked',
    refundable: false,
  },
  {
    id: 'ram',
    airlineName: 'Royal Air Maroc',
    airlineCode: 'AT554 + AT800',
    initials: 'RA',
    fullFare: 1_394_345,
    out: leg('Depart', 'Thu, 11 Jun', '18:10', 'LHR', 'London', '18:15', 'LOS', 'Lagos', '13h 05m', 1, '1 stop · CMN'),
    ret: leg('Return', 'Sat, 20 Jun', '19:15', 'LOS', 'Lagos', '16:50', 'LHR', 'London', '12h 35m', 1, '1 stop · CMN'),
    cabinBag: '1 × 7kg cabin',
    checkedBag: '1 × 23kg checked',
    refundable: false,
  },
  {
    id: 'tk',
    airlineName: 'Turkish Airlines',
    airlineCode: 'TK1984 + TK623',
    initials: 'TK',
    fullFare: 1_458_856,
    out: leg('Depart', 'Thu, 11 Jun', '06:30', 'LHR', 'London', '19:05', 'LOS', 'Lagos', '13h 35m', 1, '1 stop · IST'),
    ret: leg('Return', 'Sat, 20 Jun', '20:50', 'LOS', 'Lagos', '11:40', 'LHR', 'London', '12h 50m', 1, '1 stop · IST'),
    cabinBag: '1 × 7kg cabin',
    checkedBag: '1 × 23kg checked',
    refundable: true,
  },
  {
    id: 'qr',
    airlineName: 'Qatar Airways',
    airlineCode: 'QR10 + QR1407',
    initials: 'QR',
    fullFare: 1_476_327,
    out: leg('Depart', 'Thu, 11 Jun', '19:25', 'LHR', 'London', '14:10', 'LOS', 'Lagos', '17h 45m', 1, '1 stop · DOH'),
    ret: leg('Return', 'Sat, 20 Jun', '08:55', 'LOS', 'Lagos', '08:00', 'LHR', 'London', '16h 05m', 1, '1 stop · DOH'),
    cabinBag: '1 × 7kg cabin',
    checkedBag: '1 × 30kg checked',
    refundable: true,
  },
  {
    id: 'lh',
    airlineName: 'Lufthansa',
    airlineCode: 'LH901 + LH568',
    initials: 'LH',
    fullFare: 1_689_530,
    out: leg('Depart', 'Thu, 11 Jun', '07:30', 'LHR', 'London', '17:10', 'LOS', 'Lagos', '11h 40m', 1, '1 stop · FRA'),
    ret: leg('Return', 'Sat, 20 Jun', '23:35', 'LOS', 'Lagos', '08:40', 'LHR', 'London', '10h 05m', 1, '1 stop · FRA'),
    cabinBag: '1 × 8kg cabin',
    checkedBag: '1 × 23kg checked',
    refundable: false,
  },
];
