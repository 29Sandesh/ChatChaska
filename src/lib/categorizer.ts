export interface PredefinedCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export const PREDEFINED_CATEGORIES: Record<string, PredefinedCategory> = {
  'starters': { id: 'starters', name: 'Starters & Tandoor', icon: '🍢', order: 0 },
  'main-course': { id: 'main-course', name: 'Main Course & Curries', icon: '🥘', order: 1 },
  'breads-rice': { id: 'breads-rice', name: 'Breads, Rice & Biryani', icon: '🍚', order: 2 },
  'soups-salads': { id: 'soups-salads', name: 'Soups, Salads & Papad', icon: '🥗', order: 3 },
  'raita-curd': { id: 'raita-curd', name: 'Raita & Sides', icon: '🥣', order: 4 },
  'indo-chinese': { id: 'indo-chinese', name: 'Indo-Chinese', icon: '🍜', order: 5 },
  'snacks-chaat': { id: 'snacks-chaat', name: 'Chaat & Street Snacks', icon: '🥪', order: 6 },
  'shakes-beverages': { id: 'shakes-beverages', name: 'Shakes & Thick Drinks', icon: '🥤', order: 7 },
  'desserts': { id: 'desserts', name: 'Desserts & Sweets', icon: '🍰', order: 8 },
  'drinks': { id: 'drinks', name: 'Tea, Coffee & Beverages', icon: '☕', order: 9 },
};

interface CategoryRule {
  categoryId: string;
  priority: number;
  exactTerms: string[];
  partialKeywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  // 1. Shakes & Thick Drinks
  {
    categoryId: 'shakes-beverages',
    priority: 95,
    exactTerms: [
      'cold coffee', 'frappe', 'thick shake', 'milkshake', 'mango shake',
      'chocolate shake', 'oreo shake', 'kitkat shake', 'strawberry shake',
      'vanilla shake', 'banana shake', 'belgian chocolate shake', 'nutella shake',
      'sweet lassi', 'mango lassi', 'salted lassi', 'punjabi lassi',
      'virgin mojito', 'blue lagoon', 'smoothie', 'mango smoothie',
    ],
    partialKeywords: [
      'shake', 'milkshake', 'frappe', 'smoothie', 'mojito', 'mocktail',
      'lassi', 'slush', 'crush', 'cooler', 'cold coffee', 'ice cream soda',
    ],
  },

  // 2. Chaat & Street Food / Snacks
  {
    categoryId: 'snacks-chaat',
    priority: 90,
    exactTerms: [
      'pani puri', 'sev puri', 'dahi puri', 'bhel puri', 'sukha bhel',
      'special mumbai bhel puri', 'vada pav', 'mumbai vada pav', 'cheese vada pav',
      'amritsari samosa chaat', 'dahi papdi chaat', 'dahi aloo tikki chaat',
      'raj kachori grand chaat', 'raj kachori', 'puneri misal pav', 'misal pav',
      'extra butter pav', 'extra misal farsan bowl', 'mumbai butter pav bhaji',
      'cheese loaded pav bhaji', 'pav bhaji', 'french fries', 'classic salted french fries',
      'peri peri masala fries', 'loaded cheese fries', 'bombay masala toast sandwich',
      'double egg franki roll', 'chili cheese toast', 'veg cheese grilled sandwich',
      'cheesy garlic bread', 'paneer tikka kathi roll', 'chicken kathi roll',
      'samosa', 'kachori', 'papdi chaat', 'garlic bread', 'cheese toast',
    ],
    partialKeywords: [
      'chaat', 'puri', 'bhel', 'vada pav', 'samosa', 'misal', 'kachori',
      'sandwich', 'toast', 'fries', 'franki', 'frankie', 'roll', 'kathi roll',
      'pav bhaji', 'pav', 'garlic bread', 'burger', 'pizza', 'wrap',
      'maggi', 'poha', 'upma', 'pakoda', 'bhajiya', 'farsan', 'tikki chaat',
    ],
  },

