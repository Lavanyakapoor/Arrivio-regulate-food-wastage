// Common household items for quick-add catalog
// defaultExpiryDays: typical shelf life after purchase

const commonItems = [
  // Dairy
  { name: 'Whole Milk', category: 'dairy', unit: 'L', defaultQty: 1, defaultExpiryDays: 7, emoji: '🥛' },
  { name: 'Greek Yogurt', category: 'dairy', unit: 'g', defaultQty: 200, defaultExpiryDays: 14, emoji: '🍦' },
  { name: 'Cheddar Cheese', category: 'dairy', unit: 'g', defaultQty: 200, defaultExpiryDays: 30, emoji: '🧀' },
  { name: 'Butter', category: 'dairy', unit: 'g', defaultQty: 250, defaultExpiryDays: 30, emoji: '🧈' },
  { name: 'Heavy Cream', category: 'dairy', unit: 'mL', defaultQty: 250, defaultExpiryDays: 10, emoji: '🥛' },
  { name: 'Eggs', category: 'dairy', unit: 'pcs', defaultQty: 12, defaultExpiryDays: 21, emoji: '🥚' },
  { name: 'Mozzarella', category: 'dairy', unit: 'g', defaultQty: 125, defaultExpiryDays: 7, emoji: '🧀' },
  { name: 'Sour Cream', category: 'dairy', unit: 'mL', defaultQty: 200, defaultExpiryDays: 14, emoji: '🥛' },

  // Produce
  { name: 'Bananas', category: 'produce', unit: 'pcs', defaultQty: 6, defaultExpiryDays: 5, emoji: '🍌' },
  { name: 'Apples', category: 'produce', unit: 'pcs', defaultQty: 4, defaultExpiryDays: 14, emoji: '🍎' },
  { name: 'Spinach', category: 'produce', unit: 'g', defaultQty: 150, defaultExpiryDays: 5, emoji: '🥬' },
  { name: 'Carrots', category: 'produce', unit: 'pcs', defaultQty: 4, defaultExpiryDays: 14, emoji: '🥕' },
  { name: 'Tomatoes', category: 'produce', unit: 'pcs', defaultQty: 4, defaultExpiryDays: 7, emoji: '🍅' },
  { name: 'Onions', category: 'produce', unit: 'pcs', defaultQty: 3, defaultExpiryDays: 30, emoji: '🧅' },
  { name: 'Potatoes', category: 'produce', unit: 'kg', defaultQty: 1, defaultExpiryDays: 21, emoji: '🥔' },
  { name: 'Broccoli', category: 'produce', unit: 'pcs', defaultQty: 1, defaultExpiryDays: 5, emoji: '🥦' },
  { name: 'Lemons', category: 'produce', unit: 'pcs', defaultQty: 4, defaultExpiryDays: 14, emoji: '🍋' },
  { name: 'Avocado', category: 'produce', unit: 'pcs', defaultQty: 2, defaultExpiryDays: 4, emoji: '🥑' },
  { name: 'Cucumber', category: 'produce', unit: 'pcs', defaultQty: 1, defaultExpiryDays: 7, emoji: '🥒' },
  { name: 'Strawberries', category: 'produce', unit: 'g', defaultQty: 250, defaultExpiryDays: 3, emoji: '🍓' },

  // Meat
  { name: 'Chicken Breast', category: 'meat', unit: 'g', defaultQty: 500, defaultExpiryDays: 3, emoji: '🍗' },
  { name: 'Ground Beef', category: 'meat', unit: 'g', defaultQty: 500, defaultExpiryDays: 2, emoji: '🥩' },
  { name: 'Salmon Fillet', category: 'meat', unit: 'g', defaultQty: 300, defaultExpiryDays: 2, emoji: '🐟' },
  { name: 'Pork Chops', category: 'meat', unit: 'g', defaultQty: 400, defaultExpiryDays: 3, emoji: '🥩' },
  { name: 'Shrimp', category: 'meat', unit: 'g', defaultQty: 300, defaultExpiryDays: 2, emoji: '🦐' },
  { name: 'Turkey Slices', category: 'meat', unit: 'g', defaultQty: 200, defaultExpiryDays: 5, emoji: '🦃' },

  // Snacks
  { name: 'Potato Chips', category: 'snacks', unit: 'g', defaultQty: 150, defaultExpiryDays: 60, emoji: '🥔' },
  { name: 'Chocolate Bar', category: 'snacks', unit: 'pcs', defaultQty: 2, defaultExpiryDays: 90, emoji: '🍫' },
  { name: 'Crackers', category: 'snacks', unit: 'g', defaultQty: 200, defaultExpiryDays: 60, emoji: '🍘' },
  { name: 'Mixed Nuts', category: 'snacks', unit: 'g', defaultQty: 200, defaultExpiryDays: 90, emoji: '🥜' },
  { name: 'Granola Bar', category: 'snacks', unit: 'pcs', defaultQty: 6, defaultExpiryDays: 45, emoji: '🍫' },
  { name: 'Popcorn', category: 'snacks', unit: 'bag', defaultQty: 1, defaultExpiryDays: 30, emoji: '🍿' },

  // Beverages
  { name: 'Orange Juice', category: 'beverages', unit: 'L', defaultQty: 1, defaultExpiryDays: 7, emoji: '🍊' },
  { name: 'Apple Juice', category: 'beverages', unit: 'L', defaultQty: 1, defaultExpiryDays: 7, emoji: '🍎' },
  { name: 'Coffee Beans', category: 'beverages', unit: 'g', defaultQty: 250, defaultExpiryDays: 90, emoji: '☕' },
  { name: 'Green Tea', category: 'beverages', unit: 'box', defaultQty: 1, defaultExpiryDays: 365, emoji: '🍵' },
  { name: 'Sparkling Water', category: 'beverages', unit: 'bottle', defaultQty: 6, defaultExpiryDays: 180, emoji: '💧' },
  { name: 'Kombucha', category: 'beverages', unit: 'bottle', defaultQty: 2, defaultExpiryDays: 30, emoji: '🧃' },

  // Grains
  { name: 'Sandwich Bread', category: 'grains', unit: 'pcs', defaultQty: 1, defaultExpiryDays: 7, emoji: '🍞' },
  { name: 'White Rice', category: 'grains', unit: 'kg', defaultQty: 1, defaultExpiryDays: 365, emoji: '🍚' },
  { name: 'Pasta', category: 'grains', unit: 'g', defaultQty: 500, defaultExpiryDays: 365, emoji: '🍝' },
  { name: 'Rolled Oats', category: 'grains', unit: 'g', defaultQty: 500, defaultExpiryDays: 180, emoji: '🌾' },
  { name: 'Flour', category: 'grains', unit: 'kg', defaultQty: 1, defaultExpiryDays: 365, emoji: '🌾' },
  { name: 'Breakfast Cereal', category: 'grains', unit: 'g', defaultQty: 400, defaultExpiryDays: 90, emoji: '🥣' },
  { name: 'Tortillas', category: 'grains', unit: 'pcs', defaultQty: 8, defaultExpiryDays: 7, emoji: '🫓' },

  // Frozen
  { name: 'Ice Cream', category: 'frozen', unit: 'mL', defaultQty: 500, defaultExpiryDays: 90, emoji: '🍦' },
  { name: 'Frozen Pizza', category: 'frozen', unit: 'pcs', defaultQty: 1, defaultExpiryDays: 90, emoji: '🍕' },
  { name: 'Frozen Vegetables', category: 'frozen', unit: 'g', defaultQty: 400, defaultExpiryDays: 120, emoji: '🥦' },
  { name: 'Frozen Berries', category: 'frozen', unit: 'g', defaultQty: 300, defaultExpiryDays: 120, emoji: '🫐' },

  // Medicine
  { name: 'Vitamin C', category: 'medicine', unit: 'pcs', defaultQty: 60, defaultExpiryDays: 365, emoji: '💊' },
  { name: 'Ibuprofen', category: 'medicine', unit: 'pcs', defaultQty: 30, defaultExpiryDays: 730, emoji: '💊' },
  { name: 'Multivitamin', category: 'medicine', unit: 'pcs', defaultQty: 30, defaultExpiryDays: 365, emoji: '💊' },
  { name: 'Allergy Tablets', category: 'medicine', unit: 'pcs', defaultQty: 20, defaultExpiryDays: 365, emoji: '💊' },

  // Other
  { name: 'Ketchup', category: 'other', unit: 'mL', defaultQty: 300, defaultExpiryDays: 180, emoji: '🍅' },
  { name: 'Mayonnaise', category: 'other', unit: 'mL', defaultQty: 200, defaultExpiryDays: 60, emoji: '🫙' },
  { name: 'Olive Oil', category: 'other', unit: 'mL', defaultQty: 500, defaultExpiryDays: 365, emoji: '🫒' },
  { name: 'Honey', category: 'other', unit: 'g', defaultQty: 250, defaultExpiryDays: 730, emoji: '🍯' },
  { name: 'Soy Sauce', category: 'other', unit: 'mL', defaultQty: 200, defaultExpiryDays: 365, emoji: '🫙' },
];

export const CATEGORIES_LIST = [
  { key: 'all',       label: 'All',       emoji: '✨' },
  { key: 'dairy',     label: 'Dairy',     emoji: '🥛' },
  { key: 'produce',   label: 'Produce',   emoji: '🥦' },
  { key: 'meat',      label: 'Meat',      emoji: '🥩' },
  { key: 'snacks',    label: 'Snacks',    emoji: '🍪' },
  { key: 'beverages', label: 'Beverages', emoji: '🧃' },
  { key: 'grains',    label: 'Grains',    emoji: '🌾' },
  { key: 'frozen',    label: 'Frozen',    emoji: '🧊' },
  { key: 'medicine',  label: 'Medicine',  emoji: '💊' },
  { key: 'other',     label: 'Other',     emoji: '📦' },
];

export default commonItems;
