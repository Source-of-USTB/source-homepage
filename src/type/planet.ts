export interface PlanetPost {
  id: string;
  title: string;
  link: string;
  description: string;
  publishedAt?: string;
  dateKey?: string;
  monthKey?: string;
  yearKey?: string;
  authorId: string;
  authorName: string;
  sourceFeed?: string;
}

export interface PlanetMember {
  name: string;
  site: string;
  feed: string;
  avatar: string;
  description: string;
}

export type PlanetMemberMap = Record<string, PlanetMember>;
