export type BusinessStatus = 'initial' | 'new' | 'updated';

export interface POSData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  businessType: string;
  productFamilies: string[];
  salesVolume: number;
  city: string;
  country: string;
  address: string;
  status?: BusinessStatus; // Track if business is initial, new, or updated
  submissionData?: {
    user_name?: string;
    photo_url?: string;
    points_earned?: number;
    submitted_at?: string;
    detected_products?: any[];
    is_danone_customer?: boolean;
    menu_items?: any[];
    total_menu_items?: number;
    last_updated?: string;
  };
}

export interface ScoutFilters {
  danoneScoutsOnly: boolean;
  productFamilies: string[];
  businessTypes: string[];
  salesVolumeRange: [number, number];
}
