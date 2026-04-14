export interface Venue {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    primaryColor: string | null;
    logoUrl: string | null;
    maxRequestsPerSession: number;
}