import { useState } from 'react';
import { INGREDIENT_CATEGORIES, UNITS } from '../data/recipes';

function fmt(n) {
  return n.toLocaleString('ko-KR');
}

export default function Ingredients({ ingredients, addIngredient, removeIngredient, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('전체');
  const [form, setForm] = useState({
    name: '',
    amount: '',
    unit: 'g',
    price: '',
    category: '채소',
  });

  const categories = ['전체', ...INGREDIENT_CATEGORIES];

  const filtered = filter === '전체'
    ? ingredients
    : ingredients.filter(i => i.category === filter);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.amount || !form.price) return;
    addIngredient({
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      unit: form.unit,
      price: parseInt(form.price),
      category: form.category,
    });
    setForm({ name: '', amount: '', unit: 'g', price: '', category: '채소' });
    setShowModal(false);
  }

  function handleDelete(id, name) {
    removeIngredient(id);
    showToast(`${name} 삭제됨`);
    setDeleteConfirm(null);
  }

  // 총 식재료 가치
  const totalValue = ingredients.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="fade-up">
      {/* 요약 */}
      <div style={{ background: 'white', padding: '16px 20px', borderBottom: '1px solid #F2F4F6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#8B95A1', fontWeight: 600, marginBottom: 2 }}>냉장고 속 식재료</div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.8 }}>
              {ingredients.length}가지
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#8B95A1', fontWeight: 600, marginBottom: 2 }}>식재료 총액</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#3182F6' }}>
              {fmt(totalValue)}원
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div style={{ padding: '12px 20px', background: 'white', borderBottom: '1px solid #F2F4F6' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: filter === cat ? '#3182F6' : '#F2F4F6',
                color: filter === cat ? 'white' : '#6B7684',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 식재료 목록 */}
      <div className="section">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <div className="empty-title">식재료가 없어요</div>
            <div className="empty-desc">장을 보고 오셨나요?<br />식재료를 등록해보세요!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(ing => (
              <div
                key={ing.id}
                className="card card-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  background: getCategoryColor(ing.category).bg,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  {getCategoryEmoji(ing.category)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{ing.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="chip chip-gray" style={{ fontSize: 11, padding: '2px 8px' }}>
                      {ing.category}
                    </span>
                    <span style={{ fontSize: 12, color: '#8B95A1' }}>
                      {ing.amount}{ing.unit} · {fmt(ing.price)}원
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteConfirm(ing)}
                  style={{
                    background: '#FFF0F1',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 13,
                    color: '#F04452',
                    cursor: 'pointer',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB 추가 버튼 */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'absolute',
          bottom: 84,
          right: 20,
          width: 56,
          height: 56,
          background: '#3182F6',
          borderRadius: '50%',
          border: 'none',
          color: 'white',
          fontSize: 28,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(49,130,246,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          transition: 'transform 0.15s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        +
      </button>

      {/* 식재료 추가 모달 */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-title">식재료 추가</div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">재료 이름</label>
                <input
                  className="input"
                  placeholder="예) 계란, 감자, 닭가슴살"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">수량</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="0"
                    min="0.1"
                    step="any"
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">단위</label>
                  <select
                    className="input"
                    value={form.unit}
                    onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">구매 금액 (원)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">카테고리</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                >
                  {INGREDIENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => setShowModal(false)}
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary btn-full">
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-sheet" style={{ padding: '20px 20px 32px' }}>
            <div className="modal-handle" />
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                {deleteConfirm.name} 삭제
              </div>
              <div style={{ fontSize: 14, color: '#6B7684', lineHeight: 1.5 }}>
                {deleteConfirm.amount}{deleteConfirm.unit}을(를) 삭제할까요?
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary btn-full" onClick={() => setDeleteConfirm(null)}>
                취소
              </button>
              <button className="btn btn-danger btn-full" onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.name)}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryEmoji(cat) {
  const map = {
    '채소': '🥦', '육류': '🥩', '해산물': '🐟',
    '유제품': '🥚', '곡물': '🌾', '양념': '🫙',
    '반찬': '🥢', '기타': '📦',
  };
  return map[cat] || '📦';
}

function getCategoryColor(cat) {
  const map = {
    '채소': { bg: '#E6FBF5' }, '육류': { bg: '#FFF0F1' },
    '해산물': { bg: '#EBF3FE' }, '유제품': { bg: '#FFFBEB' },
    '곡물': { bg: '#FFF3EE' }, '양념': { bg: '#F2F4F6' },
    '반찬': { bg: '#E6FBF5' }, '기타': { bg: '#F2F4F6' },
  };
  return map[cat] || { bg: '#F2F4F6' };
}
