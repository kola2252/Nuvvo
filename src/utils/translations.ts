/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppLanguage } from '../types';

export interface TranslationDictionary {
  welcome: string;
  secureGateway: string;
  enterMobile: string;
  mobilePlaceholder: string;
  getOtp: string;
  otpSentTo: string;
  enterOtp: string;
  autoDetecting: string;
  verifyOtp: string;
  resendOtp: string;
  resendIn: string;
  createProfile: string;
  profileSubtitle: string;
  fullName: string;
  fullNamePlaceholder: string;
  emailAddress: string;
  emailPlaceholder: string;
  selectLanguage: string;
  primaryDeliverySetup: string;
  flatNo: string;
  landmark: string;
  areaStreet: string;
  city: string;
  saveAndStart: string;
  chooseRole: string;
  customer: string;
  deliveryPartner: string;
  franchise: string;
  quickDemoFill: string;
  referralTitle: string;
  referralSubtitle: string;
  referralBalance: string;
  storeCredits: string;
  convertPoints: string;
  yourInviteCode: string;
  haveReferralCode: string;
  applyCode: string;
  copied: string;
  adminReferralControl: string;
  referrerReward: string;
  refereeReward: string;
  resetAllPoints: string;
  resetUserPoints: string;
  saveReferralRules: string;
  onlyAdminAccess: string;
  changeName: string;
  changeEmail: string;
  phone: string;
  deliveryAddress: string;
  saveProfileDetails: string;
}

