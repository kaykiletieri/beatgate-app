import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Venue } from '../models/venue.model';

@Injectable({ providedIn: 'root' })
export class VenueService {
    readonly venue = signal<Venue | null>(null);

    constructor(private api: ApiService) { }

    loadVenue(slug: string): Observable<Venue> {
        return this.api.get<Venue>(`/api/venues/${slug}`).pipe(
            tap(venue => {
                this.venue.set(venue);
                this.applyBranding(venue);
            }),
        );
    }

    private applyBranding(venue: Venue): void {
        const root = document.documentElement;
        const primary = venue.primaryColor ?? '#b6a0ff';
        root.style.setProperty('--color-primary', primary);
        root.style.setProperty('--color-primary-container', primary);

        const hex = primary.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        root.style.setProperty('--glow-primary', `0 0 20px rgba(${r},${g},${b},0.35)`);
    }
}