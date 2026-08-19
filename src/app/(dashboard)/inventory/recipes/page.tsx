'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import { DEMO_MENU_ITEMS } from '@/lib/mockData';

export interface IngredientLine {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  lineCost: number;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  menuItemName: string;
  ingredients: IngredientLine[];
  totalCost: number;
}

export default function RecipeManagementPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>(DEMO_MENU_ITEMS[0].id);
  const [ingredients, setIngredients] = useState<IngredientLine[]>([
    { ingredientId: 'inv-1', ingredientName: 'Paneer (Cottage Cheese)', quantity: 0.2, unit: 'kg', costPerUnit: 350, lineCost: 70 },
    { ingredientId: 'inv-2', ingredientName: 'Hung Curd / Yogurt', quantity: 0.05, unit: 'kg', costPerUnit: 120, lineCost: 6 },
    { ingredientId: 'inv-3', ingredientName: 'Tikka Masala Blend', quantity: 0.015, unit: 'kg', costPerUnit: 400, lineCost: 6 },
    { ingredientId: 'inv-4', ingredientName: 'Mustard Oil', quantity: 0.02, unit: 'L', costPerUnit: 180, lineCost: 3.6 },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes');
      const data = await res.json();
      if (data.recipes) {
        setRecipes(data.recipes);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const totalRecipeCost = ingredients.reduce((sum, ing) => sum + ing.lineCost, 0);
  const targetMenuItem = DEMO_MENU_ITEMS.find((mi) => mi.id === selectedMenuItem) || DEMO_MENU_ITEMS[0];
  const foodCostPercent = targetMenuItem ? Math.round((totalRecipeCost / targetMenuItem.price) * 100) : 0;

  const handleAddIngredientRow = () => {
    setIngredients([
      ...ingredients,
      { ingredientId: `inv-${Date.now()}`, ingredientName: 'Butter / Cream', quantity: 0.05, unit: 'kg', costPerUnit: 400, lineCost: 20 },
    ]);
  };

  const handleUpdateIngredient = (index: number, key: keyof IngredientLine, val: any) => {
    const updated = [...ingredients];
    (updated[index] as any)[key] = val;
    if (key === 'quantity' || key === 'costPerUnit') {
      updated[index].lineCost = Number((updated[index].quantity * updated[index].costPerUnit).toFixed(2));
    }
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  const handleSaveRecipe = async () => {
    const payload = {
      menuItemId: targetMenuItem.id,
      menuItemName: targetMenuItem.name,
      ingredients,
      totalCost: Number(totalRecipeCost.toFixed(2)),
    };

    try {
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsModalOpen(false);
      setNotification(`Recipe saved for ${targetMenuItem.name}!`);
      fetchRecipes();
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <TopBar
        title="Recipe Builder & Food Cost Calculator"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/inventory">
              <Button variant="secondary" className="text-xs">
                ← Raw Material Inventory
              </Button>
            </Link>
            <Button variant="primary" className="text-xs" onClick={() => setIsModalOpen(true)}>
              <span className="material-symbols-outlined text-[18px] mr-1">add</span>
              Build New Recipe
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Intro Banner */}
        <Card>
          <CardHeader>
            <CardTitle>Recipe-Level Food Cost Management</CardTitle>
            <CardDescription>
              Link menu dishes to exact raw material ingredients to automate inventory deductions upon sale and track target food cost (Target: &lt; 30%).
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((r) => {
            const menuItem = DEMO_MENU_ITEMS.find((mi) => mi.id === r.menuItemId);
            const sellingPrice = menuItem ? menuItem.price : 300;
            const costRatio = Math.round((r.totalCost / sellingPrice) * 100);
            const isHighCost = costRatio > 35;

            return (
              <Card key={r.id} className="hover:border-primary/40 transition-all">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-on-surface">{r.menuItemName}</h3>
                      <span className="text-xs text-on-surface-variant block">
                        Selling Price: {formatCurrency(sellingPrice)}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isHighCost
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      }`}
                    >
                      {costRatio}% Food Cost
                    </span>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-surface-container-low text-xs">
                    <div className="flex justify-between text-on-surface-variant font-semibold pb-1 border-b border-outline-variant/20">
                      <span>Ingredients Breakdown ({r.ingredients.length})</span>
                      <span>Cost</span>
                    </div>
                    {r.ingredients.map((ing: IngredientLine, i: number) => (
                      <div key={i} className="flex justify-between text-on-surface">
                        <span>
                          {ing.quantity} {ing.unit} x {ing.ingredientName}
                        </span>
                        <span className="font-bold">{formatCurrency(ing.lineCost)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 text-xs">
                    <span className="text-on-surface-variant font-semibold">Total Recipe Cost:</span>
                    <span className="font-black text-primary text-sm">
                      {formatCurrency(r.totalCost)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recipe Builder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Recipe Builder & Food Cost Calculator"
        size="lg"
      >
        <div className="space-y-5 py-2">
          {/* Target Menu Dish Selector */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant block mb-1">
              Select Menu Dish:
            </label>
            <select
              value={selectedMenuItem}
              onChange={(e) => setSelectedMenuItem(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface font-bold focus:outline-none focus:border-primary"
            >
              {DEMO_MENU_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — Selling Price: {formatCurrency(item.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Food Cost Summary Card */}
          <div className="flex items-center justify-between p-4 bg-primary-container/20 rounded-2xl border border-primary/20">
            <div>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Calculated Recipe Cost
              </span>
              <span className="text-2xl font-black text-primary">
                {formatCurrency(totalRecipeCost)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Food Cost % Ratio
              </span>
              <span
                className={`text-2xl font-black ${
                  foodCostPercent > 35 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {foodCostPercent}% {foodCostPercent <= 30 ? '(Ideal)' : '(High)'}
              </span>
            </div>
          </div>

          {/* Ingredient Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Raw Ingredients List:
              </label>
              <button
                type="button"
                onClick={handleAddIngredientRow}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                + Add Ingredient Line
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-xs"
                >
                  <input
                    type="text"
                    value={ing.ingredientName}
                    onChange={(e) => handleUpdateIngredient(idx, 'ingredientName', e.target.value)}
                    placeholder="Ingredient Name"
                    className="flex-1 px-2.5 py-1.5 bg-surface border border-outline-variant/40 rounded-lg text-on-surface font-semibold"
                  />
                  <input
                    type="number"
                    step="0.001"
                    value={ing.quantity}
                    onChange={(e) => handleUpdateIngredient(idx, 'quantity', Number(e.target.value))}
                    className="w-16 px-2 py-1.5 bg-surface border border-outline-variant/40 rounded-lg text-center font-bold"
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                    className="w-16 px-1.5 py-1.5 bg-surface border border-outline-variant/40 rounded-lg text-center font-bold"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                    <option value="pcs">pcs</option>
                  </select>
                  <span className="text-outline">@</span>
                  <input
                    type="number"
                    value={ing.costPerUnit}
                    onChange={(e) => handleUpdateIngredient(idx, 'costPerUnit', Number(e.target.value))}
                    className="w-20 px-2 py-1.5 bg-surface border border-outline-variant/40 rounded-lg text-right font-bold"
                  />
                  <span className="font-black text-on-surface w-16 text-right">
                    {formatCurrency(ing.lineCost)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="text-outline hover:text-rose-500"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveRecipe}>
              Save Recipe — {formatCurrency(totalRecipeCost)}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-surface-container-highest border border-primary/30 text-on-surface rounded-2xl shadow-xl text-xs font-bold">
          {notification}
        </div>
      )}
    </div>
  );
}
