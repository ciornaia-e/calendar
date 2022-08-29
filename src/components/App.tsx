import { Button, Card, Grid } from '@mui/material'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableContainer from '@mui/material/TableContainer'
import TableBody from '@mui/material/TableBody'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import {
  addDays,
  addWeeks,
  differenceInMinutes,
  endOfWeek,
  format,
  startOfWeek,
  subWeeks
} from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { db, Event, reseedEvents } from '../db'
import { TableCellStyled } from './TableCellStyled'
import { EventCard } from './EventCard'

const weekdays = Array.from(Array(7).keys())
const dayHours = Array.from(Array(24).keys()).flatMap((hour) => {
  const prefix = hour < 10 ? '0' : ''
  const result = [`${prefix}${hour}:00`, `${prefix}${hour}:30`]

  return result
})

const ROW_HEIGHT = 2

function App() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()))

  const onPrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1))
  const onNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1))

  const events = useLiveQuery(async () => {
    const endOfCurrentWeek = endOfWeek(currentWeek);

    const result = await db.events
      .where('start')
      .between(currentWeek, endOfCurrentWeek)
      .toArray()

    return result
  }, [currentWeek])

  const computedEvents = useMemo(() => {
    return (events ?? []).reduce<
      Partial<Record<number, Record<string, Event[]>>>
    >((result, event) => {
      const eventDayOfWeek = Number(format(event.start, 'i'))

      const eventTime = format(event.start, 'HH:mm')

      result[eventDayOfWeek] = {
        ...result[eventDayOfWeek],
        [eventTime]: [...(result[eventDayOfWeek]?.[eventTime] ?? []), event]
      };

      return result
    }, {})
  }, [events])

  console.log(events, computedEvents)

  return (
    <Grid container direction='column' spacing={1}>
      <Grid item>
        <Card>
          <Button onClick={reseedEvents}>Seed Events</Button>
          <Button onClick={onPrevWeek}>Prev Week</Button>
          <Button onClick={onNextWeek}>Next Week</Button>
        </Card>
      </Grid>
      <Grid item>
        <TableContainer component={Paper} elevation={16}>
          <Table 
            sx={{ minWidth: 650, tableLayout: 'fixed', overflow: 'hidden' }} 
            aria-label='simple table'
            padding='none'
          > 
            <TableHead>
              <TableRow>
                <TableCellStyled width={40} />
                {weekdays.map((weekday, weekdayIndex) => (
                  <TableCellStyled padding='normal' key={weekday}>
                    {format(
                      addDays(currentWeek, weekdayIndex + 1),
                      'dd LLL, EEE'
                    )}
                  </TableCellStyled>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dayHours.map((hour) => 
                <TableRow key={hour}>
                  <TableCellStyled 
                    sx={{
                      verticalAlign: 'top',
                      height: `${ROW_HEIGHT}rem`
                    }}
                  >
                    {hour}
                  </TableCellStyled>
                  {weekdays.map((weekday, weekdayIndex) => {
                    const events = computedEvents[weekdayIndex + 1]?.[hour]

                    return (
                      <TableCellStyled
                        key={weekday}
                        sx={{
                          position: 'relative',
                        }}
                      >
                        <Grid
                          container
                          spacing={0.5}
                          direction='row'
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}
                        >
                          {events &&
                            events.map((event) => (
                              <Grid
                                item
                                key={event.id}
                                xs={Math.floor(12 / events.length)}
                              >
                                <EventCard
                                  event={event}
                                  sx={{
                                    height: `${
                                      (differenceInMinutes(
                                        event.end,
                                        event.start
                                      ) *
                                        ROW_HEIGHT) /
                                        30 || ROW_HEIGHT
                                    }rem`,
                                  }}
                                />
                              </Grid>
                            ))}
                        </Grid>
                      </TableCellStyled>
                    )
                  })}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  )
}

export default App