export interface Recommendation {
  itemId: string;
  score: number;
  title?: string;
  description?: string;
}

export interface User {
  timestamp: number;
  eventType: string;
  contentId: string;
  personId: string;
  sessionId: string;
  userAgent: string;
  userRegion: string;
  userCountry: string;
}

export interface Item {
  timestamp: number;
  eventType: string;
  contentId: string;
  authorPersonId: string;
  authorSessionId: string;
  authorUserAgent: string;
  authorRegion: string;
  authorCountry: string;
  contentType: string;
  url: string;
  title: string;
  text: string;
  lang: string;
}


export interface Rating {
  userId: string;
  itemId: string;
  rating: number;
  // Add other rating properties as needed
}
