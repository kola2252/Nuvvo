var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/data/catalog.ts
var CATEGORIES = [
  "Biryani",
  "South Indian",
  "North Indian",
  "Chinese",
  "Tiffins",
  "Fast Food",
  "Pizza",
  "Burgers",
  "Sandwiches",
  "Rolls",
  "Shawarma",
  "Ice Cream",
  "Desserts",
  "Bakery",
  "Juices",
  "Milkshakes",
  "Tea & Coffee",
  "Beverages",
  "Seafood",
  "Chicken Specials",
  "Mutton Specials",
  "Vegetarian Specials",
  "Healthy Foods",
  "Combo Meals",
  "Kids Specials"
];
var CATEGORY_ITEMS_SOURCE = {
  "Biryani": [
    { name: "Hyderabadi Chicken Dum Biryani", isVeg: false, price: 320, desc: "Fragrant layers of premium basmati rice cooked with marinated chicken pieces and original spices.", sub: "Chicken", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400" },
    { name: "Royal Mutton Dum Biryani", isVeg: false, price: 420, desc: "Traditional slow-cooked Lucknow biryani spiced lightly with tenderized leg elements.", sub: "Mutton", img: "https://images.unsplash.com/photo-1608500218900-8afa13d02791?auto=format&fit=crop&q=80&w=400" },
    { name: "Zafrani Paneer Makhani Biryani", isVeg: true, price: 280, desc: "Rich saffron tinted basmati layered with tender paneer cubes cooked in a cream tomato gravy.", sub: "Vegetarian", img: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=400" },
    { name: "Egg Tikka Dum Biryani", isVeg: false, price: 240, desc: "Grilled spiced eggs tossed in a rich brown onion gravy layered carefully with basmati.", sub: "Eggs", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Jackfruit Veggie Dum Biryani", isVeg: true, price: 290, desc: "Exotic marinated raw jackfruit (Kathal) nuggets slow-cooked with basmati, ginger, & mint.", sub: "Vegetarian", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400" },
    { name: "Spicy Guntur Chicken Biryani", isVeg: false, price: 330, desc: "Fiery Andhra-style biryani prepared with freshly roasted red Guntur chillies & curry leaves.", sub: "Chicken", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400" },
    { name: "Kolkata Chicken Biryani (with Potato)", isVeg: false, price: 310, desc: "Light yet fragrant cooked under-dum with a whole egg and golden spiced potato.", sub: "Chicken", img: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=400" },
    { name: "Ambur Mutton Special Biryani", isVeg: false, price: 440, desc: "Short-grained Seeraga samba rice cooked with juicy goat meat pieces in simple South herbs.", sub: "Mutton", img: "https://images.unsplash.com/photo-1608500218900-8afa13d02791?auto=format&fit=crop&q=80&w=400" }
  ],
  "South Indian": [
    { name: "Ghee Podi Masala Dosa", isVeg: true, price: 140, desc: "Golden crispy rice crepe topped with spicy gun powder and direct native pure ghee.", sub: "Dosa", img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=400" },
    { name: "Vada & Sambar Set (2 Pcs)", isVeg: true, price: 90, desc: "Crispy deep-fried lentil donuts flavored with peppercorns, served with hing Sambar.", sub: "Tiffins", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Steam Button Idli Sambar Float", isVeg: true, price: 95, desc: "12 bite-sized fluffy button idlis immersed completely in aromatic steaming hot sambar.", sub: "Tiffins", img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=400" },
    { name: "Crispy Rava Onion Masala Dosa", isVeg: true, price: 155, desc: "Semolina-based lacey crisp dosa styled with heaps of green chillies and broken cashews.", sub: "Dosa", img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=400" },
    { name: "Peshawari Ragi Flour Dosa", isVeg: true, price: 120, desc: "Nutritious finger-millet batter roasted on a stone girdle. Highly recommended for diet.", sub: "Healthy", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Karnataka Special Bisi Bele Bath", isVeg: true, price: 150, desc: "Hot spicy lentil rice dish loaded with country veggies, topped with pure ghee & khara boondi.", sub: "Rice Bowls", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Authentic Curd Rice with Tadka", isVeg: true, price: 110, desc: "Soft-mashed cold curd rice blended with fresh cream, mustard temper and sweet red pomegranate.", sub: "Rice Bowls", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Coorg Chicken Fry with Neer Dosa", isVeg: false, price: 280, desc: "Peppery dry Coorg style chicken paired ideally with 3 paper-thin lacy steam Neer dosas.", sub: "Combos", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" }
  ],
  "North Indian": [
    { name: "Paneer Butter Masala (Royal)", isVeg: true, price: 260, desc: "Premium paneer cubes simmered lovingly in an smooth, rich orange-toned butter tomato gravy.", sub: "Paneer", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400" },
    { name: "Dal Makhani (Overnight Stewed)", isVeg: true, price: 210, desc: "Slow-cooked whole black lentils simmered on coal fires overnight with generous cream butter.", sub: "Dal", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400" },
    { name: "Amritsari Kulcha with Chole", isVeg: true, price: 180, desc: "Flaky clay-oven flatbread stuffed with spiced potato and paneer served with tangy chana.", sub: "Combos", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400" },
    { name: "Kadhai Chicken (Home-style)", isVeg: false, price: 295, desc: "Bone chicken pieces tossed in fresh kadhai ground corridor spices, sweet bell peppers.", sub: "Chicken", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" },
    { name: "Malai Kofta in White Gravy", isVeg: true, price: 275, desc: "Silky paneer-cashew dumplings floating in an aromatic cardamom scented sweet cottage-cheese gravy.", sub: "Curries", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400" },
    { name: "Tandoori Roti with Butter", isVeg: true, price: 40, desc: "Clay oven wheat flatbread, smeared generously with premium table baking butter.", sub: "Breads", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400" },
    { name: "Garlic Butter Naan (Flaky)", isVeg: true, price: 80, desc: "Fine leavened flatbread topped with toasted crushed minced garlic pods and fresh mint.", sub: "Breads", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400" },
    { name: "Kashmiri Dum Aloo Mash", isVeg: true, price: 210, desc: "Baby potatoes cooked dry in traditional warm fennel and ginger-based tomato reduction.", sub: "Curries", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400" }
  ],
  "Chinese": [
    { name: "Schezwan Chilli Garlic Noodles", isVeg: true, price: 180, desc: "Hand-pulled skinny noodles tossed with dry chillies, crushed garlic, and savory premium soy.", sub: "Noodles", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400" },
    { name: "Crispy Veg Manchurian Bowl", isVeg: true, price: 210, desc: "Fried multi-veggie golden balls coated in a dark, sweet and tangy soy ginger sauce.", sub: "Gravy", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400" },
    { name: "Chicken Fried Rice & Chilli Chicken Combo", isVeg: false, price: 290, desc: "Classic fried rice served with seasoned diced sweet onions, bell peppers and saucy chicken.", sub: "Combos", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400" },
    { name: "Steam Chicken Momos (6 Pcs)", isVeg: false, price: 160, desc: "Delicate wheat pouches stuffed with soft spiced chicken, steam-cooked, with spicy red chili chutney.", sub: "Momos", img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400" },
    { name: "Paneer Chilli Dry Starter", isVeg: true, price: 230, desc: "Wok-tossed battered cottage cheese with premium capsicums, dark seasoning, green onions.", sub: "Dry Starters", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400" },
    { name: "Wok-Fired Chicken Fried Rice", isVeg: false, price: 235, desc: "Smoky street-flavored steamed rice tossed with egg scrambles, shredded roast chicken & herbs.", sub: "Fried Rice", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400" },
    { name: "Drums of Heaven (5 Pcs)", isVeg: false, price: 280, desc: "Classic chicken lollipops fried golden, tossed in high sweet chilli paste & fresh herbs.", sub: "Dry Starters", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400" },
    { name: "Sweet Corn Veg Cream Soup", isVeg: true, price: 120, desc: "Comforting warm starch broth packed with sweet corn bits, diced carrots, and fresh peppercorns.", sub: "Soup", img: "https://images.unsplash.com/photo-1547592165-e1d17fed6005?auto=format&fit=crop&q=80&w=400" }
  ],
  "Tiffins": [
    { name: "Ultimate Ghee Karam Idli", isVeg: true, price: 100, desc: "Four mini idlis coated in house mix dry roasted spice podi and saturated with rich fresh ghee.", sub: "Idli", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Nuvvo Combo Breakfast Plate", isVeg: true, price: 180, desc: "Premium breakfast sampler - 1 Idli, 1 Vada, mini Masala Dosa, small Khara Bath and delicious Kesari.", sub: "Combos", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Mysore Bonda (4 Pcs)", isVeg: true, price: 90, desc: "Golden fluffy dumplings made of refined key flour, ginger and coconut bits, served with ground coconut dip.", sub: "Snacks", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Wheat Puri with Potato Kurma", isVeg: true, price: 110, desc: "Three puffed golden-fried wheat flatbreads with spiced onion-potato yellow curry.", sub: "Puri", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Onion Uttapam (Set of 2)", isVeg: true, price: 120, desc: "Thick fluffy savory pancakes studded with chopped red onions, fresh coriander, green chiles.", sub: "Uttapam", img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=400" },
    { name: "Plain Steamed Rice Idli (3 Pcs)", isVeg: true, price: 70, desc: "Spongy fermented rice cakes served with our famous ginger and peanut traditional chutneys.", sub: "Idli", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Crispy Medu Vada (Set of 3)", isVeg: true, price: 95, desc: "Aromatic fried lentil rings with crispy skins, paired with tangy spicy ginger sambar.", sub: "Snacks", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Semolina Upma (Khara Bath)", isVeg: true, price: 80, desc: "Comforting, delicately spiced roasted cream of wheat item tossed with green sweet peas and carrots.", sub: "Upma", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" }
  ],
  "Fast Food": [
    { name: "Peri-Peri Crinkle Fries", isVeg: true, price: 110, desc: "Crispy salted potato wedges dusted with signature hot peri-peri dry spices.", sub: "Fries", img: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=400" },
    { name: "Crispy Chicken Wings (6 Pcs)", isVeg: false, price: 210, desc: "Deep-fried battered organic wings glazed with sticky honey chili hot buffalo sauces.", sub: "Chicken", img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400" },
    { name: "Loaded Nacho Overload", isVeg: true, price: 160, desc: "Crisp tortilla chips topped with fresh cheese blend, green jalapenos, olives & thick avocado sauce.", sub: "Starters", img: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=400" },
    { name: "Cheese Stuffed Garlic Bread", isVeg: true, price: 140, desc: "Four pieces of baked herb bread stuffed with gooey mozzarella cheese and garlic butter.", sub: "Breads", img: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&q=80&w=400" },
    { name: "Crispy Mozzarella Sticks (5 Pcs)", isVeg: true, price: 130, desc: "Italian-seasoned breaded long cheese cylinders fried hot with standard marinara sauce.", sub: "Starters", img: "https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?auto=format&fit=crop&q=80&w=400" },
    { name: "Popcorn Chicken Bites Box", isVeg: false, price: 175, desc: "Byte-sized chicken tender elements marinated in herbs and fried crunch, served with garlic dip.", sub: "Chicken", img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400" },
    { name: "Classic Onion Rings Basket", isVeg: true, price: 110, desc: "Beer-battered massive white sweet onion circles fried golden, dusted with sea salt crystals.", sub: "Fries", img: "https://images.unsplash.com/photo-1639024471283-2da7b3c6a26b?auto=format&fit=crop&q=80&w=400" },
    { name: "Chicken Cheese Jalapeno Poppers", isVeg: false, price: 190, desc: "Spiced chicken balls stuffed with diced jalapenos and melted high cheese.", sub: "Chicken", img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400" }
  ],
  "Pizza": [
    { name: "Double Cheese Margherita Pizza", isVeg: true, price: 340, desc: "Classic sourdough handstretched base loaded with rich fresh cheese, tomato puree & fresh basil leaves.", sub: "Veg Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400" },
    { name: "Ultimate Spicy Pepperoni Feast", isVeg: false, price: 490, desc: "Topped generously with dynamic spicy cured pepperoni slices, fresh herbs & strings of cheese.", sub: "Non-Veg Pizza", img: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=400" },
    { name: "Nuvvo Supreme Veggie Green", isVeg: true, price: 420, desc: "Delightful mix of black olives, baby corn, green capsicum, onion and paneer chunks.", sub: "Veg Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400" },
    { name: "Chicken Tikka & Fiery Onion Pizza", isVeg: false, price: 460, desc: "Indian spicy style fusion - marinated chicken tikka charcoal pieces, red onions and green chillies.", sub: "Non-Veg Pizza", img: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=400" },
    { name: "Smoky BBQ Chicken Mushroom Pizza", isVeg: false, price: 480, desc: "Glazed BBQ roasted tender chicken, topped with grilled button mushroom and special cheese mix.", sub: "Non-Veg Pizza", img: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=400" },
    { name: "Toscana Garden Herb Pizza", isVeg: true, price: 390, desc: "Healthy thin wheat base with spinach beds, sun-dried tomatoes, roasted garlic, and low-fat cheese.", sub: "Veg Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400" },
    { name: "Four Cheese Classic (Quattro Formaggi)", isVeg: true, price: 450, desc: "White based pizza layered with Mozzarella, Cheddar, Blue cheese, and fresh processed Parmesan.", sub: "Veg Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400" },
    { name: "Fiery Sriracha Chicken Loaded Pizza", isVeg: false, price: 470, desc: "Drizzled with intense spicy sriracha mayo, loaded with shredded hot chicken and red jalapeno rings.", sub: "Non-Veg Pizza", img: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=400" }
  ],
  "Burgers": [
    { name: "Classic Crispy Veg Patty Burger", isVeg: true, price: 120, desc: "Herb potato mush patty fried crisp, layered with dynamic tomato slices, fresh loose lettuce & mayo.", sub: "Veg Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { name: "Nuvvo Double Smoke Grill Burger", isVeg: false, price: 210, desc: "Flame grilled double chicken patty burger with smoked cheddar cheese and fried onions.", sub: "Non-Veg Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { name: "Sriracha Spicy Melt Paneer Burger", isVeg: true, price: 165, desc: "Crunchy battered block of paneer coated with fiery sriracha glazes, premium cheddar cheese.", sub: "Veg Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { name: "Premium American Cheese Beef-Style Burger", isVeg: false, price: 240, desc: "Smash chicken custom patty loaded with yellow cheddar, pickled organic gherkin & special burger recipe sauce.", sub: "Non-Veg Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { name: "Golden Fried Shrimp Po Burger", isVeg: false, price: 260, desc: "Pristine battered crispy coastal shrimp layered with lemon dill aioli and shredded cabbage.", sub: "Non-Veg Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { name: "Veggie Beetroot High Protein Burger", isVeg: true, price: 145, desc: "Made with organic quinoa, beetroot crumbs and oats, served with fat-free greek yogurt dip.", sub: "Veg Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { name: "Texas BBQ Pulled Chicken Burger", isVeg: false, price: 220, desc: "Sweet shredded warm pulled chicken breast tossed in hickory BBQ sauce on brioche.", sub: "Non-Veg Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { name: "Double Cheese Macaroni Patty Burger", isVeg: true, price: 170, desc: "Extremely gooey baked macaroni pasta consolidated as a golden fried puck, with mayo.", sub: "Veg Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" }
  ],
  "Sandwiches": [
    { name: "Classic Grilled Bombay Toastie", isVeg: true, price: 90, desc: "Stuffed with coriander mint chutney, potato slices, tomatoes, capsicum and heaps of cheese.", sub: "Veg", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400" },
    { name: "Ultimate Club Chicken Sandwich", isVeg: false, price: 180, desc: "Triple layer loaf bread loaded with soft chicken salad, fried farm egg, crispy veggies & pepper.", sub: "Non-Veg", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400" },
    { name: "Spicy Corn & Cheese Grid Sandwich", isVeg: true, price: 110, desc: "Sweet golden corn and green chillies blended in white cheese sauce, toasted crisp on flat pan.", sub: "Veg", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400" },
    { name: "Pesto Caprese Healthy Sourdough Sandwich", isVeg: true, price: 165, desc: "Fresh basil pesto glaze with thick local mozzarella rounds and baby plum tomatoes.", sub: "Veg", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400" },
    { name: "Lemon Herb Paneer Tikka Toast", isVeg: true, price: 145, desc: "Spiced marinated paneer blocks mashed with mint spreads, toasted fully on automatic bread press.", sub: "Veg", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400" },
    { name: "Shredded Honey Mustard Chicken Sandwich", isVeg: false, price: 175, desc: "Rich chicken salad loaded with honey, dijon mustard, crisp celery bits on multi-grain bread.", sub: "Non-Veg", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400" },
    { name: "Tex-Mex BBQ Paneer Loaded Griller", isVeg: true, price: 135, desc: "Smoky sweet marinaded paneer crumb, with dark sweet spices, red onions & bell peppers.", sub: "Veg", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400" },
    { name: "Smoked Jalapeno Egg Salad Toast", isVeg: false, price: 125, desc: "Slow-boiled smashed eggs loaded with warm smoked paprika, green jalapenos, and cream mayonnaise.", sub: "Non-Veg", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400" }
  ],
  "Rolls": [
    { name: "Direct Kolkata Style Paneer Roll", isVeg: true, price: 130, desc: "Crisp layered paratha loaded with spice grilled chili-lime paneer chunks, sweet onions & spices.", sub: "Veg Rolls", img: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=400" },
    { name: "Double Egg Devil Mughlai Paratha Roll", isVeg: false, price: 110, desc: "Cracked double egg flat base paratha rolled up with fresh onions, lemon water sprays.", sub: "Egg Rolls", img: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=400" },
    { name: "Butter Chicken Masala Loaded Wrap", isVeg: false, price: 170, desc: "Stuffed with juicy leftover butter chicken shreds, wrapped with cream cabbage slaw.", sub: "Non-Veg Rolls", img: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=400" },
    { name: "Spicy Potato Pepper Szechuan Roll", isVeg: true, price: 95, desc: "Crispy potato fingers tossed in spicy schezwan sauce wrapped neatly in soft roti.", sub: "Veg Rolls", img: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=400" },
    { name: "Reshmi Malai Tikka Premium Wrap", isVeg: false, price: 180, desc: "Super tender chicken malai kebab logs tossed with sweet cream and onions in whole paratha.", sub: "Non-Veg Rolls", img: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=400" },
    { name: "Cheesy Garlic Mushroom Garden Roll", isVeg: true, price: 140, desc: "Stir-fried garlic herb button mushroom tossed in cheese paste, wrapped warm with oregano.", sub: "Veg Rolls", img: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=400" },
    { name: "Tangy Soya Chaap Tikka Roll", isVeg: true, price: 135, desc: "Marinated soya chaap cooked in dry clay kiln tandoor, tossed with chaat-masala, rolled.", sub: "Veg Rolls", img: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=400" },
    { name: "Bhari Seekh Kabab Classic Roll", isVeg: false, price: 195, desc: "Minced spiced mutton seekh kebab sticks rolled with cooling mint yoghurt & lime sprigs.", sub: "Non-Veg Rolls", img: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=400" }
  ],
  "Shawarma": [
    { name: "Authentic Classic Chicken Shawarma", isVeg: false, price: 140, desc: "Premium spit roasted sliced chicken seasoned lightly wrapped in fresh soft pita bread with garlic mayo.", sub: "Classic", img: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=400" },
    { name: "Whole Meat Plate Shawarma (No Veggies)", isVeg: false, price: 190, desc: "Piles of sliced roasted chicken served with two portions of house special toum garlic sauce.", sub: "Platters", img: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=400" },
    { name: "Paneer Arabic Style Thick Shawarma", isVeg: true, price: 150, desc: "Marinated roasted paneer block shredded and wrapped in flat bread with creamy tahini dressing.", sub: "Classic", img: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=400" },
    { name: "Nuvvo Fiery Ghost Pepper Shawarma", isVeg: false, price: 155, desc: "Stuffed chicken salad blended with spicy ghost pepper dips, hot pickles and green jalapeno.", sub: "Spicy Spec", img: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=400" },
    { name: "Falafel and Tahini Cream Wrap", isVeg: true, price: 110, desc: "Crisp deep-fried chickpea dumplings wrapped with hummus salad and lemon cream.", sub: "Classic", img: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=400" },
    { name: "Chef Special Loaded Open Shawarma Plate", isVeg: false, price: 230, desc: "Beds of shredded chicken, side salads, toasted pickles, dual pita pockets & red hot garlic sauce.", sub: "Platters", img: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=400" },
    { name: "Dill Lemon Pickle Chicken Shawarma", isVeg: false, price: 145, desc: "Spiced chicken roasted chunks mixed with lemon rinds and dill pickles, loaded in khubus.", sub: "Classic", img: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=400" },
    { name: "Baked Soya Shawarma Roll (Healthy)", isVeg: true, price: 135, desc: "Zero cholesterol soya chunks marinated with authentic Middle Eastern spices and light low-fat curd.", sub: "Classic", img: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=400" }
  ],
  "Ice Cream": [
    { name: "Double Chocolate Fudge Brownie Tub", isVeg: true, price: 180, desc: "Decadent chocolate ice cream loaded with rich house-baked brownie chunks, sweet liquid hot fudge.", sub: "Tubs", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400" },
    { name: "Chef Sundae Delight Overload", isVeg: true, price: 210, desc: "Layers of Vanilla, Strawberry ice cream, mixed fruits cocktail, dry cashew nuts and syrup.", sub: "Sundaes", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400" },
    { name: "Alfonso Mango Fresh Pulp Scoop", isVeg: true, price: 85, desc: "Creamy seasonal mango ice cream blended with chunks of sweet Alphonso mango pulp.", sub: "Scoops", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400" },
    { name: "Dry Fruit Shahi Kulfi Slice", isVeg: true, price: 95, desc: "Dense rich reduced milk stick ice cream flavored with green cardamom, pistachio slices and saffron.", sub: "Scoops", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400" },
    { name: "Salted Caramel popcorn Crust Tub", isVeg: true, price: 190, desc: "Blended sweet and salty ice cream topped with crisp caramel glaze pop-corn chunks.", sub: "Tubs", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400" },
    { name: "Rich Madagascar Vanilla Ice Cream", isVeg: true, price: 75, desc: "Classic double-churned ice cream using original sweet vanilla bean pods import extract.", sub: "Scoops", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400" },
    { name: "Cookie and Cream Deluxe Jar", isVeg: true, price: 160, desc: "Smushed Oreo crumbs in vanilla base layered with delicious sweet liquid chocolate.", sub: "Sundaes", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400" },
    { name: "Zesty Blueberry Yogurt Gelato", isVeg: true, price: 140, desc: "Gelato style premium churned sour yogurt flavor spiked with mountain blueberry jellies.", sub: "Scoops", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400" }
  ],
  "Desserts": [
    { name: "Signature Hot Sizzling Brownie", isVeg: true, price: 190, desc: "Denser butter chocolate brownie served with cold vanilla scoop and hot pouring milk-chocolate.", sub: "Cakes", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" },
    { name: "Golden Hot Gulab Jamun (3 Pcs)", isVeg: true, price: 80, desc: "Spongy deep-fried berry milk balls soaked completely in rose water cardamom sugar elixir.", sub: "Indian", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" },
    { name: "Premium Tres Leches Cake Slice", isVeg: true, price: 215, desc: "Spongy milk cake saturated overnight in triple sweet cream mix, dusted with green pistachio crumbs.", sub: "Cakes", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" },
    { name: "Gajar ka Halwa (pure Desi Ghee)", isVeg: true, price: 110, desc: "Winter red carrots grated and slow boiled with whole milk, sweet sugar, ghee and fried almonds.", sub: "Indian", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" },
    { name: "Classic Tiramisu Italian Dessert Cup", isVeg: false, price: 240, desc: "Espresso dipped sponge ladyfingers resting in mascarpone egg cream sprinkled with dark cocoa.", sub: "Cakes", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" },
    { name: "Rasmalai Saffron Treat (2 Pcs)", isVeg: true, price: 85, desc: "Flattened cottage cheese patties squeezed dry and placed in cool pistacio-saffron creamy milk.", sub: "Indian", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" },
    { name: "Warm Apple Cinnamon Pie Slice", isVeg: true, price: 150, desc: "Spiced sweet sliced red apples baked carefully inside a flaky double butter crust base.", sub: "Cakes", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" },
    { name: "New York Baked Cheesecake Slice", isVeg: false, price: 230, desc: "Super heavy rich cream-cheese baked cake slice resting on butter graham cracker crust.", sub: "Cakes", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" }
  ],
  "Bakery": [
    { name: "Butter Croissant (French Style)", isVeg: true, price: 90, desc: "Multi-layered flaky viennoiserie pastry styled with 100% fine rich butter layers.", sub: "Pastry", img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400" },
    { name: "Stuffed Chocolate Muffin Dome", isVeg: true, price: 80, desc: "Rich fluffy sponge cake base stuffed with warm dark chocolate ganache pocket inside.", sub: "Sweet Bakery", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" },
    { name: "Artisan Garlic Loaf Sourdough", isVeg: true, price: 140, desc: "Wild yeast slow fermented crispy crust bread spiced heavily with garlic herbs.", sub: "Bread Loaf", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" },
    { name: "Baked Blueberry Pastry Tart", isVeg: true, price: 110, desc: "Shortcrust butter cup pastry loaded with sticky wild sweet blueberry pure preserves.", sub: "Pastry", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" },
    { name: "Eggless Butter Coconut Cookies (Box)", isVeg: true, price: 150, desc: "Crunchy tea-time cookies loaded with dry toasted dessicated coconut shreds and milk.", sub: "Cookies", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" },
    { name: "Cinnamon Swirl Sugar Roll", isVeg: true, price: 95, desc: "Yeast bread roll rolled with sugar, butter and brown cinnamon, glazed with icing sugar.", sub: "Sweet Bakery", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" },
    { name: "French Baguette Style Long Bread", isVeg: true, price: 85, desc: "Crispy hard crust water bread classic loaf, perfect for garlic butter toast pairing.", sub: "Bread Loaf", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" },
    { name: "Double Choco Chip Giant Cookie", isVeg: true, price: 75, desc: "Soft chewy butter brown cookie studded with plenty of milk and dark semisweet chips.", sub: "Cookies", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" }
  ],
  "Juices": [
    { name: "Fresh Pomegranate (Anar) Juice", isVeg: true, price: 140, desc: "Cold pressed sweet ruby pomegranate kernels, served immediately without water dilution.", sub: "Fresh Juices", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400" },
    { name: "Valencia Orange Citrus Pulp Juice", isVeg: true, price: 110, desc: "Squeezed fresh citrus orange fruit juices, rich source of natural Vitamin C nutrients.", sub: "Fresh Juices", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400" },
    { name: "Immunity Booster Juice blend", isVeg: true, price: 120, desc: "Extracted raw blend of carrot, ginger, fresh green celery and zesty sweet lemons.", sub: "Healthy Blends", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400" },
    { name: "Detox Charcoal Lemon Water Mixer", isVeg: true, price: 95, desc: "Activated charcoal dust and dynamic mint blended with lemon juice, sea salts and honey.", sub: "Healthy Blends", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400" },
    { name: "Chilled Watermelon Mint Refresher", isVeg: true, price: 80, desc: "Hydrating direct watermelon slice juice blended with fresh black peppercorns and mint leaves.", sub: "Fresh Juices", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400" },
    { name: "Sweet Pineapple Pulpy Elixir", isVeg: true, price: 95, desc: "Fresh local pineapple slices spun with brown organic sugar and tiny bit ginger salt.", sub: "Fresh Juices", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400" },
    { name: "Tangy Green Apple Cucumber Celery", isVeg: true, price: 130, desc: "Crisp green sour apple blended with hydrating cucumber slice and organic celery sprigs.", sub: "Healthy Blends", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400" },
    { name: "Cool Cucumber Mint Lemonade", isVeg: true, price: 75, desc: "Zero calories cold summer refresher, with cucumber puree, wild lime juice and ice.", sub: "Fresh Juices", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400" }
  ],
  "Milkshakes": [
    { name: "Ultimate Alfonso Mango Thickshake", isVeg: true, price: 160, desc: "Blended real sweet Alphonso mango frozen chunks with rich organic ice cream base.", sub: "Fruit Shakes", img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400" },
    { name: "Heavy Belgian Chocolate Shake", isVeg: true, price: 150, desc: "Rich cocoa paste and milk ice cream blended into a thicker shake, laced with dark cocoa syrup.", sub: "Chocolate", img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400" },
    { name: "Kesar Pista Badam Royal Shake", isVeg: true, price: 175, desc: "Indian milk shake blended with almonds, pistachio paste, pure saffron strands and honey.", sub: "Indian Shakes", img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400" },
    { name: "Classic Strawberry Cream Shake", isVeg: true, price: 130, desc: "Sweet red strawberry frozen fruit bits cream blended with original ice cream scoops.", sub: "Fruit Shakes", img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400" },
    { name: "Creamy Oreo Crumble Blender", isVeg: true, price: 145, desc: "Loaded with real oreo chocolate cookies crushed in milk cream shake, topped with choco chips.", sub: "Chocolate", img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400" },
    { name: "Roasted Almond Butter Peanut Shake", isVeg: true, price: 165, desc: "High protein blended shake with crunchy peanut butter, roasted almond extract and dates.", sub: "Healthy Shakes", img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400" },
    { name: "Cold Caramel Espresso Frappe Shake", isVeg: true, price: 155, desc: "Strong shot of South Indian espresso blended with sweet caramel syrup and thick vanilla.", sub: "Chocolate", img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400" },
    { name: "Fragrant Rose Gulkand Milkshake", isVeg: true, price: 140, desc: "Cool pink milk shake item flavored with organic honey-soaked Damascus rose petals (Gulkand).", sub: "Indian Shakes", img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400" }
  ],
  "Tea & Coffee": [
    { name: "Traditional South Indian Filter Coffee", isVeg: true, price: 70, desc: "Brewed from chicory blend coffee seeds, frothed with steaming whole cream milk.", sub: "Coffee", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" },
    { name: "Spicy Ginger Masala Chai Flask", isVeg: true, price: 95, desc: "Warm whole milk tea brewed with hand-pounded fresh ginger roots, cardamom and cinnamon.", sub: "Tea", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" },
    { name: "Hazelnut Cold Brew Latte", isVeg: true, price: 140, desc: "18-hour slow steeped cold black coffee, blended with hazelnut syrups and cold milk foam.", sub: "Coffee", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" },
    { name: "Organic Matcha Green Tea Latte", isVeg: true, price: 150, desc: "Imported Japanese certified matcha powder frothed with hot soy milk and green stevia sweeteners.", sub: "Tea", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" },
    { name: "Chocolaty Hot Cappuccino Classic", isVeg: true, price: 110, desc: "Espresso topped with heavy frothed milk layers, dusted cleanly with sweet dark cocoa.", sub: "Coffee", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" },
    { name: "Kesari Saffron Special Elaichi Chai", isVeg: true, price: 105, desc: "Rich milk tea infused with premium Kashmiri saffron stigmas and pounded cardamom pods.", sub: "Tea", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" },
    { name: "Chilled Peach Green Iced Tea", isVeg: true, price: 90, desc: "Steeped green tea cooled on cube ice, loaded with natural peach juices & lime sprigs.", sub: "Tea", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" },
    { name: "Belgian Mocha Mocha Latte", isVeg: true, price: 145, desc: "Premium blend of espresso, dark dark hot chocolate, whole milk, and heavy vanilla syrup on top.", sub: "Coffee", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" }
  ],
  "Beverages": [
    { name: "Zesty Lemon Mint Mojito Soda", isVeg: true, price: 90, desc: "Crushed lime wedges, fresh mint leaves, cane sugar syrup topped with sparkling chilled tonic soda.", sub: "Coolers", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400" },
    { name: "Classic Diet Coke Cane (330ml)", isVeg: true, price: 40, desc: "Zero calorie fizzy dynamic cooling can, served hyper-chilled with a custom paper cup.", sub: "Canned", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400" },
    { name: "Dynamic Red Bull Energy Drink", isVeg: true, price: 110, desc: "Global dynamic energy mixer booster served direct with sweet cooling cube elements.", sub: "Canned", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400" },
    { name: "Himalayan Organic Mineral Water Bottled", isVeg: true, price: 50, desc: "Pristine direct natural spring mineral source hydration bottle standard purified packaging.", sub: "Canned", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400" },
    { name: "Blue Curacao Lagoon Refresher", isVeg: true, price: 100, desc: "Vibrant sweet citrus blue lagoon syrup mixed with mineral soda and zesty lime slices.", sub: "Coolers", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400" },
    { name: "Chilled Coconut Tender Water Flask", isVeg: true, price: 75, desc: "Naturally sweetened pure hydration tender coconut water directly from coastal trees.", sub: "Coolers", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400" },
    { name: "Sweet Mango Lassi Cream float", isVeg: true, price: 80, desc: "Churned sweet thick yogurt drink with rich mango pulp extracts, served in earthen cup pattern.", sub: "Coolers", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400" },
    { name: "Spiced Salted Butter-Milk (Chaas)", isVeg: true, price: 60, desc: "Cold yogurt-based cooling potion tempered with crushed ginger, green chillies, curry leaves.", sub: "Coolers", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400" }
  ],
  "Seafood": [
    { name: "Goan Fish Curry with steamed Rice", isVeg: false, price: 340, desc: "Regional Kingfish steak slow cooked in an intense spiced coconut mango gravy, with Basmati rice.", sub: "Curries", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400" },
    { name: "Golden Garlic butter Tiger Prawns", isVeg: false, price: 390, desc: "Six tiger prawns tossed in pan-seared yellow organic butter, garlic elements, and parsley leaves.", sub: "Starters", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400" },
    { name: "Mangalorean spicy Rava Fry Fish", isVeg: false, price: 310, desc: "Seer fish fillet coated with red spice masala and rolled in crunchy crisp semolina, fried dry.", sub: "Starters", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400" },
    { name: "Spicy Crab Masala Roast Fry", isVeg: false, price: 410, desc: "Soft-shell coastal crab cooked in black pepper dry dry curry base with roasted coconut crumbs.", sub: "Curries", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400" },
    { name: "Tandoori Pomfret Royal Whole Fish", isVeg: false, price: 440, desc: "Whole bone pomfret spiked in yoghurt-tandoor spices grill roasted, served with pickled onions.", sub: "Starters", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400" },
    { name: "Crispy Lemon Basil Squid Rings", isVeg: false, price: 295, desc: "Deep-fried golden squid ring bites dusted with lime seasonings, green basil and pink salts.", sub: "Starters", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400" },
    { name: "Kerala Malabar Fish Dum Curry", isVeg: false, price: 340, desc: "Traditional sour tamarind-based reddish curry cooked with local red spices and curry leaves.", sub: "Curries", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400" },
    { name: "Shrimp Masala Fried Rice (Smoky)", isVeg: false, price: 280, desc: "Smoky fried rice loaded with prawns, cooked vegetables and organic egg scrambles, soy seasoning.", sub: "Fried Rice", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400" }
  ],
  "Chicken Specials": [
    { name: "Rich Punjabi Butter Chicken Masala", isVeg: false, price: 290, desc: "Tandoor roasted boneless chicken cubes cooked inside a buttery tomato cashew elite gravy.", sub: "Curries", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" },
    { name: "Spicy Chettinad Pepper Chicken Dry", isVeg: false, price: 240, desc: "Fiery dry side chicken dish from Tamil Nadu cooked with freshly ground pepper and curry leaves.", sub: "Starters", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" },
    { name: "Half Tandoori Chicken Clay-fired", isVeg: false, price: 270, desc: "Juicy bone chicken segments marinated in high red yogurt spices and clay roasted, mint dip.", sub: "Starters", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" },
    { name: "Mughlai Chicken Rezala White Curry", isVeg: false, price: 310, desc: "Royal chicken dish stewed in smooth white yoghurt paste flavored heavily with dry red pepper.", sub: "Curries", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" },
    { name: "Spicy Guntur Hot Chicken Roast", isVeg: false, price: 260, desc: "Aromatic dry chicken coated in spicy red paste, finished with dry roasted cashews.", sub: "Starters", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" },
    { name: "Chicken Mughlai Tikka Masala (Boneless)", isVeg: false, price: 295, desc: "Barbecue chicken cubes tossed in thick spicy masala gravy spiced with onion, tomato & ginger.", sub: "Curries", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" },
    { name: "Crispy Southern Spicy Chicken Drumstick", isVeg: false, price: 230, desc: "Three piece crumb-coated chicken legs seasoned with hot cayenne herbs and garlic butter dip.", sub: "Starters", img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400" },
    { name: "Home-style Chicken Methi Malai stew", isVeg: false, price: 285, desc: "Mildly spiced chicken curry cooked with fragrant fresh fenugreek leaves and sweet rich cream.", sub: "Curries", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" }
  ],
  "Mutton Specials": [
    { name: "Royal Kashmiri Mutton Rogan Josh", isVeg: false, price: 410, desc: "Slow-cooked lamb shank, spiced beautifully with dry Kashmiri peppers, fennel powder and ginger.", sub: "Curries", img: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400" },
    { name: "Hyderabadi Mutton Keema Masala Roast", isVeg: false, price: 380, desc: "Minced spiced mutton dry roast cooked with sweet green peas and spicy royal whole spices.", sub: "Starters", img: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400" },
    { name: "Mutton Bhuna Gosht dry Gravy", isVeg: false, price: 430, desc: "Tender baby goat pieces pan roasted with dry caramel brown onion reduction and dark spices.", sub: "Curries", img: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400" },
    { name: "Andhra Mutton Fry with curry leaves", isVeg: false, price: 390, desc: "Fiery chunks of mutton dry tossed in black pepper powder, dry chillies and rich curry leaves.", sub: "Starters", img: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400" },
    { name: "Lucknowi Nihari Slow-cooked Stew", isVeg: false, price: 420, desc: "Overnight slow cooked rich flour-thick stew with mutton shanks, garnished with ginger juliennes.", sub: "Curries", img: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400" },
    { name: "Royal Mutton Seekh Kebab Platter", isVeg: false, price: 360, desc: "Four minced spiced lamb cylinders grilled over charcoal fire served with mint yoghurt dips.", sub: "Starters", img: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400" },
    { name: "Bengali Mutton Kosha (Rich)", isVeg: false, price: 415, desc: "Tender mutton cooked in thick spicy mustard-infused onion gravy, paired with potatoes.", sub: "Curries", img: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400" },
    { name: "Royal Mutton Shami Kebab patties", isVeg: false, price: 340, desc: "Four soft minced lamb and split chickpea patties fried golden, flavored with rose cardamom.", sub: "Starters", img: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400" }
  ],
  "Vegetarian Specials": [
    { name: "Slow Baked Paneer Multani Tikka", isVeg: true, price: 240, desc: "Big chunks of cottage cheese stuffed with dry fruits, marinated in herb paste and baked.", sub: "Paneer", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400" },
    { name: "Rich Shahi Kaju Butter Masala", isVeg: true, price: 230, desc: "Whole roasted cashew nuts simmered with onions, ground tomatoes, sweet cream butter.", sub: "Rich Veg", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" },
    { name: "Mix Veg Jaipuri Royal dry", isVeg: true, price: 180, desc: "Cauliflower, green beans, carrot and peas cooked in dry spicy gravy, topped with papad crumbs.", sub: "Dry", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" },
    { name: "Mushroom Do Pyaza curry stew", isVeg: true, price: 210, desc: "Button mushrooms sauteed dry with double portions of sweet onions, tomatoes and spice herbs.", sub: "Rich Veg", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" },
    { name: "Classic Banarasi Dum Aloo Fry", isVeg: true, price: 170, desc: "Fried potatoes stuffed with paneer and spices, floating in spicy, authentic ginger gravy.", sub: "Dry", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" },
    { name: "Dhaba Style Methi Chaman Paneer", isVeg: true, price: 245, desc: "Paneer fingers cooked with grated green spinach and bitter aromatic fresh fenugreek leaves.", sub: "Paneer", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400" },
    { name: "Special Lasooni Yellow Dal Tadka", isVeg: true, price: 150, desc: "Comforting split Pigeon Pea lentil dish frothed with ghee, crispy dry red chilli and heaps of garlic.", sub: "Dal", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400" },
    { name: "Creamy Malai Kofta Curry elite", isVeg: true, price: 250, desc: "Soft cottage cheese dumplings cooked in smooth sweet cream based white nut-seed reduction.", sub: "Rich Veg", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" }
  ],
  "Healthy Foods": [
    { name: "Quinoa Grain Grilled paneer Bowl", isVeg: true, price: 195, desc: "Boiled high protein quinoa topped with avocado dressing, steam broccoli and oil-free paneer cubes.", sub: "Salads/Bowls", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" },
    { name: "Keto Grilled Chicken Breast Caesar", isVeg: false, price: 240, desc: "Thick grilled chicken breasts, crisp romaine letuce, olives and light greek yogurt dressings.", sub: "Salads/Bowls", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" },
    { name: "Low Carb Baked Falafel Hummus Platter", isVeg: true, price: 175, desc: "Baked healthy oil-free chickpeas falafel served with hand ground olive oil hummus and carrots.", sub: "Platters", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" },
    { name: "Steam Broccoli Mushroom Tofu Saut\xE9", isVeg: true, price: 160, desc: "Wok tossed fresh broccoli stalks, button mushroom chunks and tofu in extremely light soy spray.", sub: "Stir Fry", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" },
    { name: "Superfruits Chia seed coconut Pudding", isVeg: true, price: 130, desc: "Hydrated chia seeds in chilled light coconut milk layered with fresh kiwi and strawberry toppings.", sub: "Dessert Jar", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" },
    { name: "High Protein Sprouts and Peanut salad", isVeg: true, price: 95, desc: "Sprouted green moong pulses tossed with roasted skinless peanuts, diced onion and lemon juice.", sub: "Salads/Bowls", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" },
    { name: "Fat Free Mediterranean Chickpea salad", isVeg: true, price: 120, desc: "Boiled large Garbanzo beans mixed with cherry tomatoes, basil, lime dressing, feta pinch.", sub: "Salads/Bowls", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" },
    { name: "Boiled organic White Egg Salad Bowl", isVeg: false, price: 110, desc: "Six egg white portions chopped with spring onions, green leafy lettuce, dynamic vinaigrette sprays.", sub: "Salads/Bowls", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" }
  ],
  "Combo Meals": [
    { name: "De luxe Nuvvo Veg Thali Combo", isVeg: true, price: 260, desc: "Complete feast - Paneer Butter curry, Yellow Dal, dry Aloo, Jeera rice, 2 Butter Rotis, Curd, Sweet.", sub: "Thalis", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" },
    { name: "Butter Chicken & Naan Mini Combo", isVeg: false, price: 210, desc: "Single serve portions of creamy Butter Chicken served warm with choice of 2 Garlic Butter Naans.", sub: "Mini Meals", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" },
    { name: "Royal Fried Rice & Chilli Paneer pack", isVeg: true, price: 190, desc: "Classic Schezwan fried rice served together with a medium bowl of hot saucy chilli paneer cubes.", sub: "Chinese Combo", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400" },
    { name: "Executive Chicken Thali of the Day", isVeg: false, price: 295, desc: "Rich chicken curry, dal fry, dry mix veg, Basmati pulao rice, 2 soft ghee chapatis, salad, sweets.", sub: "Thalis", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" },
    { name: "Tandoori Kabab, Roti and Chutney Meal", isVeg: false, price: 230, desc: "3 elements of soft Chicken Tikka, 2 pieces of tandoori roti served with fresh lemon and mint curd.", sub: "Mini Meals", img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" },
    { name: "South India Sambar Rice & Vada pack", isVeg: true, price: 140, desc: "Hot aromatic Sambar Rice frothed with ghee, served with 2 crispy golden brown urad dal vadas.", sub: "Mini Meals", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400" },
    { name: "Premium Biryani & Cold Pepsi Combo", isVeg: false, price: 250, desc: "Hyderabadi Chicken Biryani single portion served with a chilled 250ml canned soda, raita, gravy.", sub: "Mini Meals", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400" },
    { name: "Kids Special Mini Burger and Fries Box", isVeg: true, price: 160, desc: "Fun size soft potato cheese burger paired with lightweight salted french fries, mango fruity.", sub: "Kids Special", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" }
  ],
  "Kids Specials": [
    { name: "Mini Golden SMILEYS Basket", isVeg: true, price: 90, desc: "Eight fun-face crispy potato smileys roasted golden, served with sweet tomato sauce dips.", sub: "Finger Foods", img: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=400" },
    { name: "Cute Cheesy Paneer Slider Burgers", isVeg: true, price: 120, desc: "Two bite-sized tiny soft buns stacked with sweet paneer, mild cheese cream and tomato slice.", sub: "Sliders", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { name: "Premium Choco Chip pancake Tower", isVeg: true, price: 110, desc: "Three sweet baby wheat pancakes loaded with melted milk chocolate chips and sugar syrup.", sub: "Sweets", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" },
    { name: "Smash Potato Cheddar Cheese Balls", isVeg: true, price: 105, desc: "Loaded mashed potato rounds stuffed with melting cheddar core, cracker crumbs fried.", sub: "Finger Foods", img: "https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?auto=format&fit=crop&q=80&w=400" },
    { name: "Happy Mac & Cheese Mini Bowl", isVeg: true, price: 130, desc: "Super mild pasta shells baked inside a sweet white cream cheese sauce. Zero spices.", sub: "Mini Cups", img: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&q=80&w=400" },
    { name: "Sweet Chocolate Milkshake with Oreos", isVeg: true, price: 95, desc: "Kid size delightful chocolate shake blended with chocolate chips, frothed beautifully.", sub: "Drinks", img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400" },
    { name: "Chicken Dino Nuggets Golden Box", isVeg: false, price: 135, desc: "Six dinosaur-shaped mild crispy chicken breast cutlets, fried perfectly with honey dip.", sub: "Finger Foods", img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400" },
    { name: "Cute Fruit Jelly Custard Jar", isVeg: true, price: 85, desc: "Cool sweet vanilla milk custard cream layered with raspberry jelly cubes and sweet raisins.", sub: "Sweets", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" }
  ]
};
var FOOD_CATALOG = [];
var MOCK_REVIEWS_TEMPLATES = [
  { name: "Rahul Sharma", comment: "Taste is absolutely incredible. Spiced just right, packing is perfect!", rating: 5 },
  { name: "Priya Patel", comment: "Super hot delivery! Nuvvo has become my default brand. Highly recommended.", rating: 5 },
  { name: "Anish Reddy", comment: "Loved it. Genuine traditional ingredients. Will order again.", rating: 4 },
  { name: "Kushal Gowda", comment: "A bit spicy, but the packaging and raw quality was supreme!", rating: 4 },
  { name: "Meera Sen", comment: "Really fresh and clean, not greasy at all. Fits my macros.", rating: 5 }
];
var globalItemIndex = 1;
CATEGORIES.forEach((cat) => {
  const sourceArr = CATEGORY_ITEMS_SOURCE[cat] || [];
  sourceArr.forEach((item, idx) => {
    const reviews = MOCK_REVIEWS_TEMPLATES.map((tpl, tIdx) => ({
      id: `rev_${globalItemIndex}_${tIdx}`,
      user: tpl.name,
      rating: Math.min(5, Math.max(1, tpl.rating + (idx % 2 === 0 ? 0 : -1))),
      comment: tpl.comment,
      date: "2026-06-12"
    }));
    let spice = "Medium";
    if (cat === "Biryani" || cat === "Chicken Specials" || cat === "Mutton Specials" || cat === "Seafood") {
      spice = idx % 2 === 0 ? "High" : "Medium";
    } else if (cat === "Ice Cream" || cat === "Desserts" || cat === "Juices" || cat === "Milkshakes" || cat === "Bakery") {
      spice = "None";
    }
    const customizations = [
      {
        title: "Choose Portion Size",
        required: true,
        options: [
          { name: "Regular Portion", price: 0 },
          { name: "Premium Jumbo Portion", price: Math.round(item.price * 0.4) }
        ]
      },
      {
        title: "Add-Ons & Extras",
        required: false,
        options: [
          { name: "Extra Cheese Slice / Topping", price: 50 },
          { name: "Aromatic Herbs Mix", price: 20 },
          { name: "Chilled Soda Can (150ml)", price: 35 }
        ]
      }
    ];
    FOOD_CATALOG.push({
      id: `food_${globalItemIndex}`,
      name: item.name,
      description: item.desc,
      vegIndicator: item.isVeg ? "veg" /* VEG */ : "non-veg" /* NON_VEG */,
      rating: parseFloat((4 + globalItemIndex % 10 * 0.1).toFixed(1)),
      reviewsCount: 15 + globalItemIndex * 4 % 180,
      prepTime: 15 + globalItemIndex * 3 % 25,
      price: item.price,
      discountPrice: Math.round(item.price * 0.85),
      // 15% flat discount
      image: item.img,
      category: cat,
      subcategory: item.sub,
      ingredients: ["Fresh Native Produce", "Natural Unrefined Oils", "Chef Secret Spices", "Himalayan Organic Salt"],
      spiceLevel: spice,
      customizations,
      isBestSeller: idx < 2,
      isTrending: idx >= 2 && idx < 4,
      reviews
    });
    globalItemIndex++;
  });
});

// server.ts
import_dotenv.default.config();
async function callGeminiWithFallback(ai, params) {
  const { config, contents } = params;
  try {
    return await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config
    });
  } catch (err) {
    const isServiceError = String(err?.message || err).includes("503") || String(err?.message || err).includes("UNAVAILABLE") || String(err?.message || err).includes("limit") || String(err?.message || err).includes("429");
    if (isServiceError) {
      console.log("Notice: Primary model temporarily busy, transitioning to secondary backup model.");
    }
  }
  try {
    return await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
      config
    });
  } catch (err2) {
    throw err2;
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/recommendations", async (req, res) => {
    const { orders, catalog } = req.body;
    try {
      if (!catalog || !Array.isArray(catalog) || catalog.length === 0) {
        return res.status(400).json({ error: "Catalog is required" });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("Notice: GEMINI_API_KEY is not defined. Returning a signature/trending fallback item.");
        if (catalog && Array.isArray(catalog) && catalog.length > 0) {
          const fallbackItem = catalog.find((f) => f.isBestSeller || f.rating >= 4.5) || catalog[0];
          return res.json({
            foodId: fallbackItem.id,
            reason: "\u2B50 Chef's Premium Selection: Award-winning recipe!",
            isFallback: true
          });
        }
        return res.status(400).json({ error: "Catalog is empty" });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const ordersDesc = (orders || []).map((o, idx) => {
        const items = (o.items || []).map((i) => `${i.foodItem?.name || i.foodItemId} (qty: ${i.quantity})`).join(", ");
        return `Order #${idx + 1} Status: ${o.status || "completed"} - Items: ${items}`;
      }).join("\n");
      const catalogDesc = catalog.map((f) => {
        return `- ID: ${f.id}, Name: ${f.name}, Category: ${f.category}, Description: ${f.description}, Price: \u20B9${f.price}, Veg/NonVeg: ${f.vegIndicator || "Unknown"}`;
      }).join("\n");
      const prompt = `You are a world-class culinary AI sommelier and personal diet analyst.
Recommend ONE exactly matching food item from our restaurant catalog that is most suitable for this user based on their order history.

Here is the user's past order history:
${ordersDesc || "No past orders yet. The user is a first-time customer."}

Here is the catalog of currently available food items with their details:
${catalogDesc}

Requirements:
1. Under past order history, analyze the user's cuisine preferences (Veg vs Nonveg, heavy vs snacks, spices, categories like pizza, biryani, burgers, desserts).
2. Choose exactly ONE foodId from the provided catalog that matches their palette best. If they have no order history, recommend a highly popular signature dish.
3. Write a fun, delicious, motivating, highly personalized reasoning explaining why this dish is perfect for them (maximum 12 words, e.g., "Loved your spiced biryanis? Experience this chef's master curry now!"). Make it sound appetizing!

You MUST respond strictly with a valid JSON document matching this schema:
{
  "foodId": "the string ID matching the selected item from the catalog",
  "reason": "delicious personalized short reasoning under 12 words"
}`;
      const response = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              foodId: {
                type: import_genai.Type.STRING,
                description: "The unique ID of the recommended food item from the catalog"
              },
              reason: {
                type: import_genai.Type.STRING,
                description: "Personalized highly engaging reasoning under 12 words"
              }
            },
            required: ["foodId", "reason"]
          }
        }
      });
      const text = response.text?.trim() || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (err) {
      console.log("Notice: Serving signature/trending fallback item as recommended option.");
      try {
        if (catalog && Array.isArray(catalog) && catalog.length > 0) {
          const fallbackItem = catalog.find((f) => f.isBestSeller || f.rating >= 4.5) || catalog[0];
          return res.json({
            foodId: fallbackItem.id,
            reason: "\u2B50 Chef's Premium Selection: Award-winning recipe!",
            isFallback: true
          });
        }
      } catch (fallbackErr) {
      }
      res.status(500).json({ status: "unavailable" });
    }
  });
  app.get("/api/food-items", (req, res) => {
    const { tag } = req.query;
    if (!tag) {
      return res.json(FOOD_CATALOG);
    }
    const targetTag = String(tag).trim().toLowerCase();
    if (targetTag === "all") {
      return res.json(FOOD_CATALOG);
    }
    const filtered = FOOD_CATALOG.filter((item) => {
      const cat = item.category.toLowerCase();
      const sub = (item.subcategory || "").toLowerCase();
      const name = item.name.toLowerCase();
      const desc = item.description.toLowerCase();
      if (targetTag === "breakfast") {
        return cat.includes("tiffin") || cat.includes("south indian") || cat.includes("tea & coffee") || sub.includes("breakfast") || sub.includes("idli") || sub.includes("dosa") || sub.includes("upma") || name.includes("breakfast") || name.includes("idli") || name.includes("dosa");
      }
      if (targetTag === "dinner") {
        return cat.includes("biryani") || cat.includes("north indian") || cat.includes("chinese") || cat.includes("chicken") || cat.includes("mutton") || cat.includes("seafood") || cat.includes("combo") || cat.includes("dinner") || sub.includes("dinner") || sub.includes("curry") || sub.includes("mandi") || sub.includes("gravy") || name.includes("dinner") || name.includes("thali") || name.includes("biryani");
      }
      if (targetTag === "snacks") {
        return cat.includes("fast food") || cat.includes("pizza") || cat.includes("burger") || cat.includes("sandwich") || cat.includes("rolls") || cat.includes("shawarma") || cat.includes("bakery") || cat.includes("kids") || cat.includes("snack") || cat.includes("dessert") || cat.includes("ice cream") || cat.includes("milkshake") || sub.includes("snack") || sub.includes("fries") || sub.includes("nuggets") || sub.includes("bite") || name.includes("snack") || name.includes("fries") || name.includes("burger") || name.includes("pizza");
      }
      if (targetTag === "healthy") {
        return cat.includes("healthy") || cat.includes("juice") || desc.includes("healthy") || desc.includes("protein") || desc.includes("salad") || desc.includes("fresh") || desc.includes("fiber") || desc.includes("vitamins") || desc.includes("keto") || desc.includes("diet") || name.includes("healthy") || name.includes("salad") || name.includes("oats") || name.includes("sprouts");
      }
      return false;
    });
    res.json(filtered);
  });
  app.post("/api/food-story", async (req, res) => {
    const { foodItem } = req.body;
    if (!foodItem || !foodItem.name) {
      return res.status(400).json({ error: "Food item is required" });
    }
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("Notice: GEMINI_API_KEY is not defined. Returning custom fallback gourmet stories.");
        return res.json({
          story: `The legendary ${foodItem.name} is a masterpiece of modern gastromony. Born from our chef's relentless exploration of rich regional flavor profiles, every bite is crafted to deliver a complex, harmonious taste sensation that sings on your palate.`,
          visualPrep: `\u2022 Premium farm-fresh ${foodItem.ingredients ? foodItem.ingredients.slice(0, 3).join(", ") : "organic elements"} are hand-selected at sunrise.
\u2022 Infused gently with cold-pressed artisan oils and authentic spices.
\u2022 Slow-simmered at exact temperatures to lock in deep, natural umami and perfect tenderness.`
        });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const prompt = `You are an elite Michelin-star food writer, culinary visual artist, and storytelling sommelier.
Create a mesmerizing "AI Food Story" and a detailed "Visual Preparation Guide" for this gourmet item:

Name: ${foodItem.name}
Category: ${foodItem.category || "Specialty"}
Description: ${foodItem.description || ""}
Ingredients: ${foodItem.ingredients ? foodItem.ingredients.join(", ") : "Selected secret spices"}

Requirements:
1. **story**: A compelling, artistic, and highly appetizing 2-3 sentence narrative about this dish. Capture its sensory soul, flavor profiles, and culinary inspiration. Avoid generic phrases, make it sound like a premium editorial review!
2. **visualPrep**: A vivid, sensory, step-by-step description of how these exact ingredients are prepared with passion in our high-end kitchen. Use rich cooking actions (e.g., "slow-roasted over cherrywood fire", "glazed with cold-pressed mustard oil", "delicately hand-whipped"). Maximum 3 short, snappy bullet points.

You MUST respond strictly with a valid JSON document matching this schema:
{
  "story": "your sensory/artistic food story text",
  "visualPrep": "step 1 bullet...\\nstep 2 bullet...\\nstep 3 bullet..."
}`;
      const response = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              story: {
                type: import_genai.Type.STRING,
                description: "A sensory, high-end 2-3 sentence culinary narrative about the dish's flavor and soul."
              },
              visualPrep: {
                type: import_genai.Type.STRING,
                description: "Vivid, step-by-step description of preparation with up to 3 short bullet points separated by newlines."
              }
            },
            required: ["story", "visualPrep"]
          }
        }
      });
      const text = response.text?.trim() || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (err) {
      console.log("Notice: Utilizing premium storyteller fallback profile.");
      res.json({
        story: `Our signature ${foodItem.name} showcases the pinnacle of artisan baking and gourmet seasoning. Balanced perfectly with a modern flair, it celebrates pure, fresh ingredients crafted to create an unforgettable dining experience.`,
        visualPrep: `\u2022 Prepared fresh to order with hand-sourced organic ${foodItem.ingredients ? foodItem.ingredients[0] : "ingredients"}.
\u2022 Slowly infused with fine garden herbs and curated chef blends.
\u2022 Masterfully plated to order, preserving optimal textures, temperature, and taste profiles.`
      });
    }
  });
  app.post("/api/chatbot", async (req, res) => {
    const { message, history } = req.body;
    try {
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        const lower = message.toLowerCase();
        let reply = "Hi! I'm Nuvvo AI, your personal culinary concierge. I can guide you through our 90+ partner menus, track active orders in real-time, or explain how to start your own high-revenue franchise unit!";
        if (lower.includes("track") || lower.includes("order") || lower.includes("status")) {
          reply = "You can track your orders in real-time on our Live Tracking Screen! Our simulator displays dynamic GPS routing, rider telemetry updates, and estimated delivery times with high accuracy.";
        } else if (lower.includes("biryani") || lower.includes("spicy") || lower.includes("rice")) {
          reply = "Craving something rich? I highly recommend our Chef's Signature Dum Biryani! It is slow-cooked over a clay pot (dum process), perfectly spiced, and served with tangy salan and raita.";
        } else if (lower.includes("franchise") || lower.includes("partner") || lower.includes("business")) {
          reply = "Franchise opportunities with Nuvvo are highly lucrative! You can apply directly through our interactive Franchise screen with real-time ROI calculator, territory availability checks, and legal document uploads.";
        } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
          reply = "Hello there! Welcome to Nuvvo. What delicious food can I help you discover or track today?";
        } else if (lower.includes("pizza") || lower.includes("cheese")) {
          reply = "You must check out our Stone-Baked Pizzas under the Fast Food category! Loaded with fresh mozzarella and slow-simmered marinara sauce.";
        } else if (lower.includes("help") || lower.includes("support")) {
          reply = "I'm here for you! You can chat with me, track your delivery, or tap the WhatsApp button below to instantly connect with our 24/7 dedicated support desk.";
        }
        return res.json({ response: reply });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const formattedHistory = (history || []).slice(-10).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
      const systemContext = `You are "Nuvvo AI", the official culinary concierge chatbot of Nuvvo Food Delivery app.
Your character is highly polished, professional, warm, conversational, and energetic.
Keep answers concise, direct, helpful, and focused on the Nuvvo app ecosystem.
Encourage ordering delicious meals, trying biryanis, tracking active deliveries with our simulator, or exploring franchise/partner programs.
Avoid lengthy or dry paragraphs; prioritize brevity (3-4 sentences maximum).

Chat History:
${formattedHistory}

Current User Query: ${message}`;
      const response = await callGeminiWithFallback(ai, {
        contents: systemContext,
        config: {
          temperature: 0.7
        }
      });
      res.json({ response: response.text?.trim() || "I'm here to assist you with your culinary needs today!" });
    } catch (err) {
      console.warn("Notice: Chatbot API had a runtime error, utilizing fallback simulator:", err?.message || err);
      res.json({ response: "I'm here to help! Could you please try again? I can help recommend foods, track orders, or connect you to support." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
