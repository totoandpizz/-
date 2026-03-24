import { useMemo } from 'react';
import { DELIVERY_FEE } from '../data/recipes';

function fmt(n) {
  return n.toLocaleString('ko-KR');
}

export default function Stats({ cookingLogs }) {
  const now = new Date();

  // 최근 6개월 데이터
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getMonth() + 1}월`;

      const logs = cookingLogs.filter(log => {
        const ld = new Date(log.cookedAt);
        return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth();
      });

      const saved = logs.reduce((s, l) => s + l.savedAmount, 0);
      const deliveryCost = logs.reduce((s, l) => s + l.deliveryPrice + DELIVERY_FEE, 0);
      const cookCost = Math.max(deliveryCost - saved, 0);
      const count = logs.length;

      months.push({ key, label, saved, deliveryCost, cookCost, count });
    }
    return months;
  }, [cookingLogs]);

  // 총 절약액
  const totalSaved = cookingLogs.reduce((s, l) => s + l.savedAmount, 0);
  const totalCooks = cookingLogs.length;
  const totalDelivery = cookingLogs.reduce((s, l) => s + l.deliveryPrice + DELIVERY_FEE, 0);

  // 현재 달
  const thisMonth = monthlyData[monthlyData.length - 1];

  // 가장 큰 값 (y축 스케일)
  const maxVal = Math.max(...monthlyData.map(m => Math.max(m.deliveryCost, m.cookCost, 1)));

  // 주간 절약 데이터 (최근 7일)
  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
      const isToday = i === 0;

      const logs = cookingLogs.filter(l => l.cookedAt.startsWith(key));
      const saved = logs.reduce((s, l) => s + l.savedAmount, 0);
      const count = logs.length;

      days.push({ key, label, saved, count, isToday });
    }
    return days;
  }, [cookingLogs]);

  const maxWeekSaved = Math.max(...weeklyData.map(d => d.saved), 1);

  return (
    <div className="fade-up">
      {/* 총합 요약 */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          background: 'linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)',
          borderRadius: 20,
          padding: '22px 20px',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 4 }}>
            누적 총 절약금액
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: -1.5, marginBottom: 16 }}>
            {fmt(totalSaved)}원
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: '요리 횟수', val: `${totalCooks}회` },
              { label: '배달 대신', val: `${fmt(totalDelivery)}원` },
              { label: '평균 절약', val: totalCooks > 0 ? `${fmt(Math.round(totalSaved / totalCooks))}원` : '0원' },
            ].map(item => (
              <div key={item.label} style={{
                flex: 1,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: '10px 8px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{item.val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 주간 절약 현황 */}
      <div className="section" style={{ paddingTop: 4 }}>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, letterSpacing: -0.4 }}>
            주간 절약 현황
          </div>

          {/* 바 차트 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, marginBottom: 8 }}>
            {weeklyData.map(day => {
              const barHeight = maxWeekSaved > 0 ? (day.saved / maxWeekSaved) * 100 : 0;
              return (
                <div key={day.key} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}>
                  {day.saved > 0 && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: day.isToday ? '#3182F6' : '#6B7684' }}>
                      {day.saved >= 1000 ? `${(day.saved / 1000).toFixed(1)}k` : day.saved}
                    </div>
                  )}
                  <div style={{
                    width: '100%',
                    height: `${Math.max(barHeight, day.count > 0 ? 8 : 4)}%`,
                    background: day.isToday
                      ? '#3182F6'
                      : day.count > 0
                        ? '#93C5FD'
                        : '#F2F4F6',
                    borderRadius: '6px 6px 0 0',
                    minHeight: 4,
                    transition: 'height 0.5s ease',
                    position: 'relative',
                  }}>
                    {day.count > 1 && (
                      <div style={{
                        position: 'absolute',
                        top: -18,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#3182F6',
                        color: 'white',
                        borderRadius: 999,
                        fontSize: 9,
                        padding: '1px 4px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}>
                        x{day.count}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* x축 레이블 */}
          <div style={{ display: 'flex', gap: 6 }}>
            {weeklyData.map(day => (
              <div key={day.key} style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: day.isToday ? 800 : 600,
                color: day.isToday ? '#3182F6' : '#8B95A1',
              }}>
                {day.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 월별 절약 vs 배달 비교 */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, letterSpacing: -0.4 }}>
            월별 배달 vs 요리 비용
          </div>
          <div style={{ fontSize: 12, color: '#8B95A1', marginBottom: 16 }}>최근 6개월</div>

          {/* 막대 차트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {monthlyData.map((m, idx) => {
              const isThis = idx === monthlyData.length - 1;
              const deliveryPct = maxVal > 0 ? (m.deliveryCost / maxVal) * 100 : 0;
              const cookPct = maxVal > 0 ? (m.cookCost / maxVal) * 100 : 0;

              return (
                <div key={m.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{
                      fontSize: 12, fontWeight: isThis ? 800 : 600,
                      color: isThis ? '#191F28' : '#6B7684',
                    }}>
                      {m.label} {isThis && '(이번달)'}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#00C896' }}>
                      {m.count > 0 ? `${fmt(m.saved)}원 절약` : '요리 없음'}
                    </span>
                  </div>

                  {/* 배달 바 */}
                  <div style={{ marginBottom: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, fontSize: 10, color: '#8B95A1', textAlign: 'right', flexShrink: 0 }}>배달</div>
                      <div style={{ flex: 1, height: 10, background: '#F2F4F6', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${deliveryPct}%`,
                          background: '#F04452',
                          borderRadius: 999,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <div style={{ width: 44, fontSize: 10, color: '#F04452', fontWeight: 700, flexShrink: 0 }}>
                        {m.deliveryCost > 0 ? `${Math.round(m.deliveryCost / 1000)}k` : '-'}
                      </div>
                    </div>
                  </div>

                  {/* 요리 바 */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, fontSize: 10, color: '#8B95A1', textAlign: 'right', flexShrink: 0 }}>요리</div>
                      <div style={{ flex: 1, height: 10, background: '#F2F4F6', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${cookPct}%`,
                          background: '#3182F6',
                          borderRadius: 999,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <div style={{ width: 44, fontSize: 10, color: '#3182F6', fontWeight: 700, flexShrink: 0 }}>
                        {m.cookCost > 0 ? `${Math.round(m.cookCost / 1000)}k` : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 범례 */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid #F2F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, background: '#F04452', borderRadius: 3 }} />
              <span style={{ fontSize: 12, color: '#6B7684' }}>배달 주문 비용</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, background: '#3182F6', borderRadius: 3 }} />
              <span style={{ fontSize: 12, color: '#6B7684' }}>직접 요리 비용</span>
            </div>
          </div>
        </div>
      </div>

      {/* 건강 통계 */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>이번 달 건강 통계</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { emoji: '🥗', label: '직접 요리 횟수', value: `${thisMonth.count}회`, color: '#00C896' },
              { emoji: '💰', label: '절약 금액', value: `${fmt(thisMonth.saved)}원`, color: '#3182F6' },
              { emoji: '🚫', label: '배달 안 한 횟수', value: `${thisMonth.count}번`, color: '#FF6B35' },
              { emoji: '🌱', label: '건강 식사', value: `${Math.round(thisMonth.count * 0.8)}일`, color: '#00C896' },
            ].map(item => (
              <div key={item.label} style={{
                background: '#F9FAFB',
                borderRadius: 14,
                padding: '14px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#8B95A1', lineHeight: 1.3 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 동기부여 메세지 */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #E8501A 100%)',
          borderRadius: 16,
          padding: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 32 }}>🎯</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 4 }}>
              이 돈이면 뭘 할 수 있을까?
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
              {totalSaved >= 50000
                ? `${fmt(totalSaved)}원 절약! 넷플릭스 ${Math.floor(totalSaved / 17000)}개월치예요 🎬`
                : `지금까지 ${fmt(totalSaved)}원 절약했어요! 계속 해봐요 💪`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
