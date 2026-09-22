/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Restaurant, FoodItem, VegIndicator } from '../types';

// Unsplash high quality food and hotel images mapping
const IMAGES = {
  family: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400'
  ],
  biryani: [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=400'
  ],
  fastfood: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=400'
  ],
  meals: [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400'
  ],
  desserts: [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400'
  ],
  juices: [
    'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400'
  ],
  seafood: [
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=400'
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1584132967334-10e02bd35a17?auto=format&fit=crop&q=80&w=400'
  ]
};

// Precise categorizations requested
const CHIRALA_VENDORS_RAW = [
  // ==========================================
  // TOP 13 CHIRALA VENDORS & PARTNERS (USER REQUESTED)
  // ==========================================
  { 
    name: 'గోదావరి రుచులు (Godavari Ruchulu)', 
    type: 'Biryani & Mandi', 
    cuisines: ['Godavari Seafood Biryani', 'Natu Kodi Pulao', 'Royyala Vepudu', 'Chepala Pulusu'] 
  },
  { 
    name: '9 to 9 హైదరాబాద్ దమ్ బిర్యాని (9 to 9 Hyderabad Dum Biryani)', 
    type: 'Biryani & Mandi', 
    cuisines: ['Special Chicken Dum Biryani', 'Hyderabad Mutton Dum Biryani', 'Chicken 65', 'Kebab Platters'] 
  },
  { 
    name: 'న్యూ ఐస్ బర్గ్ (New Iceberg)', 
    type: 'Desserts & Bakery', 
    cuisines: ['Fruit Sundaes', 'Waffle Cones', 'Belgian Chocolate', 'Falooda'] 
  },
  { 
    name: 'న్యూ ఐస్ బర్గ్ టెంటేషన్ (New Iceberg Temptations)', 
    type: 'Desserts & Bakery', 
    cuisines: ['Choco Fudge Sizzler', 'Brownie Tubs', 'Thick Milkshakes', 'Pastries'] 
  },
  { 
    name: 'ఐస్ మ్యాజిక్ (Ice Magic)', 
    type: 'Desserts & Bakery', 
    cuisines: ['Magic Popsicles', 'Roasted Almond Ice Cream', 'Mango Mastani', 'Chilled Kulfi'] 
  },
  { 
    name: 'మిస్సమ్మ ఫ్యామిలీ రెస్టారెంట్ (Missamma Family Restaurant)', 
    type: 'Family', 
    cuisines: ['Andhra Family Thali', 'Missamma Dum Biryani', 'North Indian', 'Tandoori Rotis'] 
  },
  { 
    name: 'తన్సీ ఫుడ్ కోర్ట్ (Tansee Food Court)', 
    type: 'Fast Food', 
    cuisines: ['Chicken Fried Rice', 'Schezwan Noodles', 'Chicken Manchurian', 'Shawarma Rolls'] 
  },
  { 
    name: 'ఆరెంజ్ ఫ్యామిలీ రెస్టారెంట్ (Orange Family Restaurant)', 
    type: 'Family', 
    cuisines: ['Orange Special Biryani', 'Kaju Paneer Curry', 'Chinese Noodles', 'Thalis'] 
  },
  { 
    name: 'వాసుదేవ విల్లాస్ (Vasudeva Villas)', 
    type: 'Meals & Tiffins', 
    cuisines: ['Ghee Podi Dosa', 'Button Sambar Idli', 'Pure Ghee Pongal', 'South Filter Coffee', 'Executive Veg Meals'] 
  },
  { 
    name: 'శ్రీ వీర హనుమాన్ బిర్యాని పాయింట్ (Sri Veera Hanuman Biryani Point)', 
    type: 'Biryani & Mandi', 
    cuisines: ['Veera Hanuman Special Biryani', 'Spicy Joint Biryani', 'Fry Piece Biryani', 'Boneless Biryani'] 
  },
  { 
    name: 'ఫ్రైడ్ వింగ్స్ (Fried Wings)', 
    type: 'Fast Food', 
    cuisines: ['Crispy Battered Wings', 'Peri Peri Wings', 'Golden Popcorn Chicken', 'Zinger Burgers'] 
  },
  { 
    name: 'గురు కృప బేకరీ (Guru Krupa Bakery)', 
    type: 'Desserts & Bakery', 
    cuisines: ['Fresh Egg Puff & Veg Puff', 'Plum Cake', 'Honey Cake Slice', 'Custom Birthday Cakes'] 
  },
  { 
    name: 'మణికంఠ స్పైసీ బిర్యానీ (Manikanta Spicy Biryani)', 
    type: 'Biryani & Mandi', 
    cuisines: ['Andhra Spicy Dum Biryani', 'Mutton Sukka Biryani', 'Chilli Chicken', 'Guntur Chicken Curry'] 
  },

  // 1. Family Restaurants & Multi-Cuisine
  { name: 'Daawat Family Restaurant', type: 'Family', cuisines: ['Mughlai', 'Chinese', 'Tandoor'] },
  { name: 'CHIRALA AROMAS RESTAURANT', type: 'Family', cuisines: ['Continental', 'Tandoori Spec', 'Desserts'] },
  { name: 'Dine N Play', type: 'Family', cuisines: ['Mughlai', 'Burgers', 'Shakes'] },
  { name: 'Alwish Family Restaurant & Candle light dinners', type: 'Family', cuisines: ['Premium Mughlai', 'Biryani', 'Continental'] },
  { name: 'Abhiruchii Restaurant', type: 'Family', cuisines: ['North Indian', 'Andhra Ruchis', 'Dry Starters'] },
  { name: 'GRILLLAND BBQ FAMILY RESTAURANT', type: 'Family', cuisines: ['BBQ Grill', 'Kebabs', 'Biryani'] },
  { name: 'GK Family Restaurant', type: 'Family', cuisines: ['Andhra Spec', 'Biryanis', 'Chinese'] },
  { name: 'Vyshanavi Family Restaurant', type: 'Family', cuisines: ['Veg Special', 'Paneer Curries', 'Fried Rice'] },
  { name: 'New Brundhavanam Family Restaurant', type: 'Family', cuisines: ['South Indian Meals', 'Continental', 'Tiffins'] },
  { name: 'Vanamadhuri Grand', type: 'Family', cuisines: ['Andhra Royal', 'Mughlai Kadhai', 'Desserts'] },
  { name: 'Rock N Roll Family Restaurant', type: 'Family', cuisines: ['Fast Food Starters', 'Indian Grills', 'Biryani'] },
  { name: 'Chilli\'s Family Restaurant', type: 'Family', cuisines: ['Spicy Andhra', 'Chinese Szechuan', 'Naans'] },
  { name: 'Vah Reh Vah Family Dhaba', type: 'Family', cuisines: ['Dhaba Style Kadhai', 'Tandoori Roti', 'Punjabi'] },

  // 2. Biryani & Mandi Restaurants
  { name: 'Biryani Box', type: 'Biryani & Mandi', cuisines: ['Spicy Dum Biryani', 'Kebab Boxes'] },
  { name: 'Hyderabad Biryani House', type: 'Biryani & Mandi', cuisines: ['Classic Hyderabadi Biryani', 'Haleem'] },
  { name: 'Bheema\'s', type: 'Biryani & Mandi', cuisines: ['Andhra Dum Biryani', 'Mutton Fry Joint'] },
  { name: 'Star Dum Biriyani', type: 'Biryani & Mandi', cuisines: ['Basmati Dum Chicken', 'Egg Biryani'] },
  { name: 'Khan\'s Biriyani', type: 'Biryani & Mandi', cuisines: ['Mughlai Kebabs', 'Dum Biryani'] },
  { name: 'Dubai Sheikh Arabic Mandi', type: 'Biryani & Mandi', cuisines: ['Al-Faham Chicken Mandi', 'Khabsa Rice'] },
  { name: 'Lahari Restaurant & Bar', type: 'Biryani & Mandi', cuisines: ['Spicy Non-Veg Platters', 'Biryani Combo'] },
  { name: 'Raos Biryani House', type: 'Biryani & Mandi', cuisines: ['Traditional Natu Kodi Pulao', 'Chicken Pulao'] },
  { name: 'Mandi House Chirala', type: 'Biryani & Mandi', cuisines: ['Special Arabic Mandi Feast', 'Mutton Juicy Mandi'] },

  // 3. Fast Food, Pizza & Burgers
  { name: 'Pizza House', type: 'Fast Food', cuisines: ['Artisan Woodfired Pizza', 'Garlic Bread'] },
  { name: 'Pizza Point', type: 'Fast Food', cuisines: ['Cheesy Double Burst Pizza', 'Mocktails'] },
  { name: 'Burger Point', type: 'Fast Food', cuisines: ['Toasted Brioche Veg Burger', 'French Fries'] },
  { name: 'Hot Bite Fast Food', type: 'Fast Food', cuisines: ['Noodles Stir Fry', 'Paneer Chilli Dry'] },
  { name: 'Kasi Visweswara Fast Foods', type: 'Fast Food', cuisines: ['Street Style Fried Rice', 'Chili Egg Eggless'] },
  { name: 'Pullayya Fast Foods', type: 'Fast Food', cuisines: ['Famous Schezwan Noodles', 'Egg Fry Rice'] },
  { name: 'Snack Hub', type: 'Fast Food', cuisines: ['Samosas', 'Potato Smiles', 'Paneer Finger Wraps'] },
  { name: 'Food Court Express', type: 'Fast Food', cuisines: ['Bite Sized Combo boxes', 'Milkshakes'] },
  { name: 'Nuvvo Cloud Kitchen', type: 'Fast Food', cuisines: ['Healthy Wraps', 'Gourmet High Bowls'] },

  // 4. Andhra Meals & Tiffins
  { name: 'Sambha Shiva Mess', type: 'Meals & Tiffins', cuisines: ['Andhra Thali Meals', 'Authentic Podi & Ghee'] },
  { name: 'Rambabu Mess', type: 'Meals & Tiffins', cuisines: ['Homemade Lunch Meals', 'Natu Kodi Kurma'] },
  { name: 'Arya Vysya Meals', type: 'Meals & Tiffins', cuisines: ['Strictly Vegetarian Thali', 'Pappu Charu'] },
  { name: 'Sri Sai Tiffins', type: 'Meals & Tiffins', cuisines: ['Ghee Karam Dosa', 'Fluffy Steamed Idli'] },
  { name: 'Annapurna Tiffin Center', type: 'Meals & Tiffins', cuisines: ['Crispy Medu Vadas', 'Upma Pesari Set'] },
  { name: 'Sri Lakshmi Ganapathi Tiffins', type: 'Meals & Tiffins', cuisines: ['Button Sambar Idli', 'Mysore Bondas'] },
  { name: 'Srinivasa Tiffins', type: 'Meals & Tiffins', cuisines: ['Puri with Potato Kurma', 'Onion Uttapam'] },
  { name: 'Udupi Tiffin Center', type: 'Meals & Tiffins', cuisines: ['Rava Masala Dosa', 'Filter Coffee Combo'] },
  { name: 'Sri Venkateswara Meals', type: 'Meals & Tiffins', cuisines: ['Unlimited Meals Sambar', 'Avakaya Pickle'] },
  { name: 'Gokul Tea & Snacks', type: 'Meals & Tiffins', cuisines: ['Hot Samosa Pav', 'Ginger Tea Cups'] },

  // 5. Ice Creams, Bakery & Desserts
  { name: 'Temptations Bakery', type: 'Desserts & Bakery', cuisines: ['Baked Plum Cakes', 'Cream Puffs'] },
  { name: 'Cake World', type: 'Desserts & Bakery', cuisines: ['Custom Birthday Cream Cakes', 'Muffins'] },
  { name: 'Sweet Magic', type: 'Desserts & Bakery', cuisines: ['Traditional Motichoor Ladoo', 'Kaju Katli'] },
  { name: 'Sri Balaji Bakery', type: 'Desserts & Bakery', cuisines: ['Fresh Coconut Cookies', 'Bread Loafs'] },
  { name: 'Modern Bakery', type: 'Desserts & Bakery', cuisines: ['Veg Puff Crunch', 'Egg Pastry roll'] },
  { name: 'Bakers Corner', type: 'Desserts & Bakery', cuisines: ['Chocolate Doughnuts', 'Red Velvet Slices'] },
  { name: 'Oven Fresh Bakery', type: 'Desserts & Bakery', cuisines: ['Sourdough Loaf', 'Croissants French'] },

  // 6. Juices, Tea & Coffee
  { name: 'The Lassi Corner', type: 'Juices & Cafe', cuisines: ['Dry Fruit Lassi', 'Mango thickshake'] },
  { name: 'Reboot Chai', type: 'Juices & Cafe', cuisines: ['Aromatic Masala Tea', 'Osmania Biscuits'] },
  { name: 'Bellam Tea Point', type: 'Juices & Cafe', cuisines: ['Organic Jaggery Tea', 'Filter Coffee'] },
  { name: 'Juice Junction', type: 'Juices & Cafe', cuisines: ['Fresh Anar Juice', 'Valencian Mosambi'] },
  { name: 'Fresh Fruit Hub', type: 'Juices & Cafe', cuisines: ['Seasonal fruit bowls', 'Detox green boosters'] },
  { name: 'Coffee House', type: 'Juices & Cafe', cuisines: ['Hazelnut Cold Frappe', 'Hot Cappuccinos'] },
  { name: 'Tea Time Café', type: 'Juices & Cafe', cuisines: ['Lemon Honey Green Tea', 'Crunchy Bread Toast'] },
  { name: 'Chai Spot', type: 'Juices & Cafe', cuisines: ['Cardamom Tea Pots', 'Veg Samosas'] },

  // 7. Seafood Specialists
  { name: 'Ramapuram Seafood Point', type: 'Seafood', cuisines: ['Vodarevu Crab Roast', 'Spicy Fish Fry'] },
  { name: 'Vodarevu Fish Point', type: 'Seafood', cuisines: ['Freshly caught Apollo Fish', 'Seafood Masala'] },
  { name: 'Coastal Fish Fry Center', type: 'Seafood', cuisines: ['Tava Grilled prawns', 'Fish Curry Rice'] },
  { name: 'Andhra Seafood Kitchen', type: 'Seafood', cuisines: ['Royal Tiger Prawns curry', 'Prawn Biryani'] },
  { name: 'Apollo Fish Corner', type: 'Seafood', cuisines: ['Apollo fry cubes', 'Hot Fish Finger bits'] },

  // 8. Hotels, Resorts & Lodging Partners
  { name: 'Triviera Hotel Chirala', type: 'Hotel & Resort', cuisines: ['Luxury Dining Multi-cuisine', 'Suites Room Stay'] },
  { name: 'VIHARI INN', type: 'Hotel & Resort', cuisines: ['Corporate Buffets', 'Continental stays'] },
  { name: 'Srinivasa Grand', type: 'Hotel & Resort', cuisines: ['Traditional Wedding Hall catering', 'Deluxe Suites'] },
  { name: 'Teeyes Nexus Luxury Hotel', type: 'Hotel & Resort', cuisines: ['Global Gourmet cuisines', 'Valet parking stay'] },
  { name: 'Riviera Beach Resort', type: 'Hotel & Resort', cuisines: ['Beachside Sea View Dinners', 'Holiday cottage packages'] },
  { name: 'V Hotels and Resorts', type: 'Hotel & Resort', cuisines: ['Family Cabanas', 'Exotic Seafood Grills'] },
  { name: 'Seabreeze Beach Resorts', type: 'Hotel & Resort', cuisines: ['Vodarevu Beachfront dine', 'Prawn barbecue pits'] },
  { name: 'THE HUTS RESORT', type: 'Hotel & Resort', cuisines: ['Eco huts candlelight dinners', 'Coastal andhra platters'] },
  { name: 'Sea Shell Resort', type: 'Hotel & Resort', cuisines: ['Outdoor infinity beach lounge', 'Seafood special buffet'] },
  { name: 'The Raj Kamal Lodge', type: 'Hotel & Resort', cuisines: ['Economy stays room catering', 'Andhra Ruchulu'] },
  { name: 'Hotel Swaraj', type: 'Hotel & Resort', cuisines: ['Dhaba style coastal diners', 'A/C rest rooms stay'] },
  { name: 'Raja Beach Resort', type: 'Hotel & Resort', cuisines: ['Live beach volleyball snacks counter', 'Mocktails'] },
  { name: 'Golden Sands Beach Resort', type: 'Hotel & Resort', cuisines: ['Sunbed fruit counters', 'Coastal tandoor platters'] },
  { name: 'Palm Coast Resort', type: 'Hotel & Resort', cuisines: ['Palm gardens open sky barbecues', 'Fish joint fry'] },
  { name: 'Happy Resorts', type: 'Hotel & Resort', cuisines: ['Weekend family brunch buffets', 'Swimming pool snacks'] },
  { name: 'Sea Dreams Resort', type: 'Hotel & Resort', cuisines: ['Sea shells seafood platters', 'Luxury suite dine-in'] },
  { name: 'Buddha Beach Resort & Spa', type: 'Hotel & Resort', cuisines: ['Healthy vegan juices', 'Spa salad greens stays'] },
  { name: 'Sri Ramadootha Athidi Nivas Lodge', type: 'Hotel & Resort', cuisines: ['Pilgrim friendly tiffin packs', 'South thali meals'] },
  { name: 'AR Grand Hotel', type: 'Hotel & Resort', cuisines: ['Multi-cuisine A/C luxury rest', 'Mocktails & Sodas'] },
  { name: 'Grand Inn Hotel', type: 'Hotel & Resort', cuisines: ['Comfortable Business stays', 'Hygienic standard meals'] },
  { name: 'Sri Chakra Residency', type: 'Hotel & Resort', cuisines: ['Classic South comfort diner', 'High speed room service'] },
  { name: 'Grand Arya Beach Resort', type: 'Hotel & Resort', cuisines: ['Grand multi-cuisine beachfront deck', 'Premium lobster grills'] }
];

