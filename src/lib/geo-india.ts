export interface DistrictCoord {
  name: string;
  name_hi: string;
  name_bn: string;
  lat: number;
  lon: number;
}

export interface StateInfo {
  name: string;
  name_hi: string;
  name_bn: string;
  districts: DistrictCoord[];
}

export const INDIAN_STATES: StateInfo[] = [
  {
    name: 'Maharashtra',
    name_hi: 'महाराष्ट्र',
    name_bn: 'মহারাষ্ট্র',
    districts: [
      { name: 'Nashik', name_hi: 'नासिक', name_bn: 'নাসিক', lat: 19.9975, lon: 73.7898 },
      { name: 'Pune', name_hi: 'पुणे', name_bn: 'পুনে', lat: 18.5204, lon: 73.8567 },
      { name: 'Nagpur', name_hi: 'नागपुर', name_bn: 'নাগপুর', lat: 21.1458, lon: 79.0882 },
      { name: 'Kolhapur', name_hi: 'कोल्हापुर', name_bn: 'কোলহাপুর', lat: 16.705, lon: 74.2433 },
      { name: 'Solapur', name_hi: 'सोलापुर', name_bn: 'সোলাপুর', lat: 17.6599, lon: 75.9064 },
    ],
  },
  {
    name: 'Punjab',
    name_hi: 'पंजाब',
    name_bn: 'পাঞ্জাব',
    districts: [
      { name: 'Ludhiana', name_hi: 'लुधियाना', name_bn: 'লুধিয়ানা', lat: 30.901, lon: 75.8573 },
      { name: 'Amritsar', name_hi: 'अमृतसर', name_bn: 'অমৃতসর', lat: 31.634, lon: 74.8723 },
      { name: 'Bathinda', name_hi: 'बठिंडा', name_bn: 'ভাটিণ্ডা', lat: 30.211, lon: 74.9455 },
      { name: 'Jalandhar', name_hi: 'जालंधर', name_bn: 'জলন্ধর', lat: 31.326, lon: 75.5762 },
      { name: 'Patiala', name_hi: 'पटियाला', name_bn: 'পাতিয়ালা', lat: 30.3398, lon: 76.3869 },
    ],
  },
  {
    name: 'West Bengal',
    name_hi: 'पश्चिम बंगाल',
    name_bn: 'পশ্চিমবঙ্গ',
    districts: [
      { name: 'Hooghly', name_hi: 'हुगली', name_bn: 'হুগলি', lat: 22.9028, lon: 88.3956 },
      { name: 'Burdwan', name_hi: 'बर्धमान', name_bn: 'বর্ধমান', lat: 23.2324, lon: 87.8615 },
      { name: 'Nadia', name_hi: 'नादिया', name_bn: 'নদিয়া', lat: 23.471, lon: 88.5565 },
      { name: 'Murshidabad', name_hi: 'मुर्शिदाबाद', name_bn: 'মুর্শিদাবাদ', lat: 24.1837, lon: 88.2713 },
      { name: 'Bankura', name_hi: 'बांकुड़ा', name_bn: 'বাঁকুড়া', lat: 23.2324, lon: 87.0715 },
    ],
  },
  {
    name: 'Uttar Pradesh',
    name_hi: 'उत्तर प्रदेश',
    name_bn: 'উত্তরপ্রদেশ',
    districts: [
      { name: 'Varanasi', name_hi: 'वाराणसी', name_bn: 'বারাণসী', lat: 25.3176, lon: 82.9739 },
      { name: 'Lucknow', name_hi: 'लखनऊ', name_bn: 'লখনউ', lat: 26.8467, lon: 80.9462 },
      { name: 'Agra', name_hi: 'आगरा', name_bn: 'আগ্রা', lat: 27.1767, lon: 78.0081 },
      { name: 'Kanpur', name_hi: 'कानपुर', name_bn: 'কানপুর', lat: 26.4499, lon: 80.3319 },
      { name: 'Gorakhpur', name_hi: 'गोरखपुर', name_bn: 'গোরখপুর', lat: 26.7606, lon: 83.3732 },
    ],
  },
  {
    name: 'Madhya Pradesh',
    name_hi: 'मध्य प्रदेश',
    name_bn: 'মধ্যপ্রদেশ',
    districts: [
      { name: 'Indore', name_hi: 'इंदौर', name_bn: 'ইন্দোর', lat: 22.7196, lon: 75.8577 },
      { name: 'Bhopal', name_hi: 'भोपाल', name_bn: 'ভোপাল', lat: 23.2599, lon: 77.4126 },
      { name: 'Ujjain', name_hi: 'उज्जैन', name_bn: 'উজ্জয়িনী', lat: 23.1765, lon: 75.7885 },
      { name: 'Jabalpur', name_hi: 'जबलपुर', name_bn: 'জবলপুর', lat: 23.1815, lon: 79.9864 },
    ],
  },
  {
    name: 'Karnataka',
    name_hi: 'कर्नाटक',
    name_bn: 'কর্ণাটক',
    districts: [
      { name: 'Belagavi', name_hi: 'बेलगावी', name_bn: 'বেলাগাভি', lat: 15.8497, lon: 74.4977 },
      { name: 'Mysuru', name_hi: 'मैसूरु', name_bn: 'মহীশূর', lat: 12.2958, lon: 76.6394 },
      { name: 'Dharwad', name_hi: 'धारवाड़', name_bn: 'ধারওয়াদ', lat: 15.4589, lon: 75.0078 },
      { name: 'Shimoga', name_hi: 'शिमोगा', name_bn: 'শিমোগা', lat: 13.9299, lon: 75.5681 },
    ],
  },
  {
    name: 'Gujarat',
    name_hi: 'गुजरात',
    name_bn: 'গুজরাট',
    districts: [
      { name: 'Ahmedabad', name_hi: 'अहमदाबाद', name_bn: 'আহমেদাবাদ', lat: 23.0225, lon: 72.5714 },
      { name: 'Rajkot', name_hi: 'राजकोट', name_bn: 'রাজকোট', lat: 22.3039, lon: 70.8022 },
      { name: 'Anand', name_hi: 'आनंद', name_bn: 'আনন্দ', lat: 22.5645, lon: 72.9289 },
      { name: 'Surat', name_hi: 'सूरत', name_bn: 'সুরাট', lat: 21.1702, lon: 72.8311 },
    ],
  },
  {
    name: 'Rajasthan',
    name_hi: 'राजस्थान',
    name_bn: 'রাজস্থান',
    districts: [
      { name: 'Jaipur', name_hi: 'जयपुर', name_bn: 'জয়পুর', lat: 26.9124, lon: 75.7873 },
      { name: 'Jodhpur', name_hi: 'जोधपुर', name_bn: 'যোধপুর', lat: 26.2389, lon: 73.0243 },
      { name: 'Kota', name_hi: 'कोटा', name_bn: 'কোটা', lat: 25.2138, lon: 75.8648 },
      { name: 'Ganganagar', name_hi: 'गंगानगर', name_bn: 'গঙ্গানগর', lat: 29.9038, lon: 73.8772 },
    ],
  },
  {
    name: 'Bihar',
    name_hi: 'बिहार',
    name_bn: 'বিহার',
    districts: [
      { name: 'Patna', name_hi: 'पटना', name_bn: 'পাটনা', lat: 25.5941, lon: 85.1376 },
      { name: 'Muzaffarpur', name_hi: 'मुजफ्फरपुर', name_bn: 'মুজাফফরপুর', lat: 26.1209, lon: 85.3647 },
      { name: 'Gaya', name_hi: 'गया', name_bn: 'গয়া', lat: 24.7914, lon: 85.0002 },
      { name: 'Bhagalpur', name_hi: 'भागलपुर', name_bn: 'ভাগলপুর', lat: 25.2425, lon: 86.9842 },
    ],
  },
  {
    name: 'Tamil Nadu',
    name_hi: 'तमिलनाडु',
    name_bn: 'তামিলনাড়ু',
    districts: [
      { name: 'Coimbatore', name_hi: 'कोयम्बटूर', name_bn: 'কোয়েম্বাটুর', lat: 11.0168, lon: 76.9558 },
      { name: 'Thanjavur', name_hi: 'तंजावुर', name_bn: 'তাঞ্জাভুর', lat: 10.787, lon: 79.1378 },
      { name: 'Madurai', name_hi: 'मदुरै', name_bn: 'মাদুরাই', lat: 9.9252, lon: 78.1198 },
      { name: 'Salem', name_hi: 'सलेम', name_bn: 'সালেম', lat: 11.6643, lon: 78.146 },
    ],
  },
];

