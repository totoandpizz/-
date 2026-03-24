import { useState, useMemo } from 'react';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function fmt(n) {
  return n.toLocaleString('ko-KR');
}

export default function Home({ cookingLogs, logsByDate, monthSavings }) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // 이번 달 1일 요일
  const firstDay = new Date(year, month, 1).getDay();
  // 이번 달 마지막 날
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 달력 날짜 배열 (빈칸 포함)
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(d);
    return days;
  }, [firstDay, lastDate]);

  // 날짜 -> 요리 기록
  const logsMap = useMemo(() => logsByDate(), [logsByDate]);

  // 이번 달 절약액
  const saved = useMemo(() => monthSavings(), [monthSavings]);

  // 이번 달 요리 횟수
  const cookCount = useMemo(() => {
    return cookingLogs.filter(log => {
      const d = new Date(log.cookedAt);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
  }, [cookingLogs, month, year]);

  // 오늘 날짜 키
  const todayKey = now.toISOString().split('T')[0];

  function getDayKey(day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function prevMonth() {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function nextMonth() {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (next <= new Date(now.getFullYear(), now.getMonth() + 1, 1)) {
      setCurrentMonth(next);
    }
  }

  // 오늘 절약액
  const todayLogs = logsMap[todayKey] || [];
  const todaySaved = todayLogs.reduce((s, l) => s + l.savedAmount, 0);

  // 최근 기록
  const recentLogs = cookingLogs.slice(0, 5);

  return (
    <div className="fade-up">
      {/* 상단 요약 카드 */}
      <div style={{ background: 'linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)', padding: '28px 20px 24px' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 4 }}>
          {year}년 {month + 1}월 총 절약금액
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: -1.5, marginBottom: 16 }}>
          {fmt(saved)}원
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px 16px', flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>요리 횟수</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{cookCount}회</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px 16px', flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>오늘 절약</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{fmt(todaySaved)}원</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px 16px', flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>평균 절약</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
              {cookCount > 0 ? fmt(Math.round(saved / cookCount)) : 0}원
            </div>
          </div>
        </div>
      </div>

      {/* 달력 */}
      <div className="section">
        <div style={{ background: 'white', borderRadius: 16, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* 달력 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button
              onClick={prevMonth}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7684', padding: '4px 8px' }}
            >
              ‹
            </button>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.5 }}>
              {year}년 {month + 1}월
            </span>
            <button
              onClick={nextMonth}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7684', padding: '4px 8px' }}
            >
              ›
            </button>
          </div>

          {/* 요일 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
            {DAYS.map((d, i) => (
              <div
                key={d}
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: i === 0 ? '#F04452' : i === 6 ? '#3182F6' : '#8B95A1',
                  padding: '4px 0',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;

              const dayKey = getDayKey(day);
              const dayLogs = logsMap[dayKey] || [];
              const hasCook = dayLogs.length > 0;
              const isToday = dayKey === todayKey;
              const dayOfWeek = (firstDay + day - 1) % 7;
              const daySaved = dayLogs.reduce((s, l) => s + l.savedAmount, 0);

              return (
                <div
                  key={day}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '6px 2px',
                    borderRadius: 10,
                    background: isToday ? '#3182F6' : hasCook ? '#EBF3FE' : 'transparent',
                    cursor: hasCook ? 'pointer' : 'default',
                    minHeight: 54,
                    position: 'relative',
                  }}
                >
                  <span style={{
                    fontSize: 13,
                    fontWeight: isToday ? 800 : 600,
                    color: isToday ? 'white' : dayOfWeek === 0 ? '#F04452' : dayOfWeek === 6 ? '#3182F6' : '#191F28',
                    marginBottom: 2,
                  }}>
                    {day}
                  </span>
                  {hasCook && (
                    <>
                      <div style={{ fontSize: 14, lineHeight: 1 }}>
                        {dayLogs[0].emoji}
                        {dayLogs.length > 1 && <span style={{ fontSize: 9 }}>+{dayLogs.length - 1}</span>}
                      </div>
                      <div style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: isToday ? 'rgba(255,255,255,0.9)' : '#3182F6',
                        marginTop: 1,
                      }}>
                        {daySaved >= 1000 ? `${(daySaved / 1000).toFixed(1)}k` : daySaved}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* 범례 */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid #F2F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, background: '#3182F6', borderRadius: 3 }} />
              <span style={{ fontSize: 11, color: '#6B7684' }}>오늘</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, background: '#EBF3FE', borderRadius: 3 }} />
              <span style={{ fontSize: 11, color: '#6B7684' }}>요리한 날</span>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 요리 기록 */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <span className="section-title">최근 요리 기록</span>
          <span style={{ fontSize: 12, color: '#8B95A1' }}>절약 금액</span>
        </div>

        {recentLogs.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: '24px' }}>
              <div className="empty-icon">🍽️</div>
              <div className="empty-title">아직 요리 기록이 없어요</div>
              <div className="empty-desc">레시피 탭에서 첫 요리를 시작해보세요!</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentLogs.map(log => {
              const d = new Date(log.cookedAt);
              const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
              const timeStr = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={log.id}
                  className="card card-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    background: '#EBF3FE',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}>
                    {log.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{log.recipeName}</div>
                    <div style={{ fontSize: 12, color: '#8B95A1' }}>{dateStr} {timeStr}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#00C896' }}>
                      +{fmt(log.savedAmount)}원
                    </div>
                    <div style={{ fontSize: 11, color: '#8B95A1' }}>절약</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 동기부여 카드 */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div style={{
          background: 'linear-gradient(135deg, #00C896 0%, #00A676 100%)',
          borderRadius: 16,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <div style={{ fontSize: 36 }}>💪</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 4 }}>
              {cookCount > 0
                ? `이번 달 ${cookCount}번 직접 해먹었어요!`
                : '오늘 첫 요리에 도전해보세요!'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
              {cookCount > 0
                ? `배달 대신 요리로 ${fmt(saved)}원 절약했어요 🎉`
                : '직접 해먹으면 건강도 챙기고 돈도 절약해요!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
