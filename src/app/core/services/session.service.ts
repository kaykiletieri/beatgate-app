import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

interface CreateSessionResponse {
    sessionToken: string;
    venue: {
        name: string;
        slug: string;
        maxRequestsPerSession: number;
    };
}

const STORAGE_KEY = 'bg_sessions';

@Injectable({ providedIn: 'root' })
export class SessionService {
    private sessions: Record<string, string> = {};
    readonly token = signal<string | null>(null);

    constructor(private api: ApiService) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try { this.sessions = JSON.parse(stored); } catch { /* noop */ }
        }
    }

    ensureSession(slug: string): Observable<CreateSessionResponse> {
        const existing = this.sessions[slug];

        if (existing) {
            this.token.set(existing);
            return new Observable(obs => {
                obs.next({ sessionToken: existing, venue: { name: '', slug, maxRequestsPerSession: 0 } });
                obs.complete();
            });
        }

        return this.api.post<CreateSessionResponse>(`/api/sessions/${slug}`, {}).pipe(
            tap(res => {
                this.sessions[slug] = res.sessionToken;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
                this.token.set(res.sessionToken);
            }),
        );
    }

    getToken(slug: string): string | null {
        return this.sessions[slug] ?? null;
    }
}