export const generatePreloadedChiralaRestaurants = (): Restaurant[] => {
  return CHIRALA_VENDORS_RAW.map((vendor, index) => {
    // For top 13 user-requested restaurants, ensure high rating and quick delivery
    const isTop13 = index < 13;
    const rating = isTop13 ? parseFloat((4.8 + (index % 2) * 0.1).toFixed(1)) : parseFloat((4.0 + (index % 10) * 0.1).toFixed(1));
    const reviewsCount = isTop13 ? 480 + (index * 35) : 50 + (index * 13) % 450;
    const deliveryTime = isTop13 ? 15 + (index % 3) * 5 : 15 + (index * 5) % 35;
    const distance = isTop13 ? parseFloat((0.4 + (index % 4) * 0.3).toFixed(1)) : parseFloat((0.5 + (index % 18) * 0.5).toFixed(1));
    
    // Choose appropriate cost for two based on type
    let costForTwo = 350;
    if (vendor.type === 'Hotel & Resort') {
      costForTwo = 800 + (index % 5) * 100;
    } else if (vendor.type === 'Seafood') {
      costForTwo = 500 + (index % 4) * 50;
    } else if (vendor.type === 'Meals & Tiffins' || vendor.type === 'Juices & Cafe') {
      costForTwo = 150 + (index % 6) * 25;
    } else if (vendor.type === 'Family') {
      costForTwo = 450 + (index % 4) * 50;
    }

    // Select nice matching images from list
    let imageList = IMAGES.family;
    if (vendor.type === 'Biryani & Mandi') imageList = IMAGES.biryani;
    else if (vendor.type === 'Fast Food') imageList = IMAGES.fastfood;
    else if (vendor.type === 'Meals & Tiffins') imageList = IMAGES.meals;
    else if (vendor.type === 'Desserts & Bakery') imageList = IMAGES.desserts;
    else if (vendor.type === 'Juices & Cafe') imageList = IMAGES.juices;
    else if (vendor.type === 'Seafood') imageList = IMAGES.seafood;
    else if (vendor.type === 'Hotel & Resort') imageList = IMAGES.hotel;

    const image = imageList[index % imageList.length];

    // Offers
    const offers = [
      index % 2 === 0 ? 'FLAT 50% OFF up to ₹100' : '₹100 OFF with NUVVO',
      'Free delivery above ₹149'
    ];

    // Onboarded state setup (Approved by default for system bootstrap, but super admin can switch)
    // Make sure all top 13 are approved and active
    const isApproved = isTop13 ? true : index < 85; 

    return {
      id: `chirala_rest_${index + 1}`,
      name: vendor.name,
      rating,
      reviewsCount,
      cuisines: vendor.cuisines,
      deliveryTime,
      costForTwo,
      image,
      isPromoted: isTop13 || index % 7 === 0,
      offers,
      isApproved,
      isActive: true, // Default active/available
      businessType: vendor.type as any,
      distance,
      phone: '9063692135'
    };
  });
};

