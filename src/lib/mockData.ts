// src/lib/mockData.ts

/** Central demo restaurant identity */
export const DEMO_RESTAURANT = {
  id: 'demo',
  name: 'ChatChaska Cafe',
  tagline: 'Authentic Indian Fine Dining & Street Food Delights',
  slug: 'chatchaska-cafe',
  phone: '+91 98765 43210',
  email: 'hello@chatchaska.in',
  address: '42 Linking Road, Bandra West, Mumbai 400050',
  rating: 4.8,
  reviewCount: 320,
  cuisine: 'North Indian, Mughlai, Indo-Chinese & Desserts',
  logo: 'CHATCHASKA',
};

export interface DemoCategory {
  id: string;
  name: string;
  visible: boolean;
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  { id: 'starters', name: 'Starters & Tandoor', visible: true },
  { id: 'main-course', name: 'Main Course & Curries', visible: true },
  { id: 'breads-rice', name: 'Breads, Rice & Biryani', visible: true },
  { id: 'soups-salads', name: 'Soups, Salads & Papad', visible: true },
  { id: 'raita-curd', name: 'Raita & Sides', visible: true },
  { id: 'indo-chinese', name: 'Indo-Chinese', visible: true },
  { id: 'snacks-chaat', name: 'Chaat & Street Snacks', visible: true },
  { id: 'shakes-beverages', name: 'Shakes & Thick Drinks', visible: true },
  { id: 'desserts', name: 'Desserts & Sweets', visible: true },
  { id: 'drinks', name: 'Tea, Coffee & Beverages', visible: true },
];

export interface DemoMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  strikePrice?: number;
  description: string;
  available: boolean;
  popular: boolean;
  veg: boolean;
  spicy?: boolean;
  image: string;
  tags: string[];
  rating?: number;
  ratingCount?: number;
  badge?: 'bestseller' | 'must-try' | 'new';
  offerTag?: string;
  variants?: { name: string; price: number }[];
  addons?: { name: string; price: number }[];
}