export const translations: Record<AppLanguage, TranslationDictionary> = {
  en: {
    welcome: 'Welcome to NUVVO',
    secureGateway: 'SECURE GATEWAY ACCESS',
    enterMobile: 'Enter Mobile Number',
    mobilePlaceholder: '10-digit mobile number',
    getOtp: 'Get OTP Verification Code',
    otpSentTo: 'Verification code sent to',
    enterOtp: 'Enter 4-Digit Security OTP',
    autoDetecting: 'Auto-detecting SMS verification token...',
    verifyOtp: 'Verify OTP & Continue',
    resendOtp: 'Resend OTP Code',
    resendIn: 'Resend code in',
    createProfile: 'Create Customer Profile',
    profileSubtitle: 'Configure your profile details & default delivery location.',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. Ramesh Babu',
    emailAddress: 'Email Address',
    emailPlaceholder: 'e.g. ramesh@nuvvo.cloud',
    selectLanguage: 'Choose Preferred App Language',
    primaryDeliverySetup: 'Primary Delivery Location Setup',
    flatNo: 'Flat / Block / Door No.',
    landmark: 'Landmark (Optional)',
    areaStreet: 'Area / Street Address',
    city: 'City / Town',
    saveAndStart: 'Create Profile & Explore Food',
    chooseRole: 'Select Role to Test',
    customer: 'Customer',
    deliveryPartner: 'Delivery Partner',
    franchise: 'Franchise Partner',
    quickDemoFill: 'Quick Demo Logins',
    referralTitle: 'Referral Rewards Program',
    referralSubtitle: 'Invite friends and earn points',
    referralBalance: 'Referral Wallet Balance',
    storeCredits: 'Store Credits',
    convertPoints: 'Convert to Points',
    yourInviteCode: 'Your Unique Invite Code',
    haveReferralCode: 'Have a Referral Code?',
    applyCode: 'Apply',
    copied: 'Copied!',
    adminReferralControl: 'Admin Referral Points Control Desk',
    referrerReward: 'Referrer Bonus Points',
    refereeReward: 'New User Sign-Up Bonus',
    resetAllPoints: 'Reset All Users Referral Points',
    resetUserPoints: 'Reset Customer Referral Points',
    saveReferralRules: 'Save Referral Points Rules',
    onlyAdminAccess: 'Only Super Admin / Admin has authority to change or reset referral points.',
    changeName: 'Change Name',
    changeEmail: 'Change Email',
    phone: 'Phone',
    deliveryAddress: 'Delivery Address',
    saveProfileDetails: 'Save Details'
  },
  te: {
    welcome: 'నువ్వో (NUVVO) కి స్వాగతం',
    secureGateway: 'సురక్షిత లాగిన్ పోర్టల్',
    enterMobile: 'మీ మొబైల్ నంబర్ నమోదు చేయండి',
    mobilePlaceholder: '10 అంకెల మొబైల్ నంబర్',
    getOtp: 'OTP వెరిఫికేషన్ కోడ్ పొందండి',
    otpSentTo: 'వెరిఫికేషన్ కోడ్ పంపబడింది:',
    enterOtp: '4-అంకెల OTP కోడ్ నమోదు చేయండి',
    autoDetecting: 'SMS ద్వారా OTP ఆటో-డిటెక్ట్ అవుతోంది...',
    verifyOtp: 'OTP ధృవీకరించి కొనసాగండి',
    resendOtp: 'మరలా OTP పంపండి',
    resendIn: 'మరలా పంపడానికి సమయం:',
    createProfile: 'కస్టమర్ ప్రొఫైల్ వివరాలు',
    profileSubtitle: 'మీ పేరు, ఈమెయిల్ మరియు డెలివరీ అడ్రస్ నమోదు చేయండి.',
    fullName: 'కస్టమర్ పూర్తి పేరు',
    fullNamePlaceholder: 'ఉదా: రమేష్ బాబు',
    emailAddress: 'ఈమెయిల్ అడ్రస్',
    emailPlaceholder: 'ఉదా: ramesh@nuvvo.cloud',
    selectLanguage: 'యాప్ భాషను ఎంచుకోండి (Language)',
    primaryDeliverySetup: 'ప్రధాన డెలివరీ అడ్రస్ వివరాలు',
    flatNo: 'ఫ్లాట్ / డోర్ నంబర్',
    landmark: 'గుర్తు (Landmark - ఐచ్ఛికం)',
    areaStreet: 'ప్రాంతం / వీధి పేరు (Area / Street)',
    city: 'నగరం / పట్టణం (City)',
    saveAndStart: 'ప్రొఫైల్ సేవ్ చేసి ప్రారంభించండి',
    chooseRole: 'లాగిన్ రోల్ ఎంచుకోండి',
    customer: 'కస్టమర్ (Customer)',
    deliveryPartner: 'డెలివరీ బాయ్ (Partner)',
    franchise: 'ఫ్రాంచైజ్ (Franchise)',
    quickDemoFill: 'డెమో లాగిన్స్',
    referralTitle: 'రెఫరల్ రివార్డ్స్ ప్రోగ్రామ్',
    referralSubtitle: 'స్నేహితులను ఆహ్వానించి పాయింట్స్ సంపాదించండి',
    referralBalance: 'రెఫరల్ వాలెట్ బ్యాలెన్స్',
    storeCredits: 'స్టోర్ క్రెడిట్స్',
    convertPoints: 'పాయింట్స్‌గా మార్చండి',
    yourInviteCode: 'మీ ప్రత్యేక ఇన్వైట్ కోడ్',
    haveReferralCode: 'రెఫరల్ కోడ్ ఉందా?',
    applyCode: 'వర్తింపజేయండి (Apply)',
    copied: 'కాపీ చేయబడింది!',
    adminReferralControl: 'అడ్మిన్ రెఫరల్ పాయింట్స్ కంట్రోల్ డెస్క్',
    referrerReward: 'రెఫరల్ బోనస్ పాయింట్లు',
    refereeReward: 'కొత్త యూజర్ బోనస్ పాయింట్లు',
    resetAllPoints: 'అందరి రెఫరల్ పాయింట్లు రీసెట్ చేయండి',
    resetUserPoints: 'కస్టమర్ పాయింట్లు రీసెట్ చేయండి',
    saveReferralRules: 'పాయింట్స్ రూల్స్ సేవ్ చేయండి',
    onlyAdminAccess: 'రెఫరల్ పాయింట్లు మార్చడానికి లేదా రీసెట్ చేయడానికి అడ్మిన్‌కి మాత్రమే అధికారం ఉంది.',
    changeName: 'పేరు మార్చండి',
    changeEmail: 'ఈమెయిల్ మార్చండి',
    phone: 'ఫోన్ నంబర్',
    deliveryAddress: 'డెలివరీ అడ్రస్',
    saveProfileDetails: 'వివరాలు సేవ్ చేయండి'
  },
  hi: {
    welcome: 'नुव्वो (NUVVO) में आपका स्वागत है',
    secureGateway: 'सुरक्षित प्रवेश पोर्टल',
    enterMobile: 'अपना मोबाइल नंबर दर्ज करें',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर',
    getOtp: 'OTP सत्यापन कोड प्राप्त करें',
    otpSentTo: 'सत्यापन कोड भेजा गया:',
    enterOtp: '4-अंकीय OTP कोड दर्ज करें',
    autoDetecting: 'SMS द्वारा OTP अपने आप खोजा जा रहा है...',
    verifyOtp: 'सत्यापित करें और आगे बढ़ें',
    resendOtp: 'OTP पुनः भेजें',
    resendIn: 'पुनः भेजने का समय:',
    createProfile: 'ग्राहक प्रोफ़ाइल बनाएं',
    profileSubtitle: 'अपनी प्रोफ़ाइल और डिलीवरी पता विवरण भरें।',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'उदा. रमेश बाबू',
    emailAddress: 'ईमेल पता',
    emailPlaceholder: 'उदा. ramesh@nuvvo.cloud',
    selectLanguage: 'पसंदीदा भाषा चुनें (Language)',
    primaryDeliverySetup: 'मुख्य डिलीवरी पता सेटअप',
    flatNo: 'फ़्लैट / मकान संख्या',
    landmark: 'लैंडमार्क (वैकल्पिक)',
    areaStreet: 'क्षेत्र / गली का नाम',
    city: 'शहर / कस्बा',
    saveAndStart: 'प्रोफ़ाइल सहेजें और शुरू करें',
    chooseRole: 'लॉगिन भूमिका चुनें',
    customer: 'ग्राहक (Customer)',
    deliveryPartner: 'डिलीवरी पार्टनर (Rider)',
    franchise: 'फ्रेंचाइजी पार्टनर',
    quickDemoFill: 'त्वरित डेमो लॉगिन',
    referralTitle: 'रेफरल पुरस्कार कार्यक्रम',
    referralSubtitle: 'दोस्तों को आमंत्रित करें और अंक अर्जित करें',
    referralBalance: 'रेफरल वॉलेट बैलेंस',
    storeCredits: 'स्टोर क्रेडिट्स',
    convertPoints: 'अंकों में बदलें',
    yourInviteCode: 'आपका अनूठा आमंत्रण कोड',
    haveReferralCode: 'क्या आपके पास रेफरल कोड है?',
    applyCode: 'लागू करें',
    copied: 'कॉपी हो गया!',
    adminReferralControl: 'व्यवस्थापक रेफरल नियंत्रण डेस्क',
    referrerReward: 'रेफरर बोनस अंक',
    refereeReward: 'नए उपयोगकर्ता साइन-अप अंक',
    resetAllPoints: 'सभी उपयोगकर्ताओं के रेफरल अंक रीसेट करें',
    resetUserPoints: 'ग्राहक रेफरल अंक रीसेट करें',
    saveReferralRules: 'रेफरल नियम सहेजें',
    onlyAdminAccess: 'रेफरल अंकों को बदलने या रीसेट करने का अधिकार केवल एडमिन के पास है।',
    changeName: 'नाम बदलें',
    changeEmail: 'ईमेल बदलें',
    phone: 'फ़ोन नंबर',
    deliveryAddress: 'डिलीवरी पता',
    saveProfileDetails: 'विवरण सहेजें'
  }
};
