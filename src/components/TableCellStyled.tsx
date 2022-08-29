import TableCell from '@mui/material/TableCell'
import { ComponentProps } from 'react'

export const TableCellStyled = ({
  sx,
  ...props
}: ComponentProps<typeof TableCell>) => (
  <TableCell
    sx={{
      borderRight: (theme) => `1px solid ${theme.palette.grey[200]}`,
      ...sx
    }}
    {...props}
  />
)