export interface CropInfo {
  id: string;
  name_en: string;
  name_hi: string;
  name_bn: string;
}

export const CROPS_LIST: CropInfo[] = [
  { id: 'tomato', name_en: 'Tomato', name_hi: 'टमाटर', name_bn: 'টমেটো' },
  { id: 'potato', name_en: 'Potato', name_hi: 'आलू', name_bn: 'আলু' },
  { id: 'wheat', name_en: 'Wheat', name_hi: 'गेहूं', name_bn: 'গম' },
  { id: 'rice', name_en: 'Rice / Paddy', name_hi: 'धान (चावल)', name_bn: 'ধান' },
  { id: 'corn', name_en: 'Corn / Maize', name_hi: 'मक्का', name_bn: 'ভুট্টা' },
  { id: 'cotton', name_en: 'Cotton', name_hi: 'कपास', name_bn: 'তুলা' },
  { id: 'mustard', name_en: 'Mustard', name_hi: 'सरसों', name_bn: 'সর্ষে' },
  { id: 'onion', name_en: 'Onion', name_hi: 'प्याज़', name_bn: 'পেঁয়াজ' },
  { id: 'soybean', name_en: 'Soybean', name_hi: 'सोयाबीन', name_bn: 'সয়াবিন' },
  { id: 'sugarcane', name_en: 'Sugarcane', name_hi: 'गन्ना', name_bn: 'আখ' },
];

export function getDistrictCoordinates(stateName: string, districtName: string): { lat: number; lon: number } {
  const state = INDIAN_STATES.find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase() || s.name_hi === stateName || s.name_bn === stateName
  );
  if (!state) {
    // Default to central India coordinate if state not found
    return { lat: 20.5937, lon: 78.9629 };
  }

  const district = state.districts.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase() || d.name_hi === districtName || d.name_bn === districtName
  );

  if (!district) {
    return { lat: state.districts[0]?.lat || 20.5937, lon: state.districts[0]?.lon || 78.9629 };
  }

  return { lat: district.lat, lon: district.lon };
}