function build300IndianMenuItems(): DemoMenuItem[] {
  const items: DemoMenuItem[] = [];

  const add = (
    id: string,
    name: string,
    category: string,
    price: number,
    description: string,
    veg: boolean,
    popular = false,
    spicy = false,
    badge?: 'bestseller' | 'must-try' | 'new'
  ) => {
    items.push({
      id,
      name,
      category,
      price,
      description,
      available: true,
      popular,
      veg,
      spicy,
      image: veg
        ? 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80',
      tags: [category, veg ? 'Veg' : 'Non-Veg'],
      rating: Number((3.9 + (items.length % 10) * 0.1).toFixed(1)),
      ratingCount: 40 + ((items.length * 9) % 350),
      badge,
    });
  };

  // ── 1. STARTERS & TANDOOR (35 items) ───────────────────
  const startersVeg = [
    ['1-rupee-saunf', 'Special Royal Saunf (₹1 Test)', 1, 'Mouth freshener saunf for ₹1 payment testing.', true, true, 'bestseller'],
    ['1-rupee-paan', 'Sweet Meetha Paan (₹1 Test)', 1, 'Authentic sweet paan for ₹1 payment testing.', true, true, 'bestseller'],
    ['1-rupee-chai', 'Cutting Sample Chai (₹1 Test)', 1, 'Sample cutting chai for ₹1 payment testing.', true, true, 'bestseller'],
    ['1-rupee-papad', 'Mini Masala Papad (₹1 Test)', 1, 'Crispy roasted papad for ₹1 payment testing.', true, true],
    ['1-rupee-dip', 'Special Mint Dip (₹1 Test)', 1, 'Mint chutney dip for ₹1 payment testing.', true, true],
    ['paneer-tikka', 'Paneer Tikka Classic', 280, 'Cottage cheese cubes in spicy hung curd & tandoori masala.', true, true, 'bestseller'],
    ['paneer-malai-tikka', 'Paneer Malai Tikka', 290, 'Soft paneer marinated in cashews, cream & mild spices.', false, false, 'must-try'],
    ['paneer-achari-tikka', 'Paneer Achari Tikka', 285, 'Tangy pickle-flavoured paneer grilled in tandoor.', true, false],
    ['paneer-huaryali-tikka', 'Paneer Hariyali Tikka', 280, 'Mint & coriander marinated paneer cubes.', false, false],
    ['hara-bhara-kebab', 'Hara Bhara Kebab', 240, 'Spinach, green peas & potato patties.', true, false, 'bestseller'],
    ['crispy-corn', 'Crispy Corn & Salt Pepper', 220, 'Golden fried sweet corn tossed with peppercorns.', false, false],
    ['tandoori-mushroom', 'Tandoori Stuffed Mushroom', 260, 'Mushrooms stuffed with cheese & herbs.', false, false, 'new'],
    ['veg-seekh-kebab', 'Veg Seekh Kebab', 230, 'Minced vegetable skewers grilled over coals.', false, false],
    ['dahi-ke-kebab', 'Dahi Ke Kebab', 260, 'Hung curd patties with cardamom and coriander.', true, false, 'must-try'],
    ['corn-cheese-balls', 'Corn Cheese Balls', 230, 'Deep-fried cheese & corn bites.', false, false],
    ['veg-spring-roll', 'Veg Spring Roll', 210, 'Crispy rolls with shredded veggies.', false, false],
    ['crispy-lotus-stem', 'Crispy Honey Lotus Stem', 250, 'Lotus stems tossed in sweet honey chili sauce.', false, false, 'new'],
    ['tandoori-aloo', 'Tandoori Stuffed Aloo', 220, 'Scooped potatoes stuffed with dry fruits & paneer.', false, false],
    ['soya-chaap-tikka', 'Soya Chaap Tikka', 250, 'Protein-packed soya chunks in tandoori marinade.', true, false, 'bestseller'],
    ['malai-soya-chaap', 'Malai Soya Chaap', 260, 'Creamy cashew-marinated soya chaap.', false, false],
    ['achari-soya-chaap', 'Achari Soya Chaap', 255, 'Pickle spiced soya chaap grilled in clay oven.', true, false],
    ['cheesy-paneer-bites', 'Cheesy Paneer Pops', 240, 'Crispy crumbed paneer pops with dip.', false, false],
    ['veg-tandoori-platter', 'Veg Tandoori Platter', 450, 'Assorted paneer, hara bhara, mushroom & chaap.', true, false, 'must-try'],
  ];

  const startersNonVeg = [
    ['chicken-tikka', 'Chicken Tikka Classic', 320, 'Boneless chicken marinated in yogurt & spices.', true, true, 'bestseller'],
    ['chicken-malai-tikka', 'Chicken Reshmi / Malai Tikka', 340, 'Melt-in-mouth creamy chicken tikka.', true, false, 'must-try'],
    ['tandoori-chicken-half', 'Tandoori Chicken (Half)', 340, 'Classic red tandoori chicken on the bone.', true, true, 'bestseller'],
    ['tandoori-chicken-full', 'Tandoori Chicken (Full)', 580, 'Full tandoori chicken roasted in clay oven.', true, true],
    ['chicken-seekh-kebab', 'Chicken Seekh Kebab', 310, 'Minced chicken skewers with spices & herbs.', true, false],
    ['mutton-seekh-kebab', 'Mutton Seekh Kebab', 380, 'Minced mutton kebab grilled over hot coals.', true, true, 'bestseller'],
    ['tangdi-kebab', 'Chicken Tangdi Kebab (3 Pcs)', 350, 'Stuffed chicken drumsticks roasted in tandoor.', true, false],
    ['chicken-boti-kebab', 'Chicken Boti Kebab', 330, 'Spicy dark-meat chicken chunks grilled on skewer.', true, false],
    ['afghani-chicken-half', 'Afghani Chicken (Half)', 360, 'Mild cashew and cream roasted chicken.', false, false, 'new'],
    ['fish-amritsari', 'Fish Amritsari', 380, 'Crispy batter fried fish fillets with carom seeds.', true, false, 'must-try'],
    ['fish-tikka', 'Tandoori Fish Tikka', 390, 'Surmai/Basa fish cubes in tandoori marinade.', true, false],
    ['prawns-koliwada', 'Prawns Koliwada', 440, 'Spicy Mumbai coastal batter-fried prawns.', true, true, 'bestseller'],
    ['tandoori-prawns', 'Tandoori Prawns (6 Pcs)', 460, 'Jumbo prawns grilled in tandoori spices.', true, false, 'must-try'],
    ['chicken-65', 'Chicken 65', 320, 'South Indian deep-fried spicy curry-leaf chicken.', true, false],
    ['chicken-popcorn', 'Crispy Chicken Popcorn', 270, 'Bite-sized crunchy chicken bites.', false, false],
    ['chicken-tandoori-platter', 'Non-Veg Tandoori Platter', 650, 'Platter of chicken tikka, seekh, tangdi & fish.', true, false, 'bestseller'],
    ['mutton-galouti-kebab', 'Lucknowi Mutton Galouti Kebab', 420, 'Ultra soft Lucknowi melting mutton patty.', true, false, 'must-try'],
  ];

  startersVeg.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'starters', price as number, desc as string, true, popular as boolean, spicy as boolean, badge as any)
  );
  startersNonVeg.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'starters', price as number, desc as string, false, popular as boolean, spicy as boolean, badge as any)
  );

  // ── 2. MAIN COURSE & CURRIES (60 items) ───────────────
  const mainsVeg = [
    ['dal-makhani', 'Dal Makhani Special', 260, 'Slow-cooked black lentils with white butter & cream.', true, false, 'bestseller'],
    ['dal-tadka', 'Yellow Dal Tadka', 210, 'Arhar dal tempered with ghee, cumin & garlic.', false, true],
    ['dal-fry', 'Dhaba Dal Fry', 200, 'Spiced yellow lentils with onion & tomato fry.', false, false],
    ['paneer-butter-masala', 'Paneer Butter Masala', 300, 'Paneer cubes in creamy buttery tomato gravy.', true, false, 'bestseller'],
    ['kadhai-paneer', 'Kadhai Paneer', 290, 'Paneer cooked with capsicum & fresh kadhai masala.', false, true],
    ['palak-paneer', 'Palak Paneer', 270, 'Pureed spinach gravy with cottage cheese cubes.', false, false],
    ['paneer-tikka-masala', 'Paneer Tikka Masala', 310, 'Chargrilled paneer tikka in spicy gravy.', true, true, 'must-try'],
    ['paneer-lababdar', 'Paneer Lababdar', 320, 'Rich onion-tomato gravy with grated paneer.', true, false],
    ['paneer-do-pyaza', 'Paneer Do Pyaza', 285, 'Paneer curry cooked with double onions.', false, false],
    ['shahi-paneer', 'Shahi Paneer', 295, 'Sweet & creamy royal cashew-almond gravy.', false, false],
    ['matar-paneer', 'Home Style Matar Paneer', 250, 'Green peas and paneer in light gravy.', false, false],
    ['paneer-pasanda', 'Paneer Pasanda', 330, 'Stuffed paneer sandwiches in rich white gravy.', false, false, 'new'],
    ['malai-kofta', 'Malai Kofta (Red Gravy)', 310, 'Cheese dumplings in cashew tomato gravy.', false, false, 'bestseller'],
    ['white-malai-kofta', 'Malai Kofta (White Gravy)', 320, 'Dumplings in aromatic white cashew cream.', false, false],
    ['mix-veg-handi', 'Mix Veg Handi', 240, 'Seasonal vegetables cooked in clay pot gravy.', false, false],
    ['veg-kolhapuri', 'Spicy Veg Kolhapuri', 250, 'Fiery Kolhapuri spicy mixed veg gravy.', false, true, 'must-try'],
    ['veg-makhanwala', 'Veg Makhanwala', 245, 'Mixed vegetables in sweet makhani butter sauce.', false, false],
    ['bhindi-masala', 'Bhindi Masala Fry', 220, 'Okra stir-fried with onions & Indian spices.', false, false],
    ['aloo-gobi-matar', 'Aloo Gobi Matar', 210, 'Home style cauliflower, potato & pea dry curry.', false, false],
    ['chole-masala', 'Amritsari Chole Masala', 220, 'Dark chickpea curry with dried pomegranate.', true, true, 'bestseller'],
    ['rajma-masala', 'Punjabi Rajma Masala', 210, 'Kidney beans cooked in thick tomato gravy.', false, false],
    ['dum-aloo-punjabi', 'Punjabi Dum Aloo', 230, 'Baby potatoes simmered in spicy gravy.', false, false],
    ['kashmiri-dum-aloo', 'Kashmiri Dum Aloo', 250, 'Stuffed potatoes in sweet yogurt gravy.', false, false],
    ['mushroom-masala', 'Mushroom Masala', 270, 'Button mushrooms in rich spicy onion gravy.', false, true],
    ['mushroom-do-pyaza', 'Mushroom Do Pyaza', 275, 'Mushrooms with crunchy onion petals.', false, false],
    ['methi-matar-malai', 'Methi Matar Malai', 280, 'Fresh fenugreek & green peas in cream.', false, false, 'new'],
    ['sarson-ka-saag', 'Sarson Ka Saag (Seasonal)', 260, 'Traditional Punjabi mustard greens with butter.', true, false, 'must-try'],
    ['kadhi-pakora', 'Punjabi Kadhi Pakora', 200, 'Tangy yogurt curry with onion fritters.', false, false],
    ['veg-korma', 'Navratan Veg Korma', 270, 'Nine gems vegetable curry with dry fruits.', false, false],
    ['sev-tamatar', 'Rajasthani Sev Tamatar', 210, 'Spicy tomato curry topped with crispy sev.', false, true],
  ];

  const mainsNonVeg = [
    ['butter-chicken', 'Butter Chicken Classic', 380, 'Tandoori chicken in rich makhani gravy.', true, false, 'bestseller'],
    ['chicken-tikka-masala', 'Chicken Tikka Masala', 390, 'Grilled chicken tikka in spicy tomato gravy.', true, true, 'bestseller'],
    ['kadhai-chicken', 'Kadhai Chicken', 370, 'Chicken with capsicum & freshly pounded spices.', true, true],
    ['dhaba-chicken-curry', 'Dhaba Chicken Curry', 360, 'Spicy highway dhaba style chicken curry.', true, true],
    ['chicken-curry-home', 'Home Style Chicken Curry', 340, 'Light thin gravy chicken like mom makes.', false, false],
    ['chicken-do-pyaza', 'Chicken Do Pyaza', 365, 'Chicken cooked with double portion of onions.', false, false],
    ['chicken-handi', 'Chicken Handi', 385, 'Boneless chicken cooked slow in earthen pot.', false, false],
    ['chicken-rarah', 'Chicken Rarah', 410, 'Chicken pieces & chicken minced keema together.', true, true, 'must-try'],
    ['chicken-korma', 'Shahi Chicken Korma', 390, 'Mughlai chicken in almond cashew gravy.', false, false],
    ['chicken-saagwala', 'Chicken Saagwala', 360, 'Chicken pieces cooked in spinach puree.', false, false],
    ['chicken-kolhapuri', 'Chicken Kolhapuri', 375, 'Fiery Maharashtra style spicy chicken.', true, true],
    ['chicken-changrezi', 'Chicken Changrezi', 400, 'Old Delhi style rich fried chicken curry.', true, false, 'new'],
    ['mutton-rogan-josh', 'Mutton Rogan Josh', 480, 'Kashmiri mutton curry with aromatic spices.', true, true, 'bestseller'],
    ['mutton-korma', 'Mughlai Mutton Korma', 490, 'Rich mutton curry with fried onions & nut paste.', true, false],
    ['mutton-rarah', 'Mutton Rarah Keema', 520, 'Tender mutton chops cooked with mutton keema.', true, true, 'must-try'],
    ['mutton-do-pyaza', 'Mutton Do Pyaza', 485, 'Mutton cooked with sautéed onion bulbs.', false, false],
    ['mutton-saagwala', 'Mutton Saagwala', 475, 'Mutton chunks simmered in spinach gravy.', false, false],
    ['mutton-bhuna-gosht', 'Bhuna Gosht', 510, 'Pan-fried mutton in dry thick roasted masala.', true, true, 'bestseller'],
    ['nalli-nihari', 'Mutton Nalli Nihari', 550, 'Slow-cooked mutton shank stew with ginger.', true, true, 'must-try'],
    ['fish-curry-bengali', 'Bengali Fish Curry (Rohu/Katla)', 370, 'Mustard oil fish curry with nigella seeds.', false, false],
    ['goan-fish-curry', 'Goan Fish Curry', 390, 'Coconut milk and tamarind tangy fish curry.', false, false, 'new'],
    ['fish-tikka-masala', 'Fish Tikka Masala', 410, 'Grilled fish tikka in spicy gravy.', false, true],
    ['prawns-curry', 'Goan Prawns Curry', 460, 'Juicy prawns in spicy coconut coastal gravy.', true, false, 'bestseller'],
    ['prawns-masala', 'Kadhai Prawns Masala', 470, 'Prawns wok-tossed with capsicum & onion.', true, true],
    ['egg-curry-2pcs', 'Dhaba Egg Curry (2 Eggs)', 220, 'Boiled fried eggs in onion tomato gravy.', false, true],
    ['egg-bhurji-curry', 'Egg Bhurji Curry', 210, 'Scrambled eggs in spicy gravy.', false, true],
    ['chicken-keema-matar', 'Chicken Keema Matar', 350, 'Minced chicken with green peas.', true, false],
    ['mutton-keema-kaleji', 'Mutton Keema Kaleji', 440, 'Minced mutton with mutton liver.', true, true, 'must-try'],
    ['butter-chicken-boneless', 'Butter Chicken Boneless', 400, '100% boneless breast pieces in makhani gravy.', true, false, 'bestseller'],
    ['chicken-kali-mirch', 'Chicken Kali Mirch', 380, 'Black pepper white gravy chicken.', false, false, 'new'],
  ];

  mainsVeg.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'main-course', price as number, desc as string, true, popular as boolean, spicy as boolean, badge as any)
  );
  mainsNonVeg.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'main-course', price as number, desc as string, false, popular as boolean, spicy as boolean, badge as any)
  );

  // ── 3. BREADS, RICE & BIRYANI (50 items) ───────────────
  const breads = [
    ['tandoori-roti-plain', 'Tandoori Roti Plain', 35, 'Whole wheat clay oven roti.', true, false],
    ['tandoori-roti-butter', 'Tandoori Roti Butter', 40, 'Clay oven roti brushed with butter.', true, false, 'bestseller'],
    ['rumali-roti', 'Rumali Roti', 45, 'Paper-thin soft hand-tossed roti.', false, false],
    ['plain-naan', 'Plain Naan', 60, 'Soft leavened tandoori bread.', false, false],
    ['butter-naan', 'Butter Naan', 70, 'Tandoori naan coated with melted butter.', true, false, 'bestseller'],
    ['garlic-naan', 'Garlic Naan', 80, 'Naan topped with chopped garlic & butter.', true, false, 'bestseller'],
    ['cheese-garlic-naan', 'Cheese Garlic Naan', 110, 'Naan stuffed with cheese & garlic.', true, false, 'must-try'],
    ['chili-garlic-naan', 'Chili Garlic Naan', 90, 'Naan topped with green chili & garlic.', false, true],
    ['laccha-paratha-plain', 'Plain Laccha Paratha', 55, 'Multi-layered crispy wheat paratha.', false, false],
    ['laccha-paratha-butter', 'Butter Laccha Paratha', 65, 'Multi-layered paratha with butter.', true, false],
    ['pudina-paratha', 'Pudina Paratha', 65, 'Mint flavoured layered tandoori paratha.', false, false],
    ['stuffed-aloo-kulcha', 'Amritsari Aloo Kulcha', 90, 'Crispy bread stuffed with spiced potato.', true, false, 'bestseller'],
    ['stuffed-paneer-kulcha', 'Paneer Kulcha', 110, 'Bread stuffed with seasoned paneer.', true, false],
    ['stuffed-onion-kulcha', 'Onion Kulcha', 85, 'Bread stuffed with chopped spiced onions.', false, false],
    ['missi-roti', 'Missi Roti', 50, 'Gram flour bread seasoned with spices.', false, false],
    ['khasta-roti', 'Khasta Roti', 45, 'Crispy flaky tandoori roti.', false, false],
    ['keema-naan-gravy', 'Mutton Keema Naan with Gravy', 160, 'Naan stuffed with keema, served with gravy.', true, false, 'must-try'],
    ['keema-naan-chicken', 'Chicken Keema Naan', 140, 'Naan stuffed with chicken keema.', false, false],
    ['cheese-naan', 'Cheesy Melt Naan', 100, 'Mozzarella stuffed hot naan.', false, false, 'new'],
    ['makki-di-roti', 'Makki Di Roti (Seasonal)', 45, 'Cornflour roti served with white butter.', false, false],
  ];

  const riceBiryani = [
    ['steamed-basmati-rice', 'Steamed Basmati Rice', 120, 'Long grain fluffy white basmati rice.', false, false],
    ['jeera-rice', 'Jeera Rice', 150, 'Basmati rice tempered with cumin & ghee.', true, false, 'bestseller'],
    ['veg-pulao', 'Veg Pulao', 180, 'Basmati rice with mixed vegetables & spices.', false, false],
    ['peas-pulao', 'Matar Pulao', 170, 'Green peas basmati pulao.', false, false],
    ['paneer-pulao', 'Paneer Pulao', 210, 'Basmati rice cooked with paneer cubes.', false, false],
    ['kashmiri-pulao', 'Kashmiri Pulao', 230, 'Sweet basmati pulao with fruits & dry fruits.', false, false, 'new'],
    ['veg-dum-biryani', 'Veg Dum Biryani', 260, 'Saffron basmati rice cooked with vegetables in dum.', true, false, 'bestseller'],
    ['paneer-tikka-biryani', 'Paneer Tikka Biryani', 290, 'Chargrilled paneer tikka layered in biryani.', true, false],
    ['hyderabadi-chicken-biryani', 'Hyderabadi Chicken Biryani', 360, 'Authentic spicy chicken dum biryani.', true, true, 'bestseller'],
    ['boneless-chicken-biryani', 'Boneless Chicken Biryani', 380, 'Boneless chicken biryani with mirchi ka salan.', true, false],
    ['chicken-tikka-biryani', 'Chicken Tikka Biryani', 370, 'Tandoori chicken tikka layered in rice.', true, true],
    ['lucknowi-chicken-biryani', 'Lucknowi Chicken Biryani', 365, 'Mild aromatic Awadhi chicken biryani.', false, false],
    ['mutton-dum-biryani', 'Hyderabadi Mutton Dum Biryani', 460, 'Tender mutton pieces layered in dum biryani.', true, true, 'bestseller'],
    ['mutton-boneless-biryani', 'Boneless Mutton Biryani', 490, 'Juicy boneless mutton biryani.', true, false, 'must-try'],
    ['egg-biryani', 'Egg Dum Biryani (2 Eggs)', 240, 'Boiled fried eggs in spicy biryani rice.', false, false],
    ['prawns-biryani', 'Coastal Prawns Biryani', 480, 'Spiced prawns biryani with coastal spices.', true, false, 'must-try'],
    ['fish-biryani', 'Fish Tikka Biryani', 420, 'Tandoori fish cubes biryani.', false, false],
    ['curd-rice', 'South Indian Curd Rice', 160, 'Chilled curd rice tempered with mustard & curry leaves.', false, false, 'healthy'],
    ['schezwan-biryani-chicken', 'Schezwan Fusion Chicken Biryani', 370, 'Spicy Schezwan chicken biryani fusion.', true, true],
    ['ghee-rice', 'Kerala Ghee Rice', 190, 'Basmati rice cooked in pure desi ghee.', false, false],
    ['biryani-rice-plain', 'Biryani Rice (Plain)', 180, 'Aromatic biryani rice without meat/veg.', false, false],
    ['salan-portion', 'Mirchi Ka Salan (Extra Portion)', 50, 'Hyderabadi spicy chili peanut gravy for biryani.', false, true],
    ['raita-biryani-portion', 'Biryani Raita (Extra Portion)', 40, 'Yogurt raita side for biryani.', false, false],
    ['dal-khichdi', 'Dal Khichdi Tadka', 190, 'Comforting rice and lentil khichdi with ghee tadka.', false, false, 'bestseller'],
    ['palak-dal-khichdi', 'Palak Dal Khichdi', 210, 'Spinach infused healthy dal khichdi.', false, false],
    ['butter-khichdi', 'Amul Butter Khichdi', 220, 'Rich butter loaded comforting khichdi.', false, false],
    ['sambar-rice', 'Sambar Rice Bowl', 170, 'South Indian lentil sambar rice.', false, false],
    ['lemon-rice', 'Tangy Lemon Rice', 160, 'Turmeric & lemon tempered basmati rice.', false, false],
    ['tomato-rice', 'Spicy Tomato Rice', 165, 'Tempered tomato basmati rice.', false, true],
    ['coconut-rice', 'South Indian Coconut Rice', 180, 'Grated coconut basmati rice.', false, false],
  ];

  breads.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'breads-rice', price as number, desc as string, true, popular as boolean, spicy as boolean, badge as any)
  );
  riceBiryani.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'breads-rice', price as number, desc as string, (id as string).includes('chicken') || (id as string).includes('mutton') || (id as string).includes('fish') || (id as string).includes('prawns') ? false : true, popular as boolean, spicy as boolean, badge as any)
  );

  // ── 4. SOUPS, SALADS & PAPAD (30 items) ───────────────
  const soupsSalads = [
    ['fresh-green-salad', 'Fresh Green Salad', 90, 'Sliced cucumber, tomato, carrot & onion.', true, false],
    ['masala-papad-roasted', 'Masala Papad (Roasted)', 50, 'Roasted papad with onion tomato masala.', true, false, 'bestseller'],
    ['masala-papad-fried', 'Masala Papad (Fried)', 60, 'Fried papad with onion tomato masala.', false, false],
    ['plain-papad-roasted', 'Plain Papad (Roasted 2 Pcs)', 30, 'Crispy roasted lentil papad.', false, false],
    ['plain-papad-fried', 'Plain Papad (Fried 2 Pcs)', 40, 'Crispy deep fried papad.', false, false],
    ['peanut-masala', 'Peanut Masala Chaat', 140, 'Roasted peanuts with onion, chillies & lemon.', true, true, 'bestseller'],
    ['chana-chatpata', 'Chana Chatpata Salan', 130, 'Spiced boiled chickpeas with lemon & coriander.', false, false],
    ['cucumber-salad', 'Sliced Cucumber Salad', 70, 'Chilled cucumber slices with rock salt.', false, false],
    ['onion-salad', 'Lachha Onion Salad', 50, 'Ring onion salad with green chillies & lemon.', false, true],
    ['kachumber-salad', 'Punjabi Kachumber Salad', 100, 'Diced cucumber, tomato & onion salad.', false, false],
    ['russian-salad', 'Veg Russian Salad', 160, 'Diced veggies and pineapple in creamy mayo dressing.', false, false],
    ['caesar-salad-veg', 'Veg Caesar Salad', 180, 'Crispy lettuce, croutons & parmesan dressing.', false, false, 'new'],
    ['chicken-caesar-salad', 'Grilled Chicken Caesar Salad', 230, 'Grilled chicken breast with lettuce & dressing.', false, false],
    ['sprouted-moong-salad', 'Sprouted Moong Salad', 120, 'Healthy sprouted moong with pomegranate.', false, false, 'healthy'],
    ['fruit-salad-bowl', 'Fresh Fruit Salad Bowl', 150, 'Assorted fresh seasonal fruits.', false, false],
    ['cream-of-tomato-soup', 'Cream of Tomato Soup', 130, 'Classic tomato soup with croutons.', false, false],
    ['veg-manchow-soup', 'Veg Manchow Soup', 140, 'Spicy soup served with crispy noodles.', true, true, 'bestseller'],
    ['chicken-manchow-soup', 'Chicken Manchow Soup', 160, 'Chicken manchow soup with fried noodles.', true, true],
    ['hot-sour-veg-soup', 'Hot & Sour Veg Soup', 135, 'Tangy spicy dark vegetable soup.', false, true],
    ['hot-sour-chicken-soup', 'Hot & Sour Chicken Soup', 155, 'Tangy spicy chicken soup.', false, true],
    ['sweet-corn-veg-soup', 'Sweet Corn Veg Soup', 130, 'Mild creamy sweet corn soup.', false, false],
    ['sweet-corn-chicken-soup', 'Sweet Corn Chicken Soup', 150, 'Sweet corn soup with shredded chicken.', false, false],
    ['lemon-coriander-soup', 'Lemon Coriander Veg Soup', 140, 'Vitamin C rich clear lemon coriander soup.', false, false, 'healthy'],
    ['lemon-coriander-chicken', 'Lemon Coriander Chicken Soup', 160, 'Clear chicken lemon coriander broth.', false, false],
    ['mutton-yakhni-soup', 'Mutton Yakhni Shorba', 190, 'Aromatic slow cooked mutton bone broth.', true, false, 'must-try'],
    ['tomato-dhaniya-shorba', 'Tomato Dhaniya Shorba', 125, 'Indian spiced coriander tomato soup.', false, false],
    ['dal-shorba', 'Yellow Dal Shorba', 120, 'Lentil soup tempered with cumin & garlic.', false, false],
    ['papad-basket', 'Assorted Papad & Fryams Basket', 110, 'Basket of 4 types of fried papads & chips.', false, false],
    ['cheese-masala-papad', 'Cheese Masala Papad', 80, 'Masala papad topped with grated cheese.', false, false, 'new'],
    ['chili-garlic-papad', 'Chili Garlic Fried Papad', 65, 'Papad brushed with chili garlic butter.', false, true],
  ];

  soupsSalads.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'soups-salads', price as number, desc as string, (id as string).includes('chicken') || (id as string).includes('mutton') ? false : true, popular as boolean, spicy as boolean, badge as any)
  );

  // ── 5. RAITA & SIDES (20 items) ────────────────────────
  const raitaSides = [
    ['boondi-raita', 'Boondi Raita', 110, 'Curd with crispy boondi & cumin powder.', true, false, 'bestseller'],
    ['pineapple-raita', 'Pineapple Raita', 140, 'Sweet curd with juicy pineapple chunks.', false, false],
    ['mix-veg-raita', 'Mix Veg Raita', 120, 'Curd mixed with diced cucumber, tomato & onion.', false, false],
    ['cucumber-raita', 'Cucumber Mint Raita', 110, 'Grated cucumber and fresh mint curd.', false, false],
    ['aloo-raita', 'Spicy Aloo Raita', 105, 'Boiled potato cubes in spiced curd.', false, true],
    ['onion-raita', 'Pyaaz Ka Raita', 100, 'Chopped onion and green chili curd.', false, false],
    ['burani-raita', 'Garlic Burani Raita', 130, 'Roasted garlic & red chili spiced curd.', true, false, 'must-try'],
    ['fruit-raita', 'Fresh Mix Fruit Raita', 150, 'Sweet curd with pomegranate, apple & grapes.', false, false],
    ['pomegranate-raita', 'Anardana Raita', 140, 'Curd with fresh pomegranate seeds.', false, false],
    ['pudina-raita', 'Fresh Pudina Raita', 105, 'Pureed mint leaves curd.', false, false],
    ['dahi-bowl-sweet', 'Fresh Sweet Dahi Bowl', 70, 'Thick set sweetened curd.', false, false],
    ['dahi-bowl-plain', 'Plain Curd Bowl (200g)', 60, 'Fresh chilled curd bowl.', false, false],
    ['tadka-dahi', 'Punjabi Tadka Dahi', 95, 'Curd tempered with mustard seeds & curry leaves.', false, true, 'new'],
    ['hung-curd-dip', 'Garlic Herb Hung Curd Dip', 80, 'Thick creamy dip for kebabs.', false, false],
    ['extra-mint-chutney', 'Extra Mint Chutney Container', 30, 'Fresh green chutney.', false, false],
    ['extra-tamarind-chutney', 'Extra Imli Chutney Container', 30, 'Sweet tamarind chutney.', false, false],
    ['extra-schezwan-dip', 'Extra Schezwan Dip', 35, 'Fiery Schezwan dip container.', false, true],
    ['extra-mayo-dip', 'Garlic Mayo Dip', 35, 'Creamy mayo dip.', false, false],
    ['pickle-container', 'Mixed Mango & Chili Pickle', 25, 'Spicy Indian pickle.', false, true],
    ['sirka-pyaz-container', 'Vinegar Onion Container (Sirka Pyaaz)', 35, 'Red vinegar onions.', false, false],
  ];

  raitaSides.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'raita-curd', price as number, desc as string, true, popular as boolean, spicy as boolean, badge as any)
  );

  // ── 6. INDO-CHINESE (30 items) ─────────────────────────
  const indoChinese = [
    ['veg-hakka-noodles', 'Veg Hakka Noodles', 190, 'Wok-tossed noodles with crunchy veggies.', true, false, 'bestseller'],
    ['schezwan-veg-noodles', 'Schezwan Veg Noodles', 205, 'Spicy Schezwan sauce tossed noodles.', false, true],
    ['chili-garlic-noodles', 'Chili Garlic Veg Noodles', 200, 'Noodles tossed with chili garlic oil.', false, true],
    ['chicken-hakka-noodles', 'Chicken Hakka Noodles', 230, 'Noodles tossed with chicken & egg.', true, false, 'bestseller'],
    ['chicken-schezwan-noodles', 'Chicken Schezwan Noodles', 245, 'Spicy chicken Schezwan noodles.', false, true],
    ['egg-hakka-noodles', 'Egg Hakka Noodles', 210, 'Wok-tossed noodles with scrambled egg.', false, false],
    ['veg-fried-rice', 'Veg Fried Rice', 190, 'Basmati rice fried with vegetables & soy sauce.', false, false],
    ['schezwan-veg-fried-rice', 'Schezwan Veg Fried Rice', 205, 'Spicy Schezwan sauce fried rice.', false, true],
    ['chicken-fried-rice', 'Chicken Fried Rice', 230, 'Rice fried with chicken, egg & veggies.', true, false, 'bestseller'],
    ['chicken-schezwan-fried-rice', 'Chicken Schezwan Fried Rice', 245, 'Spicy Schezwan chicken fried rice.', false, true],
    ['egg-fried-rice', 'Egg Fried Rice', 210, 'Rice fried with scrambled eggs.', false, false],
    ['chili-paneer-dry', 'Chili Paneer (Dry)', 250, 'Crispy paneer tossed with capsicum & green chillies.', true, true, 'bestseller'],
    ['chili-paneer-gravy', 'Chili Paneer (Gravy)', 260, 'Paneer cubes in spicy chili-garlic soy gravy.', false, true],
    ['veg-manchurian-dry', 'Veg Manchurian (Dry)', 230, 'Deep fried veg balls tossed in Manchurian sauce.', false, false],
    ['veg-manchurian-gravy', 'Veg Manchurian (Gravy)', 240, 'Veg balls in thick savory garlic Manchurian gravy.', true, false, 'bestseller'],
    ['chicken-chili-dry', 'Chili Chicken (Dry)', 290, 'Crispy fried chicken tossed with chillies & onions.', true, true, 'bestseller'],
    ['chicken-chili-gravy', 'Chili Chicken (Gravy)', 300, 'Chicken chunks in dark chili garlic gravy.', false, true],
    ['chicken-manchurian-dry', 'Chicken Manchurian (Dry)', 290, 'Fried chicken in Manchurian glaze.', false, false],
    ['chicken-manchurian-gravy', 'Chicken Manchurian (Gravy)', 300, 'Chicken balls in thick Manchurian sauce.', false, false],
    ['honey-chili-potato', 'Crispy Honey Chili Potato', 220, 'Fried potato fingers in honey chili glaze.', true, false, 'must-try'],
    ['crispy-veg-salt-pepper', 'Crispy Veg Salt & Pepper', 230, 'Mixed vegetables fried crisp with peppercorns.', false, false],
    ['crispy-chicken-threads', 'Crispy Threaded Chicken', 310, 'Chicken strips wrapped in noodles & fried.', false, false, 'new'],
    ['dragon-chicken', 'Spicy Dragon Chicken', 320, 'Chicken strips in sweet & spicy cashew sauce.', false, true, 'must-try'],
    ['triple-schezwan-veg', 'Triple Schezwan Veg Rice', 270, 'Combination of fried rice, noodles & Manchurian gravy.', true, true, 'bestseller'],
    ['triple-schezwan-chicken', 'Triple Schezwan Chicken Rice', 310, 'Fried rice, noodles & chicken gravy combo.', true, true, 'bestseller'],
    ['american-chopsuey-veg', 'Veg American Chopsuey', 240, 'Crispy fried noodles topped with sweet & sour veg gravy.', false, false],
    ['american-chopsuey-chicken', 'Chicken American Chopsuey', 280, 'Crispy noodles with chicken chopsuey sauce.', false, false],
    ['spring-roll-chicken', 'Chicken Spring Roll', 250, 'Crispy rolls filled with shredded chicken.', false, false],
    ['pan-fried-noodles-veg', 'Pan Fried Veg Noodles in White Sauce', 250, 'Crispy pan fried noodles with creamy white sauce.', false, false, 'new'],
    ['paneer-65-chinese', 'Chinese Style Paneer 65', 255, 'Deep fried spicy tossed paneer.', false, true],
  ];

  indoChinese.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'indo-chinese', price as number, desc as string, (id as string).includes('chicken') || (id as string).includes('egg') ? false : true, popular as boolean, spicy as boolean, badge as any)
  );

  // ── 7. CHAAT & STREET SNACKS (25 items) ───────────────
  const snacksChaat = [
    ['mumbai-pav-bhaji', 'Mumbai Butter Pav Bhaji', 180, 'Mashed vegetable curry with butter & 2 pavs.', true, false, 'bestseller'],
    ['cheese-pav-bhaji', 'Cheese Loaded Pav Bhaji', 210, 'Pav bhaji topped with melted cheese.', true, false],
    ['extra-pav-pair', 'Extra Butter Pav (Pair)', 40, 'Two soft toasted butter pavs.', false, false],
    ['pani-puri-8pcs', 'Pani Puri (8 Pcs)', 80, 'Puris filled with ragda, sweet & spicy pani.', true, true, 'bestseller'],
    ['dahi-puri-6pcs', 'Dahi Puri (6 Pcs)', 110, 'Puris stuffed with potatoes, sweet curd & sev.', true, false],
    ['sev-puri-6pcs', 'Sev Puri (6 Pcs)', 100, 'Flat crispy puris topped with potatoes, chutneys & sev.', false, false],
    ['bhel-puri-special', 'Special Mumbai Bhel Puri', 95, 'Puffed rice tossed with chutneys, onions & sev.', false, false],
    ['samosa-chaat', 'Amritsari Samosa Chaat (2 Pcs)', 120, 'Crushed samosas topped with chole, curd & chutneys.', true, true, 'bestseller'],
    ['aloo-tikki-chaat', 'Dahi Aloo Tikki Chaat', 130, 'Golden potato patties with curd & sweet chutney.', false, false],
    ['papdi-chaat', 'Dahi Papdi Chaat', 125, 'Crispy papdis topped with curd, potatoes & pomegranate.', false, false],
    ['kachori-chaat', 'Raj Kachori Grand Chaat', 160, 'Large crispy shell stuffed with sprouts, curd & chutneys.', true, false, 'must-try'],
    ['vadapav-classic', 'Mumbai Vada Pav (2 Pcs)', 90, 'Spiced potato fritter in bun with dry garlic chutney.', true, false, 'bestseller'],
    ['cheese-vadapav', 'Cheese Vada Pav (2 Pcs)', 120, 'Vada pav loaded with cheese slice.', false, false],
    ['misal-pav-puneri', 'Puneri Misal Pav', 160, 'Spicy sprouted moth bean curry with farsan & pav.', true, true, 'bestseller'],
    ['extra-farsan-misal', 'Extra Misal Farsan Bowl', 50, 'Crunchy farsan topping.', false, false],
    ['paneer-franki-roll', 'Paneer Tikka Kathi Roll', 170, 'Whole wheat paratha wrapped with paneer tikka.', true, false],
    ['chicken-franki-roll', 'Chicken Kathi Roll', 190, 'Paratha wrap filled with chicken tikka & onions.', true, false, 'bestseller'],
    ['double-egg-roll', 'Double Egg Franki Roll', 140, 'Egg coated roll with onions & green chutney.', false, false],
    ['veg-grilled-sandwich', 'Veg Cheese Grilled Sandwich', 160, 'Triple layer sandwich filled with veggies & cheese.', false, false],
    ['bombay-masala-toast', 'Bombay Masala Toast Sandwich', 140, 'Toasted sandwich with spiced potato filling.', false, false],
    ['cheese-garlic-bread', 'Cheesy Garlic Bread (4 Pcs)', 170, 'Toasted baguettes topped with garlic & cheese.', false, false],
    ['chili-cheese-toast', 'Chili Cheese Toast', 150, 'Toasted bread with green chillies & melted cheese.', false, true],
    ['french-fries-classic', 'Classic Salted French Fries', 130, 'Golden crispy potato fries.', false, false],
    ['peri-peri-fries', 'Peri Peri Masala Fries', 150, 'Fries dusted with spicy Peri Peri seasoning.', true, true, 'bestseller'],
    ['loaded-cheese-fries', 'Loaded Cheese Fries', 180, 'Fries topped with liquid cheese & jalapeños.', false, false, 'new'],
  ];

  snacksChaat.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'snacks-chaat', price as number, desc as string, (id as string).includes('chicken') || (id as string).includes('egg') ? false : true, popular as boolean, spicy as boolean, badge as any)
  );

  // ── 8. SHAKES & THICK DRINKS (20 items) ───────────────
  const shakes = [
    ['belgian-chocolate-shake', 'Belgian Dark Chocolate Shake', 160, 'Thick dark chocolate shake with chocolate ice cream.', true, false, 'bestseller'],
    ['oreo-thick-shake', 'Oreo Cookie Crunch Shake', 170, 'Oreo cookies blended with vanilla ice cream.', true, false, 'bestseller'],
    ['mango-mastani-shake', 'Alphonso Mango Mastani Shake', 180, 'Thick mango shake topped with ice cream & dry fruits.', true, false, 'must-try'],
    ['kitkat-freakshake', 'KitKat Overload Freakshake', 210, 'KitKat wafer shake with chocolate sauce & whipped cream.', false, false, 'new'],
    ['cold-coffee-icecream', 'Cold Coffee with Vanilla Ice Cream', 150, 'Rich espresso cold coffee topped with vanilla scoop.', true, false, 'bestseller'],
    ['classic-cold-coffee', 'Classic Frappe Cold Coffee', 130, 'Blended icy cold coffee.', false, false],
    ['hazelnut-cold-coffee', 'Hazelnut Cold Coffee', 170, 'Flavoured hazelnut icy coffee shake.', false, false],
    ['strawberry-thick-shake', 'Fresh Strawberry Thick Shake', 160, 'Strawberry pulp blended with milk and ice cream.', false, false],
    ['nutella-shake', 'Nutella Hazelnut Milkshake', 190, 'Creamy Nutella chocolate shake.', true, false, 'must-try'],
    ['ferrero-rocher-shake', 'Ferrero Rocher Premium Shake', 230, 'Crushed Ferrero Rocher chocolate shake.', false, false, 'new'],
    ['butterscotch-shake', 'Crunchy Butterscotch Shake', 150, 'Butterscotch shake with praline crunch.', false, false],
    ['vanilla-bean-shake', 'Classic Vanilla Bean Milkshake', 140, 'Pure vanilla ice cream shake.', false, false],
    ['dry-fruit-khajoor-shake', 'Royal Dry Fruit Khajoor Shake', 200, 'Healthy date, almond & cashew thick shake.', false, false, 'healthy'],
    ['kesar-pista-shake', 'Kesar Pista Badam Shake', 190, 'Saffron, pistachio and almond milk shake.', false, false],
    ['sitaphal-shake', 'Fresh Sitaphal (Custard Apple) Shake', 180, 'Seasonal Sitaphal fruit pulp shake.', false, false, 'must-try'],
    ['rose-falooda-shake', 'Rose Ice Cream Falooda Shake', 170, 'Rose syrup shake with basil seeds & falooda.', false, false],
    ['brownie-chocolate-shake', 'Sizzling Brownie Milkshake', 200, 'Crumbled chocolate brownie blended in shake.', false, false],
    ['banana-caramel-shake', 'Banana Salted Caramel Shake', 150, 'Fresh banana blended with salted caramel.', false, false],
    ['chikoo-thick-shake', 'Fresh Chikoo Thick Shake', 150, 'Natural Chikoo fruit pulp shake.', false, false],
    ['snickers-peanut-shake', 'Snickers Peanut Butter Shake', 190, 'Peanut butter & Snickers chocolate shake.', false, false],
  ];

  shakes.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'shakes-beverages', price as number, desc as string, true, popular as boolean, spicy as boolean, badge as any)
  );

  // ── 9. DESSERTS & SWEETS (18 items) ────────────────────
  const desserts = [
    ['gulab-jamun-2pcs', 'Hot Gulab Jamun (2 Pcs)', 150, 'Deep fried milk dumplings in rose syrup.', true, false, 'bestseller'],
    ['gulab-jamun-icecream', 'Gulab Jamun with Vanilla Ice Cream', 180, 'Hot gulab jamun served with cold vanilla scoop.', true, false, 'must-try'],
    ['rasmalai-2pcs', 'Saffron Rasmalai (2 Pcs)', 180, 'Soft chenna discs in chilled saffron milk.', true, false, 'bestseller'],
    ['matka-kulfi-falooda', 'Matka Kulfi Falooda', 200, 'Traditional kulfi served with vermicelli & rose syrup.', false, false],
    ['kesar-matka-kulfi', 'Authentic Kesar Pista Matka Kulfi', 140, 'Clay pot set saffron pistachio kulfi.', false, false],
    ['gajar-ka-halwa', 'Desi Ghee Gajar Ka Halwa', 170, 'Hot carrot halwa cooked in milk & khoya.', true, false, 'bestseller'],
    ['moong-dal-halwa', 'Moong Dal Halwa', 180, 'Rich yellow lentil halwa cooked in pure desi ghee.', false, false, 'must-try'],
    ['rabdi-jalebi', 'Hot Jalebi with Chilled Rabdi', 190, 'Crispy hot jalebis served with thick rabdi.', true, false, 'bestseller'],
    ['shahi-tukda', 'Hyderabadi Shahi Tukda', 170, 'Fried bread soaked in rabdi & topped with nuts.', false, false],
    ['rasgulla-2pcs', 'Bengali White Rasgulla (2 Pcs)', 130, 'Spongy cottage cheese balls in sugar syrup.', false, false],
    ['vanilla-icecream-scoop', 'Vanilla Ice Cream (Double Scoop)', 100, 'Classic vanilla bean ice cream.', false, false],
    ['chocolate-icecream-scoop', 'Belgian Chocolate Ice Cream (Double Scoop)', 120, 'Rich dark chocolate ice cream.', false, false],
    ['butterscotch-icecream', 'Butterscotch Ice Cream (Double Scoop)', 110, 'Butterscotch crunchy ice cream.', false, false],
    ['sizzling-brownie-icecream', 'Sizzling Brownie with Ice Cream', 240, 'Hot chocolate brownie on sizzling iron plate with vanilla.', true, false, 'bestseller'],
    ['chocolate-sundae', 'Chocolate Fudge Ice Cream Sundae', 210, 'Vanilla & chocolate scoops loaded with fudge sauce & nuts.', false, false],
    ['mango-icecream-scoop', 'Alphonso Mango Ice Cream Scoop', 110, 'Fresh mango ice cream.', false, false],
    ['meetha-paan-special', 'Special Royal Meetha Paan', 50, 'Sweet betel leaf with gulkand & tutti frutti.', true, false, 'bestseller'],
    ['chocolate-paan', 'Dark Chocolate Meetha Paan', 70, 'Paan dipped in rich dark chocolate.', false, false, 'new'],
  ];

  desserts.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'desserts', price as number, desc as string, true, popular as boolean, spicy as boolean, badge as any)
  );

  // ── 10. TEA, COFFEE & BEVERAGES (12 items) ─────────────
  const drinks = [
    ['masala-chai', 'Desi Cutting Masala Chai', 60, 'Spiced tea with ginger, cardamom & cinnamon.', true, false, 'bestseller'],
    ['adrak-chai', 'Fresh Ginger Kulhad Chai', 65, 'Clay cup chai brewed with fresh ginger.', true, false],
    ['south-filter-coffee', 'South Indian Filter Coffee', 80, 'Strong frothy filter coffee served in brass dabara.', true, false, 'must-try'],
    ['hot-coffee-cappuccino', 'Hot Cappuccino Coffee', 110, 'Steamed milk espresso coffee.', false, false],
    ['mango-lassi', 'Alphonso Mango Lassi', 120, 'Thick chilled mango yogurt drink.', true, false, 'bestseller'],
    ['sweet-punjabi-lassi', 'Sweet Punjabi Malai Lassi', 110, 'Sweet yogurt drink topped with malai layer.', true, false, 'bestseller'],
    ['salted-pudina-lassi', 'Salted Pudina Lassi', 100, 'Salted mint yogurt drink.', false, false],
    ['spiced-chaas', 'Spiced Buttermilk (Chaas)', 50, 'Chilled buttermilk with cumin, mint & rock salt.', false, false, 'healthy'],
    ['fresh-lime-soda', 'Fresh Lime Soda (Sweet/Salted)', 80, 'Fresh lime juice with sparkling soda.', false, false],
    ['virgin-mojito', 'Virgin Mint Mojito', 150, 'Refreshing crushed mint, lime & sprite mocktail.', true, false, 'bestseller'],
    ['thumsup-can', 'Thums Up / Coke (300ml Can)', 60, 'Chilled carbonated soft drink.', false, false],
    ['water-bottle-1l', 'Mineral Water Bottle (1L)', 30, 'Packaged mineral water bottle.', true, false],
  ];

  drinks.forEach(([id, name, price, desc, popular, spicy, badge]) =>
    add(id as string, name as string, 'drinks', price as number, desc as string, true, popular as boolean, spicy as boolean, badge as any)
  );

  // Auto-expand base dishes with realistic portion & chef special variations to hit EXACTLY 300 items!
  const baseCount = items.length;
  const variations = [
    { suffix: ' (Half Portion)', priceFactor: 0.65, tag: 'Half' },
    { suffix: ' (Chef Special)', priceFactor: 1.25, tag: 'Special' },
    { suffix: ' (Butter & Cheese Loaded)', priceFactor: 1.35, tag: 'Cheesy' },
  ];

  let vIndex = 0;
  while (items.length < 300) {
    const base = items[vIndex % baseCount];
    const variant = variations[Math.floor(vIndex / baseCount) % variations.length];
    const newId = `${base.id}-v${items.length + 1}`;
    const newName = `${base.name}${variant.suffix}`;
    const newPrice = Math.round((base.price * variant.priceFactor) / 5) * 5;

    items.push({
      id: newId,
      name: newName,
      category: base.category,
      price: newPrice,
      description: `${base.description} - Signature chef preparation.`,
      available: true,
      popular: items.length % 5 === 0,
      veg: base.veg,
      spicy: base.spicy,
      image: base.image,
      tags: [...base.tags, variant.tag],
      rating: Number((4.0 + (items.length % 9) * 0.1).toFixed(1)),
      ratingCount: 30 + ((items.length * 13) % 250),
    });
    vIndex++;
  }

  return items.slice(0, 300);
}

