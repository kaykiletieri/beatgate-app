import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SongRequestEvent {
    id: string;
    trackName: string;
    artistName: string;
    albumImageUrl: string | null;
    status: number;
    queuePosition?: number;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
    private hub: signalR.HubConnection | null = null;

    readonly onNewRequest$ = new Subject<SongRequestEvent>();
    readonly onRequestApproved$ = new Subject<SongRequestEvent>();
    readonly onRequestRejected$ = new Subject<SongRequestEvent>();

    connect(slug: string): void {
        if (this.hub) return;

        this.hub = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiUrl}/hubs/beatgate`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        this.hub.on('NewSongRequest', (e) => this.onNewRequest$.next(e));
        this.hub.on('SongRequestApproved', (e) => this.onRequestApproved$.next(e));
        this.hub.on('SongRequestRejected', (e) => this.onRequestRejected$.next(e));

        this.hub.start()
            .then(() => this.hub!.invoke('JoinVenue', slug))
            .catch(err => console.error('SignalR error:', err));
    }

    disconnect(): void {
        this.hub?.stop();
        this.hub = null;
    }
}