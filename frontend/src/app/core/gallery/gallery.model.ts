export interface GalleryEvent {
  id: string;
  name: string;
  year: number;
  description: string | null;
  coverPhotoId: string | null;
  createdAt: string;
}

export interface MediaWithUrls {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  originalUrl: string;
  thumbSmallUrl: string;
  thumbMediumUrl: string;
}

export interface Photo {
  id: string;
  mediaId: string;
  eventId: string;
  title: string | null;
  sortOrder: number;
  createdAt: string;
  media: MediaWithUrls;
}

export interface PhotoListResponse {
  items: Photo[];
  total: number;
  page: number;
  limit: number;
}
