export enum SongRequestStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Played = 3,
}

export interface SearchTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    albumImageUrl: string | null;
    durationMs: number;
}

export interface CreateSongRequestPayload {
    sessionToken: string;
    spotifyTrackId: string;
    trackName: string;
    artistName: string;
    albumName: string;
    albumImageUrl: string | null;
    durationMs: number;
}

export interface SongRequestResponse {
    id: string;
    trackName: string;
    artistName: string;
    albumName: string;
    albumImageUrl: string | null;
    durationMs: number;
    status: SongRequestStatus;
    createdAt: string;
}

export interface QueueItem {
    id: string;
    position: number;
    isPlaying: boolean;
    trackName: string;
    artistName: string;
    albumName: string;
    albumImageUrl: string | null;
    durationMs: number;
    addedAt: string;
}