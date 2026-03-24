import { useState } from 'react';
import { useStore } from './store/useStore';
import Home from './pages/Home';
import Ingredients from './pages/Ingredients';
import Recipes from './pages/Recipes';
import Stats from './pages/Stats';
import CookResult from './components/CookResult';
import './App.css';

const NAV_ITEMS = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'ingredients', label: '식재료', icon: '🛒' },
  { id: 'recipes', label: '레시피', icon: '🍳' },
  { id: 'stats', label: '통계', icon: '📊' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [cookResult, setCookResult] = useState(null);

  const {
    ingredients,
    cookingLogs,
    toast,
    addIngredient,
    removeIngredient,
    cookRecipe,
    calculateCookCost,
    monthSavings,
    logsByDate,
    canCook,
    matchCount,
    showToast,
  } = useStore();

  function handleCook(recipe) {
    const log = cookRecipe(recipe);
    setCookResult(log);
    showToast('요리 완료! 🎉');
  }

  function renderPage() {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            cookingLogs={cookingLogs}
            logsByDate={logsByDate}
            monthSavings={monthSavings}
          />
        );
      case 'ingredients':
        return (
          <Ingredients
            ingredients={ingredients}
            addIngredient={addIngredient}
            removeIngredient={removeIngredient}
            showToast={showToast}
          />
        );
      case 'recipes':
        return (
          <Recipes
            ingredients={ingredients}
            canCook={canCook}
            matchCount={matchCount}
            calculateCookCost={calculateCookCost}
            onCook={handleCook}
          />
        );
      case 'stats':
        return <Stats cookingLogs={cookingLogs} />;
      default:
        return null;
    }
  }

  return (
    <>
      {/* 앱 헤더 */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>
            {activeTab === 'home' ? '🏠' :
             activeTab === 'ingredients' ? '🛒' :
             activeTab === 'recipes' ? '🍳' : '📊'}
          </span>
          <span className="app-header-title">
            {activeTab === 'home' ? '절약 가계부' :
             activeTab === 'ingredients' ? '냉장고 관리' :
             activeTab === 'recipes' ? '오늘 뭐 먹지?' : '절약 통계'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="chip chip-green" style={{ fontSize: 12 }}>
            🌱 건강절약
          </span>
        </div>
      </header>

      {/* 페이지 콘텐츠 */}
      <div className="page-content">
        {renderPage()}
      </div>

      {/* 바텀 네비게이션 */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label" style={{ color: activeTab === item.id ? '#3182F6' : '#B0B8C1' }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* 요리 완료 결과 모달 */}
      {cookResult && (
        <CookResult
          log={cookResult}
          onClose={() => {
            setCookResult(null);
            setActiveTab('home');
          }}
        />
      )}

      {/* 토스트 */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
