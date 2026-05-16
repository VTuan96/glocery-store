import { useState } from 'react'
import { Box, Button, ButtonGroup, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import { useDailyRevenue, useTopProducts } from '../hooks/useReports'
import { formatVND } from '../../../lib/format/formatVND'

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function ReportsScreen() {
  const [date, setDate] = useState(toDateStr(new Date()))
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily')

  const { data: daily, isLoading: loadingDaily } = useDailyRevenue(date)
  const { data: topProducts = [], isLoading: loadingTop } = useTopProducts(period)

  function prevDay() {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(toDateStr(d))
  }

  function nextDay() {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    const today = toDateStr(new Date())
    if (toDateStr(d) <= today) setDate(toDateStr(d))
  }

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>Báo cáo</Typography>

      {/* Daily Revenue Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Button size="small" onClick={prevDay}>‹</Button>
            <Typography variant="subtitle1" fontWeight="medium">{date}</Typography>
            <Button size="small" onClick={nextDay}>›</Button>
          </Box>
          {loadingDaily ? (
            <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
          ) : (
            <>
              <Typography variant="h4" fontWeight="bold" color="primary" textAlign="center">
                {formatVND(daily?.totalRevenue ?? 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {daily?.transactionCount ?? 0} giao dịch
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" fontWeight="bold">Sản phẩm bán chạy</Typography>
        <ButtonGroup size="small">
          <Button
            variant={period === 'daily' ? 'contained' : 'outlined'}
            onClick={() => setPeriod('daily')}
          >
            Hôm nay
          </Button>
          <Button
            variant={period === 'weekly' ? 'contained' : 'outlined'}
            onClick={() => setPeriod('weekly')}
          >
            Tuần này
          </Button>
        </ButtonGroup>
      </Box>

      {loadingTop ? (
        <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
      ) : topProducts.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={2}>Chưa có dữ liệu</Typography>
      ) : (
        topProducts.map((p, i) => (
          <Card key={p.productId} sx={{ mb: 1 }}>
            <CardContent sx={{ py: '8px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">#{i + 1}</Typography>
                <Typography fontWeight="medium">{p.productName}</Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="body2">{p.unitsSold} đơn vị</Typography>
                <Typography variant="body2" color="primary">{formatVND(p.revenue)}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  )
}
