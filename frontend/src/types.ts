export interface Recommendation {
  contentId?: string;
  title: string;
  "Recommendation 1": string;
  "Recommendation 2": string;
 "Recommendation 3": string;
  "Recommendation 4": string;
  "Recommendation 5": string;

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

