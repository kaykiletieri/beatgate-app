import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CreateSongRequestPayload, SongRequestResponse, QueueItem } from '../models/song-request.model';

@Injectable({ providedIn: 'root' })
export class SongRequestService {
    constructor(private api: ApiService) { }

    create(payload: CreateSongRequestPayload, slug: string): Observable<SongRequestResponse> {
        return this.api.post<SongRequestResponse>(`/api/song-requests?slug=${slug}`, payload);
    }

    getQueue(slug: string): Observable<QueueItem[]> {
        return this.api.get<QueueItem[]>(`/api/song-requests/venue/${slug}/queue`);
    }
}