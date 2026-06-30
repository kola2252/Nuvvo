/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum VegIndicator {
  VEG = 'veg',
  NON_VEG = 'non-veg',
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CustomizationOption {
  name: string;
  price: number;
}

export interface CustomizationCategory {
  title: string;
  required: boolean;
  options: CustomizationOption[];
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  vegIndicator: VegIndicator;
  rating: number;
  reviewsCount: number;
  prepTime: number; // in mins
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  subcategory: string;
  ingredients: string[];
  spiceLevel: 'None' | 'Medium' | 'High';
  customizations?: CustomizationCategory[];
  isBestSeller?: boolean;
  isTrending?: boolean;
  reviews: Review[];
  restaurantId?: string;
}

export interface RestaurantReview {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  foodRating: number;
  restaurantRating: number;
  deliveryRating: number;
  comment: string;
  date: string;
  hidden?: boolean; // Super Admin can hide/show
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  cuisines: string[];
  deliveryTime: number; // mins
  costForTwo: number;
  image: string;
  isPromoted?: boolean;
  offers?: string[];
  // Dynamic onboarding and filtering state
  isApproved?: boolean;
  isActive?: boolean; // Vendor activated/deactivated
  businessType?: 'Family' | 'Biryani & Mandi' | 'Fast Food' | 'Meals & Tiffins' | 'Desserts & Bakery' | 'Juices & Cafe' | 'Seafood' | 'Hotel & Resort';
  distance?: number; // km
  phone?: string; // onboarded phone (for verification/WhatsApp)
  
  // Working Hours & Schedule state
  openingTime?: string; // e.g. "09:00"
  closingTime?: string; // e.g. "23:00"
  weeklySchedule?: string[]; // e.g. ["Monday", "Tuesday", ...]
  holidaySchedule?: string[]; // holiday dates or description e.g. ["2026-12-25"]
  forceStatus?: 'auto' | 'force_open' | 'force_close' | 'temp_closed' | 'emergency_closed';
}

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  flatNo: string; // Used as House Number if entered manually
  area: string; // Used as Street/Locality if entered manually
  landmark?: string;
  city: string;
  gpsCoordinates?: { lat: number; lng: number };
  isDefault?: boolean;
  
  // Explicit manual address attributes requested
  isManual?: boolean;
  customerName?: string;
  mobileNumber?: string;
  houseNumber?: string;
  streetName?: string;
  locality?: string; // Area / Locality
  villageTown?: string;
  district?: string;
  state?: string;
  pincode?: string;
  deliveryNotes?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  addresses: Address[];
  currentAddressId?: string;
  favoriteFoods: string[]; // foodItem ids
  favoriteRestaurants: string[]; // restaurant ids
  role: 'Super Admin' | 'Admin' | 'Delivery Partner' | 'Franchise' | 'Customer';
  isProfileComplete: boolean;
  createdAt: string;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  selectedCustomizations: { [categoryTitle: string]: CustomizationOption };
}

export type OrderStatus = 'accepted' | 'preparing' | 'picked' | 'on_the_way' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerPhone: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  packagingFee: number;
  tax: number;
  tip: number;
  finalAmount: number;
  status: OrderStatus;
  address: Address;
  instructions?: string;
  couponUsed?: string;
  paymentMethod: 'PhonePe' | 'UPI' | 'COD';
  paymentStatus: 'pending' | 'success' | 'failed';
  phonePeNumber?: string;
  date: string;
  eta: number; // mins remaining / total duration
  trackingHistory: { status: OrderStatus; time: string }[];
  deliveryPartnerId?: string;
  scheduledTime?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  rating?: number;
  feedback?: string;
}

export interface PointsTransaction {
  id: string;
  orderId?: string;
  type: 'earn' | 'redeem' | 'welcome' | 'spin_bonus';
  amount: number;
  description: string;
  date: string;
}

export interface DeliveryPartnerDocs {
  licenseUrl: string;
  aadhaarUrl: string;
  vehicleDocsUrl: string;
  bankAccount: string;
  bankIfsc: string;
}

export interface RiderEarningRecord {
  id: string;
  orderId: string;
  restaurantName: string;
  customerArea: string;
  deliveryFee: number;
  bonus: {
    peakHour: number;
    festival: number;
    rain: number;
    weekend: number;
    referral: number;
  };
  tip: number;
  totalEarned: number;
  date: string; // ISO format string
}

export interface RiderPayout {
  id: string;
  riderId: string;
  riderName: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Paid';
  requestDate: string;
  payoutDate?: string;
  bankAccount: string;
  bankIfsc: string;
  referenceId?: string;
}

