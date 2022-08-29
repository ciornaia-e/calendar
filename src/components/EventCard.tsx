import { Card, Theme, Typography } from '@mui/material'
import { format } from 'date-fns'
import { ComponentProps } from 'react'
import { Event } from '../db'

const eventBgColor = (theme: Theme, event: Event) => {
  switch (event.priority) {
    case 'critical': {
      return theme.palette.error.main
    }
    case 'moderate': {
      return theme.palette.warning.main
    }
    case 'normal': {
      return theme.palette.primary.main
    }
    default: {
      return theme.palette.grey[500]
    }
  }
}

export const EventCard = ({
  event,
  ...props
}: { event: Event } & ComponentProps<typeof Card>) => {
  return (
    <Card
      {...props}
      sx={{
        bgcolor: (theme) => eventBgColor(theme, event),
        px: 1,
        ...props.sx
      }}
    >
      <Typography
        variant='caption'
        color={(theme) => theme.palette.common.white}
        sx={{
          textTransform: 'capitalize',
        }}
      >
        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')} - {' '}
        {event.title}
      </Typography>
    </Card>
  )
}