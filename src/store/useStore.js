import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  ingredients: 'savings_health_ingredients',
  cookingLogs: 'savings_health_logs',
};

// 초기 샘플 데이터
const SAMPLE_INGREDIENTS = [
  { id: 1, name: '계란', amount: 10, unit: '개', price: 3000, category: '유제품', addedAt: new Date().toISOString() },
  { id: 2, name: '대파', amount: 200, unit: 'g', price: 1500, category: '채소', addedAt: new Date().toISOString() },
  { id: 3, name: '밥', amount: 600, unit: 'g', price: 800, category: '곡물', addedAt: new Date().toISOString() },
  { id: 4, name: '두부', amount: 300, unit: 'g', price: 1200, category: '유제품', addedAt: new Date().toISOString() },
  { id: 5, name: '감자', amount: 400, unit: 'g', price: 2000, category: '채소', addedAt: new Date().toISOString() },
  { id: 6, name: '된장', amount: 200, unit: 'g', price: 3500, category: '양념', addedAt: new Date().toISOString() },
  { id: 7, name: '식용유', amount: 500, unit: 'ml', price: 2500, category: '양념', addedAt: new Date().toISOString() },
  { id: 8, name: '당근', amount: 150, unit: 'g', price: 800, category: '채소', addedAt: new Date().toISOString() },
  { id: 9, name: '김치', amount: 300, unit: 'g', price: 4000, category: '반찬', addedAt: new Date().toISOString() },
  { id: 10, name: '양파', amount: 250, unit: 'g', price: 1200, category: '채소', addedAt: new Date().toISOString() },
];

// 샘플 요리 기록 (최근 7일)
function generateSampleLogs() {
  const logs = [];
  const today = new Date();
  const sampleMeals = [
    { recipeId: 1, recipeName: '계란볶음밥', emoji: '🍳', deliveryPrice: 8000, savedAmount: 5200 },
    { recipeId: 2, recipeName: '된장찌개', emoji: '🥘', deliveryPrice: 9000, savedAmount: 6800 },
    { recipeId: 5, recipeName: '김치볶음밥', emoji: '🌶️', deliveryPrice: 8500, savedAmount: 5900 },
    { recipeId: 1, recipeName: '계란볶음밥', emoji: '🍳', deliveryPrice: 8000, savedAmount: 5200 },
    { recipeId: 6, recipeName: '감자계란국', emoji: '🍲', deliveryPrice: 7000, savedAmount: 4800 },
  ];

  sampleMeals.forEach((meal, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i - 1);
    logs.push({
      id: Date.now() - i * 100000,
      ...meal,
      cookedAt: date.toISOString(),
    });
  });

  return logs;
}

function loadFromStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function useStore() {
  const [ingredients, setIngredients] = useState(() =>
    loadFromStorage(STORAGE_KEYS.ingredients, SAMPLE_INGREDIENTS)
  );

  const [cookingLogs, setCookingLogs] = useState(() =>
    loadFromStorage(STORAGE_KEYS.cookingLogs, generateSampleLogs())
  );

  const [toast, setToast] = useState(null);

  useEffect(() => { saveToStorage(STORAGE_KEYS.ingredients, ingredients); }, [ingredients]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.cookingLogs, cookingLogs); }, [cookingLogs]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  // 식재료 추가
  const addIngredient = useCallback((ingredient) => {
    const newIng = {
      ...ingredient,
      id: Date.now(),
      addedAt: new Date().toISOString(),
    };
    setIngredients(prev => {
      // 이미 같은 이름+단위 있으면 합산
      const existing = prev.find(i => i.name === ingredient.name && i.unit === ingredient.unit);
      if (existing) {
        return prev.map(i =>
          i.id === existing.id
            ? { ...i, amount: i.amount + ingredient.amount }
            : i
        );
      }
      return [...prev, newIng];
    });
    showToast(`${ingredient.name} 등록 완료!`);
  }, [showToast]);

  // 식재료 삭제
  const removeIngredient = useCallback((id) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  }, []);

  // 요리하기 - 식재료 차감
  const cookRecipe = useCallback((recipe) => {
    // 식재료 차감
    setIngredients(prev => {
      let updated = [...prev];
      recipe.ingredients.forEach(ri => {
        const idx = updated.findIndex(
          i => i.name === ri.name && i.unit === ri.unit
        );
        if (idx !== -1) {
          const newAmount = updated[idx].amount - ri.amount;
          if (newAmount <= 0) {
            updated = updated.filter((_, i) => i !== idx);
          } else {
            updated[idx] = { ...updated[idx], amount: newAmount };
          }
        }
      });
      return updated;
    });

    // 요리 원가 계산
    const cookCost = calculateCookCost(recipe);
    const savedAmount = recipe.deliveryPrice + 3500 - cookCost; // 배달비 포함

    const log = {
      id: Date.now(),
      recipeId: recipe.id,
      recipeName: recipe.name,
      emoji: recipe.emoji,
      deliveryPrice: recipe.deliveryPrice,
      savedAmount: Math.max(savedAmount, 0),
      cookCost,
      cookedAt: new Date().toISOString(),
    };

    setCookingLogs(prev => [log, ...prev]);
    return log;
  }, []);

  // 요리 원가 계산 (등록된 식재료 기준)
  const calculateCookCost = useCallback((recipe) => {
    let total = 0;
    recipe.ingredients.forEach(ri => {
      const stored = ingredients.find(
        i => i.name === ri.name && i.unit === ri.unit
      );
      if (stored && stored.amount > 0) {
        // 단가 계산
        const unitPrice = stored.price / stored.amount;
        total += unitPrice * ri.amount;
      } else {
        // 없으면 기본 추정가
        total += 500;
      }
    });
    return Math.round(total);
  }, [ingredients]);

  // 이번 달 총 절약액
  const monthSavings = useCallback(() => {
    const now = new Date();
    return cookingLogs
      .filter(log => {
        const d = new Date(log.cookedAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, log) => sum + log.savedAmount, 0);
  }, [cookingLogs]);

  // 날짜별 요리 기록
  const logsByDate = useCallback(() => {
    const map = {};
    cookingLogs.forEach(log => {
      const date = log.cookedAt.split('T')[0];
      if (!map[date]) map[date] = [];
      map[date].push(log);
    });
    return map;
  }, [cookingLogs]);

  // 레시피 가능 여부 체크
  const canCook = useCallback((recipe) => {
    return recipe.ingredients.every(ri => {
      const stored = ingredients.find(
        i => i.name === ri.name && i.unit === ri.unit
      );
      return stored && stored.amount >= ri.amount;
    });
  }, [ingredients]);

  // 레시피 가능한 재료 개수
  const matchCount = useCallback((recipe) => {
    return recipe.ingredients.filter(ri => {
      const stored = ingredients.find(
        i => i.name === ri.name && i.unit === ri.unit
      );
      return stored && stored.amount >= ri.amount;
    }).length;
  }, [ingredients]);

  return {
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
  };
}