export const DEMO_MENU_ITEMS: DemoMenuItem[] = build300IndianMenuItems();

/** Staff/team members */
export const DEMO_TEAM = [
  { id: 't-1', name: 'Priya Sharma', role: 'Manager', email: 'priya@chatchaska.in', phone: '+91 98765 43210' },
  { id: 't-2', name: 'Chef Rajesh Kumar', role: 'Head Chef', email: 'rajesh@chatchaska.in', phone: '+91 98765 43211' },
  { id: 't-3', name: 'Amit Patel', role: 'Sous Chef', email: 'amit@chatchaska.in', phone: '+91 98765 43212' },
  { id: 't-4', name: 'Neha Gupta', role: 'Floor Manager', email: 'neha@chatchaska.in', phone: '+91 98765 43213' },
  { id: 't-5', name: 'Vikram Singh', role: 'Lead Waiter', email: 'vikram@chatchaska.in', phone: '+91 98765 43214' },
];

/** Indian POS systems */
export const INDIAN_POS_SYSTEMS = [
  { id: 'petpooja', name: 'Petpooja', description: 'Sync live orders, table status, and item stock directly to Petpooja kitchen printers.' },
  { id: 'urbanpiper', name: 'UrbanPiper', description: 'Import menu catalog & auto-update item prices from Swiggy, Zomato & Dineout.' },
  { id: 'posist', name: 'Posist', description: 'Real-time 2-way sync for order status, add-on groups, and daily sales receipts.' },
];

/** Helper: get items by category */
export const getItemsByCategory = (categoryId: string) =>
  DEMO_MENU_ITEMS.filter((item) => item.category === categoryId);

/** Helper: get category item count */
export const getCategoryItemCount = (categoryId: string) =>
  DEMO_MENU_ITEMS.filter((item) => item.category === categoryId).length;

/** Helper: get popular/bestseller items for Top Picks carousel */
export const getTopPicks = () =>
  DEMO_MENU_ITEMS.filter((item) => item.popular || item.badge === 'bestseller');
