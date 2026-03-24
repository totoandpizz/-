import { useState, useMemo } from 'react';
import { RECIPES, DELIVERY_FEE } from '../data/recipes';

function fmt(n) {
  return n.toLocaleString('ko-KR');
}

export default function Recipes({ ingredients, canCook, matchCount, calculateCookCost, onCook }) {
  const [filter, setFilter] = useState('전체');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const categories = ['전체', '만들 수 있어요', '한식', '양식', '건강식', '반찬'];

  const filtered = useMemo(() => {
    if (filter === '만들 수 있어요') return RECIPES.filter(r => canCook(r));
    if (filter === '전체') return RECIPES;
    return RECIPES.filter(r => r.category === filter);
  }, [filter, canCook]);

  // 만들 수 있는 레시피 수
  const cookableCount = RECIPES.filter(r => canCook(r)).length;

  return (
    <div className="fade-up">
      {/* 상단 안내 */}
      {cookableCount > 0 && (
        <div style={{
          background: '#EBF3FE',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>✨</span>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1B64DA' }}>
              지금 바로 만들 수 있는 레시피 {cookableCount}개!
            </span>
            <div style={{ fontSize: 12, color: '#3182F6', marginTop: 1 }}>냉장고 속 재료로 가능해요</div>
          </div>
        </div>
      )}

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
              {cat === '만들 수 있어요' && cookableCount > 0 && (
                <span style={{
                  marginLeft: 4,
                  background: filter === cat ? 'rgba(255,255,255,0.3)' : '#3182F6',
                  color: 'white',
                  borderRadius: 999,
                  fontSize: 10,
                  padding: '0 5px',
                }}>
                  {cookableCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 레시피 목록 */}
      <div className="section">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🥺</div>
            <div className="empty-title">만들 수 있는 레시피가 없어요</div>
            <div className="empty-desc">식재료를 더 추가하면<br/>다양한 레시피를 만들 수 있어요!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(recipe => {
              const cookable = canCook(recipe);
              const matched = matchCount(recipe);
              const total = recipe.ingredients.length;
              const matchPct = Math.round((matched / total) * 100);
              const cookCost = calculateCookCost(recipe);
              const savedAmt = recipe.deliveryPrice + DELIVERY_FEE - cookCost;

              return (
                <div
                  key={recipe.id}
                  className="card"
                  style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  {/* 완전히 가능 배지 */}
                  {cookable && (
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: '#00C896',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 999,
                    }}>
                      지금 가능!
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 14 }}>
                    {/* 이모지 아이콘 */}
                    <div style={{
                      width: 64,
                      height: 64,
                      background: cookable ? '#E6FBF5' : '#F2F4F6',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      flexShrink: 0,
                    }}>
                      {recipe.emoji}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 800 }}>{recipe.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <span className="chip chip-gray" style={{ fontSize: 11, padding: '2px 8px' }}>
                          {recipe.category}
                        </span>
                        <span className="chip chip-blue" style={{ fontSize: 11, padding: '2px 8px' }}>
                          ⏱ {recipe.time}분
                        </span>
                        <span className="chip" style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          background: recipe.difficulty === '쉬움' ? '#E6FBF5' : '#FFF3EE',
                          color: recipe.difficulty === '쉬움' ? '#00C896' : '#FF6B35',
                        }}>
                          {recipe.difficulty}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7684', lineHeight: 1.4 }}>
                        {recipe.description}
                      </div>
                    </div>
                  </div>

                  {/* 재료 매칭 바 */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#6B7684', fontWeight: 600 }}>
                        보유 재료 {matched}/{total}
                      </span>
                      <span style={{ fontSize: 12, color: cookable ? '#00C896' : '#3182F6', fontWeight: 700 }}>
                        {matchPct}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#F2F4F6', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${matchPct}%`,
                        background: cookable ? '#00C896' : '#3182F6',
                        borderRadius: 999,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>

                  {/* 절약 예상 */}
                  <div style={{
                    marginTop: 12,
                    padding: '10px 12px',
                    background: savedAmt > 0 ? '#E6FBF5' : '#F2F4F6',
                    borderRadius: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div style={{ fontSize: 12, color: '#6B7684' }}>
                      배달 vs 직접 요리
                    </div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: savedAmt > 0 ? '#00C896' : '#6B7684',
                    }}>
                      {savedAmt > 0 ? `${fmt(savedAmt)}원 절약` : '비슷해요'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 레시피 상세 모달 */}
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          canCook={canCook(selectedRecipe)}
          calculateCookCost={calculateCookCost}
          ingredients={ingredients}
          onClose={() => setSelectedRecipe(null)}
          onCook={() => {
            onCook(selectedRecipe);
            setSelectedRecipe(null);
          }}
        />
      )}
    </div>
  );
}

function RecipeDetail({ recipe, canCook, calculateCookCost, ingredients, onClose, onCook }) {
  const cookCost = calculateCookCost(recipe);
  const savedAmt = recipe.deliveryPrice + DELIVERY_FEE - cookCost;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64,
            background: canCook ? '#E6FBF5' : '#F2F4F6',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
          }}>
            {recipe.emoji}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>{recipe.name}</div>
            <div style={{ fontSize: 13, color: '#6B7684', marginTop: 2 }}>{recipe.description}</div>
          </div>
        </div>

        {/* 영양정보 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          marginBottom: 20,
        }}>
          {[
            { label: '칼로리', value: `${recipe.nutrition.cal}kcal`, color: '#F04452' },
            { label: '단백질', value: `${recipe.nutrition.protein}g`, color: '#3182F6' },
            { label: '탄수화물', value: `${recipe.nutrition.carb}g`, color: '#FF6B35' },
            { label: '지방', value: `${recipe.nutrition.fat}g`, color: '#F5C842' },
          ].map(n => (
            <div key={n.label} style={{
              background: '#F9FAFB',
              borderRadius: 10,
              padding: '10px 6px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: n.color }}>{n.value}</div>
              <div style={{ fontSize: 10, color: '#8B95A1', marginTop: 2 }}>{n.label}</div>
            </div>
          ))}
        </div>

        {/* 절약 정보 */}
        <div style={{
          background: savedAmt > 0 ? '#E6FBF5' : '#F2F4F6',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, color: '#6B7684', fontWeight: 600, marginBottom: 10 }}>
            💰 배달 vs 직접 요리 (배달비 {fmt(DELIVERY_FEE)}원 포함)
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#8B95A1', marginBottom: 2 }}>배달 주문</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#F04452' }}>
                {fmt(recipe.deliveryPrice + DELIVERY_FEE)}원
              </div>
            </div>
            <div style={{ fontSize: 20, color: '#B0B8C1' }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#8B95A1', marginBottom: 2 }}>직접 요리</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#3182F6' }}>
                {fmt(cookCost)}원
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#8B95A1', marginBottom: 2 }}>절약</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#00C896' }}>
                +{fmt(Math.max(savedAmt, 0))}원
              </div>
            </div>
          </div>
        </div>

        {/* 필요 재료 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>필요 재료 (1인분)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recipe.ingredients.map(ri => {
              const stored = ingredients.find(
                i => i.name === ri.name && i.unit === ri.unit
              );
              const ok = stored && stored.amount >= ri.amount;

              return (
                <div key={ri.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: ok ? '#E6FBF5' : '#FFF0F1',
                  borderRadius: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{ok ? '✅' : '❌'}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{ri.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 13, color: ok ? '#00C896' : '#F04452', fontWeight: 700 }}>
                      {ri.amount}{ri.unit} 필요
                    </span>
                    {stored && (
                      <div style={{ fontSize: 11, color: '#8B95A1' }}>
                        보유: {stored.amount}{stored.unit}
                      </div>
                    )}
                    {!stored && (
                      <div style={{ fontSize: 11, color: '#F04452' }}>미보유</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 조리 순서 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>조리 순서</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recipe.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24,
                  background: '#3182F6',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: 'white',
                  flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 14, color: '#333D4B', lineHeight: 1.5 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA 버튼 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            닫기
          </button>
          <button
            className="btn btn-green"
            style={{ flex: 2, fontSize: 15 }}
            onClick={onCook}
            disabled={!canCook}
          >
            {canCook ? '🍳 요리 완료!' : '재료가 부족해요'}
          </button>
        </div>
      </div>
    </div>
  );
}
