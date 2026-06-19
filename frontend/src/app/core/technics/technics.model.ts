export type TechnicsCategory = 'VEHICLE' | 'PUMP' | 'PERSONAL_GEAR' | 'RESCUE_TOOL' | 'COMMUNICATION' | 'OTHER';
export type TechnicsStatus = 'ACTIVE' | 'RETIRED';

export const TECHNICS_CATEGORIES: TechnicsCategory[] = [
  'VEHICLE',
  'PUMP',
  'PERSONAL_GEAR',
  'RESCUE_TOOL',
  'COMMUNICATION',
  'OTHER',
];

export interface TechnicsPhoto {
  id: string;
  technicsId: string;
  mediaId: string;
  sortOrder: number;
  createdAt: string;
  media: {
    id: string;
    filename: string;
    originalUrl: string;
    thumbSmallUrl: string;
    thumbMediumUrl: string;
  };
}

export interface Technics {
  id: string;
  name: string;
  category: TechnicsCategory;
  manufacturer: string | null;
  yearAcquired: number | null;
  description: string | null;
  specs: Record<string, unknown> | null;
  status: TechnicsStatus;
  createdAt: string;
  updatedAt: string;
  photos: TechnicsPhoto[];
}

export interface TechnicsListResponse {
  items: Technics[];
  total: number;
  page: number;
  limit: number;
}
