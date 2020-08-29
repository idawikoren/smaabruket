import {
  addDays,
  format,
  getISOWeek,
  isFirstDayOfMonth,
  isMonday,
  isSameDay,
  isToday,
} from 'date-fns'
// import { Promise } from 'es6-promise'
import React, { Component } from 'react'

const availabilityUrl =
  'https://foreningenbs.no/smaabruket-availability-api/availability'

const showYear = false

const months = [
  'januar',
  'februar',
  'mars',
  'april',
  'mai',
  'juni',
  'juli',
  'august',
  'september',
  'oktober',
  'november',
  'desember',
]

function getMonthName(date: Date) {
  return months[Number(format(date, 'M')) - 1]
}

interface IBooking {
  from: string
  until: string
  type: string
}

interface IApiData {
  bookings: IBooking[]
  first: string
  until: string
}

interface IState {
  data: IApiData | null
  loading: boolean
}

interface IDay {
  date: Date
  type: string | null
}

type IWeekDays = [IDay, IDay, IDay, IDay, IDay, IDay, IDay]

interface IWeek {
  weeknumber: number
  days: IWeekDays
}

function getDayOfWeek(date: Date) {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

function getClassNameOfType(type: string | null) {
  if (type == null) return undefined
  switch (type) {
    case 'RESERVERT':
      return 'reservert'
    case 'RESERVERT-HS':
      return 'reservert-hs'
    case 'BEBOERHELG':
      return 'beboerhelg'
  }
  return 'utleid'
}

function buildDays(first: string, until: string): Date[] {
  const result = []

  let date = new Date(first)
  const untilDate = new Date(until)
  const untilTime = untilDate.getTime()

  while (date.getTime() < untilTime && !isSameDay(date, untilDate)) {
    result.push(date)
    date = addDays(date, 1)
  }

  return result
}

interface IBookingTypes {
  [date: string]: string
}

function getBookingDateTypes(data: IBooking[]) {
  return data.reduce((acc, booking) => {
    buildDays(booking.from, booking.until).forEach((date) => {
      acc[format(date, 'yyyy-MM-dd')] = booking.type
    })
    return acc
  }, {} as IBookingTypes)
}

function getWeekDays(firstDay: Date, bookingTypes: IBookingTypes) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(firstDay, i)
    const dateFormatted = format(date, 'yyyy-MM-dd')

    days.push({
      date,
      type: bookingTypes[dateFormatted] || null,
    })
  }

  return days as IWeekDays
}

function convertToWeeks(
  bookings: IBooking[],
  first: string,
  until: string,
): IWeek[] {
  if (!isMonday(new Date(first))) {
    throw Error('Expected first date to be a monday')
  }

  const bookingTypes = getBookingDateTypes(bookings)

  const weeks: IWeek[] = []

  let date = new Date(first)
  const untilDate = new Date(until)
  const untilTime = untilDate.getTime()
  while (date.getTime() < untilTime && !isSameDay(date, untilDate)) {
    weeks.push({
      days: getWeekDays(date, bookingTypes),
      weeknumber: getISOWeek(date),
    })
    date = addDays(date, 7)
  }

  return weeks
}

async function getUpcomingEvents() {
  const headers = new Headers()
  headers.append('Accept', 'application/json')
  const request = new Request(availabilityUrl, { headers })
  const response = await fetch(request)

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return response.json()
}

class Calendar extends Component<{}, IState> {
  private unmount = false
  public state = {
    data: null,
    loading: false,
  }
  public async componentDidMount() {
    this.setState({
      loading: true,
    })
    const res = await getUpcomingEvents()
    if (!this.unmount) {
      this.setState({
        data: res,
        loading: false,
      })
    }
  }
  public componentWillUnmount() {
    this.unmount = true
  }
  public render() {
    if (this.state.loading) {
      return <p>Henter oversikt over bookinger...</p>
    }

    const data = this.state.data as IApiData | null

    if (data == null) {
      return (
        <p>
          <b>Kalenderen er for øyeblikket ikke tilgjengelig.</b> Ta kontakt for
          informasjon om ledige datoer.
        </p>
      )
    }

    const weeks: IWeek[] = convertToWeeks(data.bookings, data.first, data.until)
    const today = format(new Date(), 'yyyy-MM-dd')

    return (
      <>
        <table className='hyttestyret_kalender'>
          <thead>
            <tr>
              <th>Uke</th>
              <th>
                Mandag <span>til tirsdag</span>
              </th>
              <th>
                Tirsdag <span>til onsdag</span>
              </th>
              <th>
                Onsdag <span>til torsdag</span>
              </th>
              <th>
                Torsdag <span>til fredag</span>
              </th>
              <th>
                Fredag <span>til lørdag</span>
              </th>
              <th>
                Lørdag <span>til søndag</span>
              </th>
              <th>
                Søndag <span>til mandag</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIdx) => (
              <tr key={weekIdx}>
                <td className='uke'>{week.weeknumber}</td>
                {week.days.map((day, dayIdx) => (
                  <td
                    key={dayIdx}
                    className={
                      getClassNameOfType(day.type) +
                      (isToday(day.date) ? ' idag' : '')
                    }
                  >
                    {format(day.date, 'd')}
                    {(isFirstDayOfMonth(day.date) ||
                      (weekIdx === 0 && dayIdx === 0)) && (
                      <>
                        .{' '}
                        <span className='month'>{getMonthName(day.date)}</span>
                        {showYear && <> {format(day.date, 'yyyy')}</>}
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div id='hyttestyret_legends'>
          <p className='hyttestyret_legend ledig'>
            <span />
            Ledig
          </p>
          <p className='hyttestyret_legend reservert'>
            <span />
            Reservert
          </p>
          <p className='hyttestyret_legend reservert-hs'>
            <span />
            Reservert av hyttestyret
          </p>
          <p className='hyttestyret_legend beboerhelg'>
            <span />
            Reservert for beboere
          </p>
          <p className='hyttestyret_legend utleid'>
            <span />
            Opptatt
          </p>
        </div>
      </>
    )
  }
}

export default Calendar
