/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Restaurant } from '../types';

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
  // 1. Family Restaurants & Multi-Cuisine
  { name: 'Missamma Family Restaurant', type: 'Family', cuisines: ['Andhra meals', 'North Indian', 'Biryani'] },
  { name: 'Daawat Family Restaurant', type: 'Family', cuisines: ['Mughlai', 'Chinese', 'Tandoor'] },
  { name: 'CHIRALA AROMAS RESTAURANT', type: 'Family', cuisines: ['Continental', 'Tandoori Spec', 'Desserts'] },
  { name: 'ORANGE RESTAURANT', type: 'Family', cuisines: ['Indian', 'Chinese Noodles', 'Thalis'] },
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
  { name: 'Shankar Godavari Ruchulu', type: 'Biryani & Mandi', cuisines: ['Godavari Seafood Biryani', 'Godavari Pulao'] },
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
  { name: 'Fried Wings', type: 'Fast Food', cuisines: ['Crispy Battered Chicken Wings', 'Golden Strips'] },
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
  { name: 'New Iceberg', type: 'Desserts & Bakery', cuisines: ['Fruit Sundaes', 'Waffle Cones'] },
  { name: 'New Iceberg Temptations', type: 'Desserts & Bakery', cuisines: ['Choco Fudge brownie tubs', 'Pastries'] },
  { name: 'Ice Magic', type: 'Desserts & Bakery', cuisines: ['Chilled Popsicles', 'Milk Base Scoops'] },
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
    // Generate logical rating 3.9 - 4.9
    const rating = parseFloat((4.0 + (index % 10) * 0.1).toFixed(1));
    const reviewsCount = 50 + (index * 13) % 450;
    const deliveryTime = 15 + (index * 5) % 35;
    
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

    // Simulated distance in km (0.4 km to 9.2 km)
    const distance = parseFloat((0.5 + (index % 18) * 0.5).toFixed(1));

    // Offers
    const offers = [
      index % 2 === 0 ? 'FLAT 50% OFF' : '₹100 OFF with NUVVO',
      'Free delivery above ₹149'
    ];

    // Onboarded state setup (Approved by default for system bootstrap, but super admin can switch)
    // Make sure some (e.g. 5 latest ones) are un-approved for review simulation demo
    const isApproved = index < 85; 

    return {
      id: `chirala_rest_${index + 1}`,
      name: vendor.name,
      rating,
      reviewsCount,
      cuisines: vendor.cuisines,
      deliveryTime,
      costForTwo,
      image,
      isPromoted: index % 7 === 0,
      offers,
      isApproved,
      isActive: true, // Default active/available
      businessType: vendor.type as any,
      distance,
      phone: index % 2 === 0 ? '8328355812' : `91234${String(index).padStart(5, '0')}`
    };
  });
};
