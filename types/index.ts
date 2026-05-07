// Event Types
export interface EventAttendees {
  count: number;
  avatars: string[];
}

export interface EventLocation {
  name: string;
  address?: string;
  distance: string;
}

export interface EventHost {
  name: string;
  avatar: string;
  eventsHosted: number;
}

export type EntryType = "open" | "request" | "invite";

export interface Event {
  id: string;
  title: string;
  imageUri: string;
  description: string;
  date: string;
  startDate?: string;
  endDate?: string;
  time: string;
  category: string;
  attendees: EventAttendees;
  location: EventLocation;
  host: EventHost;
  price: string;
  tags: string[];
  rules: string[];
  entryType: EntryType;
  maxAttendees?: number;
  currentAttendees?: number;
  isTrending?: boolean;
  isBookmarked?: boolean;
}

// Conversation Types
export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}
