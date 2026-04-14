import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SearchTrack } from '../models/song-request.model';

@Injectable({ providedIn: 'root' })
export class SpotifyService {
    constructor(private api: ApiService) { }

    search(query: string, slug: string): Observable<SearchTrack[]> {
        return this.api.get<SearchTrack[]>('/api/spotify/search', { q: query, slug });
    }
}