export interface DeliveryPartnerProfile {
  id: string;
  name: string;
  phone: string;
  whatsAppPhone?: string;
  address?: string;
  vehicleType?: 'Bike' | 'Scooter' | 'Cycle' | 'Auto' | 'Other';
  bikeNumber?: string;
  aadhaar?: string;
  drivingLicense?: string;
  avatar?: string;
  isApproved: boolean;
  isAvailable: boolean;
  status?: 'Available' | 'Delivering Order' | 'Busy' | 'Offline' | 'Suspended' | 'Registration Pending' | 'Rejected';
  rating?: number;
  completedOrdersCount?: number;
  currentLocation?: { lat: number; lng: number; addressLabel?: string };
  walletBalance: number;
  documents?: DeliveryPartnerDocs;
  earnings: { orderId: string; amount: number; date: string }[];
  earningRecords?: RiderEarningRecord[];
  payouts?: RiderPayout[];
}

export interface FranchiseApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsAppPhone: string;
  currentOccupation: string;
  businessExperience: string;
  city: string;
  district: string;
  state: string;
  preferredFranchiseType: string;
  investmentRange: string;
  existingBusinessDetails: string;
  officeAddress: string;
  numberOfEmployees: string;
  expectedLaunchTimeline: string;
  whyJoinNuvvo: string;
  aadhaarCardImage: string; // Base64 or placeholder URL
  panCardImage: string;     // Base64 or placeholder URL
  businessDocImage?: string;  // Base64 or placeholder URL
  status: 'Submitted' | 'Under Review' | 'Verification Pending' | 'Approved' | 'Rejected' | 'Agreement Pending' | 'Active Franchise';
  date: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userPhone: string;
  userRole: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  value: number;
  minOrder: number;
  description: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
  orderId: string;
  status: OrderStatus;
  imageUrl?: string;
  isPromo?: boolean;
  targetAudience?: 'all' | 'customers' | 'riders' | 'restaurants' | 'admin';
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  targetAudience: 'all' | 'customers' | 'riders' | 'restaurants';
  scheduledAt: string; // Format: "YYYY-MM-DDTHH:MM"
  imageUrl?: string;
  status: 'pending' | 'sent';
}

export interface SavedCard {
  id: string;
  cardHolder: string;
  cardNumber: string; // obfuscated last 4 visible
  expiryDate: string; // MM/YY
  cardBrand: 'Visa' | 'Mastercard' | 'RuPay' | 'Amex' | 'Other';
}

export interface SavedUPI {
  id: string;
  name: string;
  upiId: string;
  provider: 'GPAY' | 'PHONEPE' | 'PAYTM' | 'BHIM' | 'OTHER';
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  image: string; // url
  color?: string; // CSS bg-gradient class or background color
  actionType: 'restaurant' | 'category' | 'offer' | 'coupon' | 'franchise' | 'external' | 'custom';
  actionValue: string; // e.g., restaurant ID or category name
  enabled: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  
  // Specific coupon details
  couponCode?: string;
  discount?: string;
  expiryDate?: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  recipientType: 'rider' | 'restaurant_owner';
  recipientName: string;
  subject: string;
  bodyHtml: string;
  timestamp: string;
  payoutId: string;
  amount: number;
}

export interface MerchantPayout {
  id: string;
  restaurantId: string;
  restaurantName: string;
  amount: number;
  status: 'Pending' | 'Paid';
  requestDate: string; // ISO String
  payoutDate?: string; // ISO String
  bankAccount: string;
  bankIfsc: string;
}

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  primaryColor: string; // Tailwind class like "orange-500", "emerald-600"
  hex: string;          // Hex code representation
  bgGradient: string;   // gradient from-to
  accentColor: string;  // e.g., "orange", "emerald"
  badgeBg: string;      // e.g. "bg-orange-500" or similar
  textClass: string;    // e.g., "text-orange-500"
  bgClass: string;      // e.g., "bg-orange-500"
  hoverBgClass: string; // e.g., "hover:bg-orange-600"
  lightBgClass: string; // e.g., "bg-orange-50 dark:bg-orange-950/20"
  borderClass: string;  // e.g., "border-orange-500"
  ringClass: string;    // e.g., "focus:ring-orange-500"
}

export interface AdminPermissions {
  canDeleteRestaurants: boolean;
  canProcessRefunds: boolean;
  canEditFoodItems: boolean;
  canManageCoupons: boolean;
  canBroadcastCampaigns: boolean;
  canApproveFranchise: boolean;
  canOnboardRiders: boolean;
}

export interface DesignatedAdmin {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  avatar: string;
  permissions: AdminPermissions;
  joinedAt: string;
}






