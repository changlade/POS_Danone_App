import { POSData } from '../types/POSData';

export const PRODUCT_FAMILIES = [
  'Yogurt & Desserts',
  'Baby Nutrition',
  'Medical Nutrition',
  'Waters',
  'Plant-Based',
  'Dairy Alternatives'
];

export const BUSINESS_TYPES = [
  'Supermarket',
  'Hypermarket',
  'Convenience Store',
  'Pharmacy',
  'Baby Store',
  'Health Food Store',
  'Online Retailer'
];

export const generateSamplePOSData = (): POSData[] => {
  const sampleLocations = [
    { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
    { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
    { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
    { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
    { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
    { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
    { city: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517 },
    { city: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738 },
    { city: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417 },
    { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686 },
    { city: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683 },
    { city: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522 },
    { city: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122 },
    { city: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378 },
    { city: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402 },
    { city: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393 },
    { city: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275 },
    { city: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384 },
    { city: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603 },
    { city: 'Lyon', country: 'France', lat: 45.7640, lng: 4.8357 },
    { city: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698 },
    { city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
    { city: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.1900 },
    { city: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.5820 },
    { city: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937 }
  ];

  const posData: POSData[] = [];

  sampleLocations.forEach((location, index) => {
    // Generate 2-4 POS locations per city
    const numPOS = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numPOS; i++) {
      // Add some random offset to coordinates for variety
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      const businessType = BUSINESS_TYPES[Math.floor(Math.random() * BUSINESS_TYPES.length)];
      
      // Generate 1-3 product families per POS
      const numProductFamilies = Math.floor(Math.random() * 3) + 1;
      const shuffledFamilies = [...PRODUCT_FAMILIES].sort(() => 0.5 - Math.random());
      const productFamilies = shuffledFamilies.slice(0, numProductFamilies);
      
      // Generate sales volume based on business type
      let baseVolume = 50000;
      if (businessType === 'Hypermarket') baseVolume = 200000;
      else if (businessType === 'Supermarket') baseVolume = 100000;
      else if (businessType === 'Convenience Store') baseVolume = 30000;
      else if (businessType === 'Pharmacy') baseVolume = 25000;
      
      const salesVolume = Math.floor(baseVolume + (Math.random() * baseVolume * 0.8));
      
      posData.push({
        id: `pos_${index}_${i}`,
        name: `${businessType} ${location.city} ${i + 1}`,
        latitude: location.lat + latOffset,
        longitude: location.lng + lngOffset,
        businessType,
        productFamilies,
        salesVolume,
        city: location.city,
        country: location.country,
        address: `${Math.floor(Math.random() * 999) + 1} Main Street, ${location.city}`
      });
    }
  });

  return posData;
};
