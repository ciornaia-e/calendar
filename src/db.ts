import { faker } from '@faker-js/faker'
import { addMinutes, endOfMonth, setMinutes, startOfMonth } from 'date-fns'
import Dexie, { Table } from 'dexie'

export type Event = {
  id?: string
  title: string
  start: Date
  end: Date
  priority: 'critical' | 'moderate' | 'normal'
}

const EVENTS_STORE_NAME = 'events' as const

export class DB extends Dexie {
  [EVENTS_STORE_NAME]!: Table<Event>

  constructor() {
    super(EVENTS_STORE_NAME)

    this.version(1).stores({
      [EVENTS_STORE_NAME]: '++id, start, end'
    })
  }
}

export const db = new DB()

export const reseedEvents = async () => {
  await db.events.clear()

  const startOfCurrentMonth = startOfMonth(new Date())
  const endOfCurrentMonth = endOfMonth(new Date()) 

  const dummyEvents: Event[] = Array.from(Array(200).keys()).map(() => {
    const start = setMinutes(
      faker.date.between(startOfCurrentMonth, endOfCurrentMonth),
      faker.helpers.arrayElement([0, 30])
    )

    const end = addMinutes(
      start,
      faker.helpers.arrayElement([30, 60, 90, 120])
    )

    return {
      start,
      end,
      title: faker.random.words(2),
      priority: faker.helpers.arrayElement(['critical', 'moderate', 'normal'])
    }
  })

  db.events.bulkAdd(dummyEvents)
}