  // 3. Indo-Chinese
  {
    categoryId: 'indo-chinese',
    priority: 88,
    exactTerms: [
      'veg hakka noodles', 'schezwan noodles', 'veg manchurian', 'gobi manchurian',
      'chicken manchurian', 'chilli paneer', 'chilli chicken', 'veg fried rice',
      'schezwan fried rice', 'spring roll', 'veg spring roll', 'momos', 'steamed momos',
      'fried momos', 'kurkure momos', 'honey chilli potato', 'crispy corn',
      'triple schezwan rice', 'american chopsuey', 'chilli mushroom',
    ],
    partialKeywords: [
      'noodles', 'noodle', 'manchurian', 'chilli paneer', 'chilli chicken',
      'chilli potato', 'chilli mushroom', 'spring roll', 'momo', 'momos',
      'dim sum', 'wonton', 'chopsuey', 'chowmein', 'schezwan', 'hakka',
      'fried rice', 'crispy corn', 'dragon chicken',
    ],
  },

  // 4. Soups, Salads & Papad
  {
    categoryId: 'soups-salads',
    priority: 85,
    exactTerms: [
      'tomato soup', 'veg manchow soup', 'hot & sour soup', 'sweet corn soup',
      'lemon coriander soup', 'cream of tomato', 'green salad', 'kachumber salad',
      'caesar salad', 'masala papad', 'roasted papad', 'fried papad',
    ],
    partialKeywords: [
      'soup', 'shorba', 'manchow', 'hot and sour', 'sweet corn',
      'salad', 'kachumber', 'papad', 'masala papad',
    ],
  },

  // 5. Raita & Sides
  {
    categoryId: 'raita-curd',
    priority: 84,
    exactTerms: [
      'boondi raita', 'mix veg raita', 'cucumber raita', 'pineapple raita',
      'onion raita', 'plain curd', 'dahi bowl', 'green chutney',
    ],
    partialKeywords: [
      'raita', 'curd', 'dahi', 'chutney', 'pickle', 'sirka pyaz',
    ],
  },

  // 6. Breads, Rice & Biryani
  {
    categoryId: 'breads-rice',
    priority: 82,
    exactTerms: [
      'tandoori roti', 'butter roti', 'plain roti', 'butter naan', 'garlic naan',
      'cheese garlic naan', 'laccha paratha', 'amritsari kulcha', 'aloo paratha',
      'paneer paratha', 'bhatura', 'poori bhaji', 'veg dum biryani', 'paneer biryani',
      'chicken dum biryani', 'mutton biryani', 'hyderabadi biryani', 'jeera rice',
      'steamed basmati rice', 'dal khichdi', 'curd rice', 'veg pulao', 'kashmiri pulao',
    ],
    partialKeywords: [
      'roti', 'naan', 'kulcha', 'paratha', 'bhatura', 'poori', 'puri',
      'biryani', 'pulao', 'jeera rice', 'steamed rice', 'khichdi', 'basmati',
    ],
  },

  // 7. Starters & Tandoor
  {
    categoryId: 'starters',
    priority: 80,
    exactTerms: [
      'paneer tikka', 'paneer tikka angara', 'paneer malai tikka', 'paneer achari tikka',
      'tandoori mushroom', 'veg seekh kebab', 'hara bhara kebab', 'dahi ke kebab',
      'tandoori chicken', 'chicken tikka', 'chicken malai tikka', 'chicken seekh kebab',
      'chicken lollipop', 'chicken wings', 'crispy veg', 'fish tikka', 'amritsari fish',
      'tomato ketchup packet (₹1)', 'tomato ketchup',
    ],
    partialKeywords: [
      'tikka', 'kebab', 'tandoor', 'tandoori', 'crispy', 'lollipop', 'wings',
      'seekh', 'drumstick', 'starter', 'platter', 'ketchup',
    ],
  },

  // 8. Main Course & Curries
  {
    categoryId: 'main-course',
    priority: 75,
    exactTerms: [
      'paneer butter masala', 'paneer makhani', 'kadai paneer', 'shahi paneer',
      'palak paneer', 'matar paneer', 'paneer lababdar', 'paneer bhurji',
      'dal makhani', 'dal tadka', 'dal fry', 'butter chicken', 'murg makhani',
      'kadai chicken', 'chicken curry', 'chicken tikka masala', 'mutton rogan josh',
      'laal maas', 'malai kofta', 'dum aloo', 'chana masala', 'rajma masala',
    ],
    partialKeywords: [
      'masala', 'makhani', 'kadai', 'handi', 'curry', 'gravy', 'korma',
      'dal', 'paneer', 'chicken', 'mutton', 'rogan josh', 'kofta',
      'bhuna', 'lababdar', 'methi malai', 'sabzi', 'saag',
    ],
  },

