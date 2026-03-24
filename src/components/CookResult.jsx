import { useState } from 'react';
import { DELIVERY_FEE } from '../data/recipes';

function fmt(n) {
  return n.toLocaleString('ko-KR');
}

export default function CookResult({ log, onClose }) {
  const [animStep, setAnimStep] = useState(0);

  // 절약 퍼센트
  const totalDelivery = log.deliveryPrice + DELIVERY_FEE;
  const savePct = totalDelivery > 0 ? Math.round((log.savedAmount / totalDelivery) * 100) : 0;

  setTimeout(() => {
    if (animStep < 3) setAnimStep(s => s + 1);
  }, 400);

  return (
    <div className="modal-overlay">
      <div className="modal-sheet" style={{ textAlign: 'center', padding: '24px 24px 40px' }}>
        <div className="modal-handle" />

        {/* 성공 이모지 */}
        <div style={{ fontSize: 64, marginBottom: 12, animation: 'fadeUp 0.3s ease' }}>
          🎉
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
          요리 완료!
        </div>
        <div style={{ fontSize: 15, color: '#6B7684', marginBottom: 24 }}>
          {log.emoji} {log.recipeName}
        </div>

        {/* 절약 금액 강조 */}
        <div style={{
          background: 'linear-gradient(135deg, #00C896 0%, #00A676 100%)',
          borderRadius: 20,
          padding: '24px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 6 }}>
            이번 요리로 절약한 금액
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, color: 'white', letterSpacing: -1.5, marginBottom: 4 }}>
            {fmt(log.savedAmount)}원
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
            배달 대비 {savePct}% 절약!
          </div>
        </div>

        {/* 비교 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          background: '#F9FAFB',
          borderRadius: 16,
          padding: '16px',
          marginBottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#8B95A1', marginBottom: 4 }}>배달 주문했다면</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#F04452' }}>
              {fmt(totalDelivery)}원
            </div>
            <div style={{ fontSize: 11, color: '#B0B8C1', marginTop: 2 }}>
              (배달비 {fmt(DELIVERY_FEE)}원 포함)
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, color: '#B0B8C1' }}>
            vs
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#8B95A1', marginBottom: 4 }}>직접 요리</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#3182F6' }}>
              {fmt(log.cookCost || (totalDelivery - log.savedAmount))}원
            </div>
            <div style={{ fontSize: 11, color: '#B0B8C1', marginTop: 2 }}>
              식재료비만
            </div>
          </div>
        </div>

        {/* 절약 게이지 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8B95A1', marginBottom: 8 }}>
            <span>절약률</span>
            <span style={{ fontWeight: 700, color: '#00C896' }}>{savePct}%</span>
          </div>
          <div style={{ height: 12, background: '#F2F4F6', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${savePct}%`,
              background: 'linear-gradient(90deg, #00C896, #00A676)',
              borderRadius: 999,
              transition: 'width 1s ease',
            }} />
          </div>
        </div>

        {/* 건강 메시지 */}
        <div style={{
          background: '#EBF3FE',
          borderRadius: 14,
          padding: '14px',
          marginBottom: 24,
          textAlign: 'left',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 24 }}>💪</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1B64DA', marginBottom: 2 }}>
              건강한 선택을 했어요!
            </div>
            <div style={{ fontSize: 12, color: '#3182F6', lineHeight: 1.4 }}>
              직접 요리는 영양 균형도 챙기고<br />지갑도 두둑해지는 최고의 습관이에요 🌱
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-full"
          style={{ fontSize: 16 }}
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
}