export const CHIRALA_TOP13_FOOD_ITEMS: FoodItem[] = [
  // 1. గోదావరి రుచులు (chirala_rest_1)
  {
    id: 'chirala_food_1_1',
    restaurantId: 'chirala_rest_1',
    name: 'గోదావరి రొయ్యల వేపుడు (Godavari Royyala Vepudu)',
    description: 'Authentic Godavari style fresh coastal prawns roasted with caramelized onions, curry leaves, and spicy pepper masala.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.9,
    reviewsCount: 240,
    prepTime: 20,
    price: 340,
    discountPrice: 289,
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=400',
    category: 'Seafood',
    subcategory: 'Starters',
    ingredients: ['Fresh Coastal Prawns', 'Curry Leaves', 'Godavari Masala', 'Ghee'],
    spiceLevel: 'High',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_1_2',
    restaurantId: 'chirala_rest_1',
    name: 'గోదావరి సీఫుడ్ స్పెషల్ బిర్యానీ (Godavari Seafood Biryani)',
    description: 'Aromatic basmati rice cooked with fresh coastal prawns and fish fillet in traditional Godavari clay pot style.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.8,
    reviewsCount: 195,
    prepTime: 25,
    price: 380,
    discountPrice: 320,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
    category: 'Biryani',
    subcategory: 'Seafood Biryani',
    ingredients: ['Basmati Rice', 'Prawns', 'Fish Chunks', 'Godavari Dum Spices'],
    spiceLevel: 'High',
    isTrending: true,
    reviews: []
  },
  {
    id: 'chirala_food_1_3',
    restaurantId: 'chirala_rest_1',
    name: 'కొనసీమ చాపల పులుసు (Konaseema Chepala Pulusu)',
    description: 'Traditional tangy and fiery tamarind fish curry slow-simmered in an earthen pot.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.9,
    reviewsCount: 310,
    prepTime: 20,
    price: 310,
    discountPrice: 260,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400',
    category: 'Seafood',
    subcategory: 'Curry',
    ingredients: ['Fresh Sea Fish', 'Tamarind', 'Green Chillies', 'Shallots'],
    spiceLevel: 'High',
    isBestSeller: true,
    reviews: []
  },

  // 2. 9 to 9 హైదరాబాద్ దమ్ బిర్యాని (chirala_rest_2)
  {
    id: 'chirala_food_2_1',
    restaurantId: 'chirala_rest_2',
    name: '9 to 9 స్పెషల్ చికెన్ దమ్ బిర్యానీ (9 to 9 Special Chicken Dum Biryani)',
    description: 'Signature Hyderabadi dum biryani cooked with marinated succulent chicken and aromatic saffron-infused long grain basmati rice.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.9,
    reviewsCount: 420,
    prepTime: 20,
    price: 280,
    discountPrice: 239,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
    category: 'Biryani',
    subcategory: 'Chicken Biryani',
    ingredients: ['Tender Chicken', 'Basmati Rice', 'Hyderabadi Potli Masala', 'Pure Ghee'],
    spiceLevel: 'Medium',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_2_2',
    restaurantId: 'chirala_rest_2',
    name: '9 to 9 హైదరాబాద్ మటన్ దమ్ బిర్యానీ (9 to 9 Mutton Dum Biryani)',
    description: 'Slow-cooked melt-in-mouth tender goat mutton layered with saffron basmati rice and roasted spices.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.8,
    reviewsCount: 290,
    prepTime: 25,
    price: 390,
    discountPrice: 340,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=400',
    category: 'Mutton Specials',
    subcategory: 'Biryani',
    ingredients: ['Premium Mutton', 'Aged Basmati Rice', 'Saffron', 'Fried Onions'],
    spiceLevel: 'Medium',
    isTrending: true,
    reviews: []
  },
  {
    id: 'chirala_food_2_3',
    restaurantId: 'chirala_rest_2',
    name: '9 to 9 క్రిస్పీ చికెన్ 65 (9 to 9 Crispy Chicken 65)',
    description: 'Deep-fried marinated boneless chicken bites tossed with curry leaves, yogurt, and crushed green chillies.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.8,
    reviewsCount: 310,
    prepTime: 15,
    price: 240,
    discountPrice: 199,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    category: 'Chicken Specials',
    subcategory: 'Starters',
    ingredients: ['Boneless Chicken', 'Curry Leaves', 'Red Chili Glaze', 'Yogurt'],
    spiceLevel: 'High',
    reviews: []
  },

  // 3. న్యూ ఐస్ బర్గ్ (chirala_rest_3)
  {
    id: 'chirala_food_3_1',
    restaurantId: 'chirala_rest_3',
    name: 'న్యూ ఐస్ బర్గ్ రాయల్ ఫ్రూట్ సండే (New Iceberg Royal Fruit Sundae)',
    description: 'Loaded exotic fruit sundae with fresh mango, kiwi, strawberry scoops, topped with candied nuts and honey drizzles.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.9,
    reviewsCount: 380,
    prepTime: 10,
    price: 180,
    discountPrice: 150,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400',
    category: 'Ice Cream',
    subcategory: 'Sundaes',
    ingredients: ['Seasonal Fruits', 'Vanilla Cream', 'Strawberry Scoop', 'Roasted Almonds'],
    spiceLevel: 'None',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_3_2',
    restaurantId: 'chirala_rest_3',
    name: 'కేసర్ పిస్తా స్పెషల్ ఫలూదా (Kesar Pista Special Falooda)',
    description: 'Chilled condensed milk infused with royal saffron, crunchy pista, sabja seeds, and vermicelli topped with ice cream.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.8,
    reviewsCount: 220,
    prepTime: 10,
    price: 160,
    discountPrice: 135,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400',
    category: 'Desserts',
    subcategory: 'Falooda',
    ingredients: ['Kesar Milk', 'Pistachios', 'Sabja Seeds', 'Falooda Sev'],
    spiceLevel: 'None',
    reviews: []
  },

  // 4. న్యూ ఐస్ బర్గ్ టెంటేషన్ (chirala_rest_4)
  {
    id: 'chirala_food_4_1',
    restaurantId: 'chirala_rest_4',
    name: 'టెంప్టేషన్ చాకో ఫడ్జ్ బ్రౌనీ సిజ్లర్ (Temptation Choco Fudge Brownie Sizzler)',
    description: 'Warm, gooey dark chocolate walnut brownie served on a hot plate with vanilla ice cream and hot chocolate fudge.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.9,
    reviewsCount: 410,
    prepTime: 12,
    price: 220,
    discountPrice: 189,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400',
    category: 'Desserts',
    subcategory: 'Sizzlers',
    ingredients: ['Dark Chocolate Brownie', 'Vanilla Ice Cream', 'Hot Fudge', 'Walnuts'],
    spiceLevel: 'None',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_4_2',
    restaurantId: 'chirala_rest_4',
    name: 'కిట్‌క్యాట్ ఓరియో థిక్‌షేక్ (KitKat Oreo Thick Shake)',
    description: 'Ultra-rich creamy chocolate thickshake blended with crunchy KitKat and Oreo cookies.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.8,
    reviewsCount: 260,
    prepTime: 10,
    price: 170,
    discountPrice: 145,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400',
    category: 'Milkshakes',
    subcategory: 'Chocolate Shakes',
    ingredients: ['Fresh Cream Milk', 'KitKat Bars', 'Oreo Cookies', 'Chocolate Drizzle'],
    spiceLevel: 'None',
    reviews: []
  },

  // 5. ఐస్ మ్యాజిక్ (chirala_rest_5)
  {
    id: 'chirala_food_5_1',
    restaurantId: 'chirala_rest_5',
    name: 'ఐస్ మ్యాజిక్ స్పెషల్ కుల్ఫీ మట్కా (Ice Magic Special Matka Kulfi)',
    description: 'Traditional slow-reduced rabri kulfi set in an authentic clay pot, loaded with dry fruits and saffron.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.8,
    reviewsCount: 290,
    prepTime: 5,
    price: 120,
    discountPrice: 99,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400',
    category: 'Ice Cream',
    subcategory: 'Kulfi',
    ingredients: ['Rabri', 'Cardamom', 'Cashews', 'Saffron'],
    spiceLevel: 'None',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_5_2',
    restaurantId: 'chirala_rest_5',
    name: 'మాంగో మస్తానీ విత్ ఐస్ క్రీమ్ (Mango Mastani with Ice Cream)',
    description: 'Pune style thick chilled mango shake crowned with real mango ice cream and dry fruits.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.8,
    reviewsCount: 180,
    prepTime: 10,
    price: 160,
    discountPrice: 135,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400',
    category: 'Juices',
    subcategory: 'Smoothies',
    ingredients: ['Fresh Mango Pulp', 'Mango Ice Cream', 'Tutti Frutti', 'Almonds'],
    spiceLevel: 'None',
    reviews: []
  },

  // 6. మిస్సమ్మ ఫ్యామిలీ రెస్టారెంట్ (chirala_rest_6)
  {
    id: 'chirala_food_6_1',
    restaurantId: 'chirala_rest_6',
    name: 'మిస్సమ్మ స్పెషల్ చికెన్ దమ్ బిర్యానీ (Missamma Special Chicken Biryani)',
    description: 'Famous Chirala local recipe prepared with tender farm-fresh chicken and country spices.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.9,
    reviewsCount: 520,
    prepTime: 20,
    price: 290,
    discountPrice: 249,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
    category: 'Biryani',
    subcategory: 'Chicken Biryani',
    ingredients: ['Country Chicken', 'Basmati Rice', 'Missamma Spices', 'Ghee'],
    spiceLevel: 'High',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_6_2',
    restaurantId: 'chirala_rest_6',
    name: 'మిస్సమ్మ రాయల్ ఆంధ్ర మీల్స్ థాలి (Missamma Royal Andhra Thali)',
    description: 'Grand unlimited Andhra meal platter with pappu, sambar, rasam, 2 curries, podi, curd, and papad.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.8,
    reviewsCount: 450,
    prepTime: 15,
    price: 220,
    discountPrice: 189,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
    category: 'South Indian',
    subcategory: 'Thali',
    ingredients: ['Sona Masoori Rice', 'Pappu', 'Sambar', 'Ghee Podi'],
    spiceLevel: 'Medium',
    isTrending: true,
    reviews: []
  },

  // 7. తన్సీ ఫుడ్ కోర్ట్ (chirala_rest_7)
  {
    id: 'chirala_food_7_1',
    restaurantId: 'chirala_rest_7',
    name: 'తన్సీ స్పెషల్ చికెన్ ఫ్రైడ్ రైస్ (Tansee Special Chicken Fried Rice)',
    description: 'Wok-tossed long-grain basmati rice with shredded chicken, scramble egg, and scallions in rich soy seasoning.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.8,
    reviewsCount: 340,
    prepTime: 15,
    price: 190,
    discountPrice: 159,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400',
    category: 'Chinese',
    subcategory: 'Fried Rice',
    ingredients: ['Basmati Rice', 'Chicken', 'Egg', 'Spring Onions'],
    spiceLevel: 'Medium',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_7_2',
    restaurantId: 'chirala_rest_7',
    name: 'స్పైసీ చికెన్ షవర్మా రోల్ (Spicy Chicken Shawarma Roll)',
    description: 'Juicy spit-roasted chicken wrapped in warm rumali roti with garlic mayonnaise, pickled gherkins, and french fries.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.7,
    reviewsCount: 280,
    prepTime: 12,
    price: 140,
    discountPrice: 119,
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=400',
    category: 'Shawarma',
    subcategory: 'Rolls',
    ingredients: ['Roast Chicken', 'Rumali Roti', 'Garlic Mayo', 'Pickles'],
    spiceLevel: 'Medium',
    reviews: []
  },

  // 8. ఆరెంజ్ ఫ్యామిలీ రెస్టారెంట్ (chirala_rest_8)
  {
    id: 'chirala_food_8_1',
    restaurantId: 'chirala_rest_8',
    name: 'ఆరెంజ్ స్పెషల్ బోన్‌లెస్ బిర్యానీ (Orange Special Boneless Biryani)',
    description: 'Juicy spiced chicken boneless tikka cubes layered into fragrant dum biryani rice with caramelized onions.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.8,
    reviewsCount: 390,
    prepTime: 20,
    price: 310,
    discountPrice: 265,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
    category: 'Biryani',
    subcategory: 'Chicken Biryani',
    ingredients: ['Boneless Chicken Tikka', 'Basmati Rice', 'Orange Special Masala'],
    spiceLevel: 'Medium',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_8_2',
    restaurantId: 'chirala_rest_8',
    name: 'ఆరెంజ్ కాజు పనీర్ మసాలా (Orange Kaju Paneer Masala)',
    description: 'Cottage cheese cubes and whole roasted cashews simmered in a creamy tomato-onion butter gravy.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.8,
    reviewsCount: 230,
    prepTime: 18,
    price: 250,
    discountPrice: 215,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400',
    category: 'North Indian',
    subcategory: 'Curry',
    ingredients: ['Paneer', 'Roasted Cashews', 'Fresh Cream', 'Butter Gravy'],
    spiceLevel: 'Medium',
    reviews: []
  },

  // 9. వాసుదేవ విల్లాస్ (chirala_rest_9)
  {
    id: 'chirala_food_9_1',
    restaurantId: 'chirala_rest_9',
    name: 'వాసుదేవ నెయ్యి కారం దోశ (Vasudeva Ghee Karam Podi Dosa)',
    description: 'Crispy golden crepe roasted generously in pure desi ghee and layered with authentic spicy red chutney and gun powder podi.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.9,
    reviewsCount: 510,
    prepTime: 10,
    price: 90,
    discountPrice: 75,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
    category: 'South Indian',
    subcategory: 'Tiffins',
    ingredients: ['Fermented Rice Batter', 'Pure Desi Ghee', 'Karam Podi', 'Coconut Chutney'],
    spiceLevel: 'Medium',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_9_2',
    restaurantId: 'chirala_rest_9',
    name: 'బటన్ సాంబార్ ఇడ్లీ విత్ ఘీ (Button Sambar Ghee Idli 10pcs)',
    description: '10 melt-in-the-mouth mini steamed rice idlis submerged in hot aromatic drumstick sambar and pure ghee.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.9,
    reviewsCount: 380,
    prepTime: 10,
    price: 80,
    discountPrice: 69,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
    category: 'Tiffins',
    subcategory: 'Idli',
    ingredients: ['Steamed Rice Cakes', 'Drumstick Sambar', 'Desi Ghee', 'Coriander'],
    spiceLevel: 'Medium',
    isTrending: true,
    reviews: []
  },

  // 10. శ్రీ వీర హనుమాన్ బిర్యాని పాయింట్ (chirala_rest_10)
  {
    id: 'chirala_food_10_1',
    restaurantId: 'chirala_rest_10',
    name: 'శ్రీ వీర హనుమాన్ చికెన్ జాయింట్ బిర్యానీ (Veera Hanuman Chicken Joint Biryani)',
    description: 'Spicy marinated whole chicken leg joint roasted and served over steaming spicy Andhra dum biryani.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.9,
    reviewsCount: 480,
    prepTime: 20,
    price: 280,
    discountPrice: 239,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
    category: 'Biryani',
    subcategory: 'Chicken Biryani',
    ingredients: ['Chicken Leg Joint', 'Basmati Rice', 'Spicy Andhra Masala'],
    spiceLevel: 'High',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_10_2',
    restaurantId: 'chirala_rest_10',
    name: 'వీర హనుమాన్ స్పైసీ ఫ్రై పీస్ బిర్యానీ (Veera Hanuman Fry Piece Biryani)',
    description: 'Crispy fried chicken chunks with pepper, green chillies, and garlic topped on basmati biryani.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.8,
    reviewsCount: 340,
    prepTime: 20,
    price: 290,
    discountPrice: 249,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=400',
    category: 'Biryani',
    subcategory: 'Chicken Biryani',
    ingredients: ['Fried Chicken Pcs', 'Curry Leaves', 'Basmati Rice', 'Raita'],
    spiceLevel: 'High',
    reviews: []
  },

  // 11. ఫ్రైడ్ వింగ్స్ (chirala_rest_11)
  {
    id: 'chirala_food_11_1',
    restaurantId: 'chirala_rest_11',
    name: 'క్రిస్పీ ఫ్రైడ్ చికెన్ వింగ్స్ (6 Pcs Crispy Fried Wings)',
    description: 'Golden crispy fried chicken wings coated in seasoned breading with garlic dip.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.8,
    reviewsCount: 390,
    prepTime: 15,
    price: 230,
    discountPrice: 195,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    category: 'Fast Food',
    subcategory: 'Chicken Wings',
    ingredients: ['Chicken Wings', 'Crispy Batter', 'Garlic Mayo', 'Secret Herbs'],
    spiceLevel: 'Medium',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_11_2',
    restaurantId: 'chirala_rest_11',
    name: 'పెరి పెరి స్పైసీ వింగ్స్ బకెట్ (Peri Peri Hot Wings Bucket 10 Pcs)',
    description: 'Jumbo bucket of crunchy chicken wings dusted in hot African peri-peri seasoning.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.9,
    reviewsCount: 310,
    prepTime: 18,
    price: 350,
    discountPrice: 299,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=400',
    category: 'Fast Food',
    subcategory: 'Chicken Wings',
    ingredients: ['Chicken Wings', 'Peri Peri Rub', 'Herb Dip'],
    spiceLevel: 'High',
    reviews: []
  },

  // 12. గురు కృప బేకరీ (chirala_rest_12)
  {
    id: 'chirala_food_12_1',
    restaurantId: 'chirala_rest_12',
    name: 'గురు కృప హాట్ ఎగ్ పఫ్ (Guru Krupa Fresh Baked Egg Puff 2 Pcs)',
    description: 'Flaky and buttery puff pastry stuffed with hard-boiled egg half and spiced onion masala.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.8,
    reviewsCount: 320,
    prepTime: 5,
    price: 60,
    discountPrice: 50,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    category: 'Bakery',
    subcategory: 'Puffs',
    ingredients: ['Egg', 'Puff Dough', 'Caramelized Onions', 'Pepper'],
    spiceLevel: 'Medium',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_12_2',
    restaurantId: 'chirala_rest_12',
    name: 'గురు కృప ట్రెడిషనల్ ప్లమ్ కేక్ (Guru Krupa Rich Fruit Plum Cake 400g)',
    description: 'Classic rich tea cake loaded with candied peels, raisins, and aromatic winter spices.',
    vegIndicator: VegIndicator.VEG,
    rating: 4.9,
    reviewsCount: 280,
    prepTime: 5,
    price: 180,
    discountPrice: 155,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    category: 'Bakery',
    subcategory: 'Cakes',
    ingredients: ['Dry Fruits', 'Butter Cake Sponge', 'Cardamom', 'Cinnamon'],
    spiceLevel: 'None',
    reviews: []
  },

  // 13. మణికంఠ స్పైసీ బిర్యానీ (chirala_rest_13)
  {
    id: 'chirala_food_13_1',
    restaurantId: 'chirala_rest_13',
    name: 'మణికంఠ ఆంధ్ర స్పైసీ చికెన్ బిర్యానీ (Manikanta Andhra Spicy Biryani)',
    description: 'Piping hot authentic Andhra style fiery chicken biryani with tender chicken pieces and special guntur spices.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.9,
    reviewsCount: 460,
    prepTime: 20,
    price: 270,
    discountPrice: 229,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
    category: 'Biryani',
    subcategory: 'Chicken Biryani',
    ingredients: ['Chicken Pieces', 'Guntur Chilli Paste', 'Basmati Rice', 'Ghee'],
    spiceLevel: 'High',
    isBestSeller: true,
    reviews: []
  },
  {
    id: 'chirala_food_13_2',
    restaurantId: 'chirala_rest_13',
    name: 'మణికంఠ మటన్ సుక్కా దమ్ బిర్యానీ (Manikanta Mutton Sukka Biryani)',
    description: 'Dry roasted tender mutton pieces tossed with crushed black pepper layered in aromatic biryani.',
    vegIndicator: VegIndicator.NON_VEG,
    rating: 4.9,
    reviewsCount: 380,
    prepTime: 25,
    price: 380,
    discountPrice: 330,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=400',
    category: 'Mutton Specials',
    subcategory: 'Biryani',
    ingredients: ['Mutton Sukka', 'Pepper Masala', 'Basmati Rice', 'Mint Leaves'],
    spiceLevel: 'High',
    isTrending: true,
    reviews: []
  }
];