  // 9. Desserts & Sweets
  {
    categoryId: 'desserts',
    priority: 78,
    exactTerms: [
      'gulab jamun', 'rasgulla', 'rasmalai', 'ice cream', 'vanilla ice cream',
      'chocolate brownie', 'sizzling brownie', 'matka kulfi', 'gajar halwa',
      'moong dal halwa', 'rabri', 'jalebi', 'kheer', 'pastry', 'waffle',
    ],
    partialKeywords: [
      'gulab jamun', 'rasgulla', 'rasmalai', 'ice cream', 'brownie', 'sundae',
      'kulfi', 'rabri', 'jalebi', 'halwa', 'kheer', 'cake', 'pastry',
      'waffle', 'pudding', 'dessert', 'sweet',
    ],
  },

  // 10. Tea, Coffee & Beverages
  {
    categoryId: 'drinks',
    priority: 70,
    exactTerms: [
      'masala chai', 'ginger chai', 'elaichi chai', 'filter coffee', 'hot coffee',
      'cappuccino', 'latte', 'espresso', 'green tea', 'lemon tea', 'black tea',
      'mineral water', 'water bottle', 'coca cola', 'coke', 'pepsi', 'sprite',
      'thums up', 'diet coke', 'fresh lime soda', 'jaljeera soda',
    ],
    partialKeywords: [
      'chai', 'tea', 'coffee', 'espresso', 'cappuccino', 'latte',
      'water', 'mineral water', 'coke', 'pepsi', 'sprite', 'soda',
      'beverage', 'drink',
    ],
  },
];

export function autoCategorizeMenuItem(
  name: string,
  description?: string,
  rawExtractedCategory?: string
): string {
  const normalizedName = (name || '').toLowerCase().trim();
  const normalizedDesc = (description || '').toLowerCase().trim();
  const rawCat = (rawExtractedCategory || '').toLowerCase().trim();

  if (rawCat && PREDEFINED_CATEGORIES[rawCat]) {
    return rawCat;
  }

  const aliasMap: Record<string, string> = {
    'starter': 'starters',
    'starters': 'starters',
    'appetizers': 'starters',
    'tandoor': 'starters',
    'main': 'main-course',
    'mains': 'main-course',
    'main-course': 'main-course',
    'curry': 'main-course',
    'curries': 'main-course',
    'gravy': 'main-course',
    'bread': 'breads-rice',
    'breads': 'breads-rice',
    'rice': 'breads-rice',
    'biryani': 'breads-rice',
    'breads-rice': 'breads-rice',
    'soup': 'soups-salads',
    'soups': 'soups-salads',
    'salad': 'soups-salads',
    'salads': 'soups-salads',
    'soups-salads': 'soups-salads',
    'raita': 'raita-curd',
    'curd': 'raita-curd',
    'raita-curd': 'raita-curd',
    'chinese': 'indo-chinese',
    'indo-chinese': 'indo-chinese',
    'snacks': 'snacks-chaat',
    'chaat': 'snacks-chaat',
    'street': 'snacks-chaat',
    'street-food': 'snacks-chaat',
    'snacks-chaat': 'snacks-chaat',
    'shakes': 'shakes-beverages',
    'shake': 'shakes-beverages',
    'beverages': 'drinks',
    'shakes-beverages': 'shakes-beverages',
    'dessert': 'desserts',
    'desserts': 'desserts',
    'sweets': 'desserts',
    'drink': 'drinks',
    'drinks': 'drinks',
    'tea': 'drinks',
    'coffee': 'drinks',
  };

  if (rawCat && aliasMap[rawCat]) {
    return aliasMap[rawCat];
  }

  for (const rule of CATEGORY_RULES) {
    for (const term of rule.exactTerms) {
      if (
        normalizedName === term ||
        normalizedName.includes(term) ||
        normalizedDesc.includes(term)
      ) {
        return rule.categoryId;
      }
    }
  }

  let bestCategory = 'starters';
  let highestScore = 0;

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.partialKeywords) {
      if (normalizedName.includes(kw)) {
        score += rule.priority + (kw.length * 2);
      }
      if (normalizedDesc.includes(kw)) {
        score += 20 + kw.length;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = rule.categoryId;
    }
  }

  return highestScore > 0 ? bestCategory : 'starters';
}