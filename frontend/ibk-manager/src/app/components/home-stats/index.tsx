import { DateSelector } from './date-selector'
import { ChatCount } from './chat-count'
import { UserCount } from './user-count'
import { ClickRatio } from './click-ratio'
import { PredictionCount } from './prediction-count'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { homeApi } from '@/app/api/home'
import { DailyStats } from '@/app/api/home/types'
import './styles.css'
import axios from 'axios'

export function HomeStats() {
  const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, 'day'))
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDailyStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await homeApi.getDailyStats({
          date: selectedDate.format('YYYY-MM-DD')
        })
        setStats(response)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.status === 404 
              ? 'API 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.' 
              : '통계 데이터를 불러오는데 실패했습니다.'
          )
        } else {
          setError('알 수 없는 오류가 발생했습니다.')
        }
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDailyStats()
  }, [selectedDate])

  return (
    <div className="home-stats-container">
      <div className="date-selector-wrapper">
        <DateSelector onDateChange={setSelectedDate} />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div>로딩 중...</div>
      ) : stats ? (
        <div className="stats-grid">
          <ChatCount 
            selectedDate={selectedDate}
            count={stats.chatCount}
            diffPercent={stats.chatCountDiff}
          />
          <UserCount 
            selectedDate={selectedDate}
            count={stats.userCount}
            diffPercent={stats.userCountDiff}
          />
          <ClickRatio 
            selectedDate={selectedDate}
            clickRatio={stats.clickRatio}
          />
          <PredictionCount 
            selectedDate={selectedDate}
            predictionStats={stats.predictionStats}
          />
        </div>
      ) : null}
    </div>
  )
} 