import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Subject, debounceTime, distinctUntilChanged,
  switchMap, catchError, of, takeUntil,
} from 'rxjs';

import { SpotifyService } from '../../core/services/spotify.service';
import { SongRequestService } from '../../core/services/song-request.service';
import { SessionService } from '../../core/services/session.service';
import { VenueService } from '../../core/services/venue.service';
import { SearchTrack } from '../../core/models/song-request.model';
import { TrackCardComponent } from './components/track-card/track-card.component';

type SearchState = 'idle' | 'loading' | 'results' | 'empty' | 'error';

@Component({
  selector: 'bg-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TrackCardComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private spotifySvc = inject(SpotifyService);
  private songRequestSvc = inject(SongRequestService);
  private sessionSvc = inject(SessionService);
  readonly venueSvc = inject(VenueService);

  slug = '';
  query = '';
  state: SearchState = 'idle';
  tracks: SearchTrack[] = [];
  selectedTrack: SearchTrack | null = null;
  isSubmitting = false;

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';

    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) {
          this.state = 'idle';
          this.tracks = [];
          return of([]);
        }
        this.state = 'loading';
        return this.spotifySvc.search(q, this.slug).pipe(
          catchError(() => { this.state = 'error'; return of([]); }),
        );
      }),
      takeUntil(this.destroy$),
    ).subscribe(tracks => {
      this.tracks = tracks;
      if (this.state !== 'error') {
        this.state = tracks.length ? 'results' : 'empty';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.search$.next(value);
  }

  selectTrack(track: SearchTrack): void {
    this.selectedTrack = this.selectedTrack?.id === track.id ? null : track;
  }

  suggest(): void {
    if (!this.selectedTrack || this.isSubmitting) return;
    const token = this.sessionSvc.getToken(this.slug);
    if (!token) return;

    this.isSubmitting = true;
    this.songRequestSvc.create(
      {
        sessionToken: token,
        spotifyTrackId: this.selectedTrack.id,
        trackName: this.selectedTrack.name,
        artistName: this.selectedTrack.artist,
        albumName: this.selectedTrack.album,
        albumImageUrl: this.selectedTrack.albumImageUrl,
        durationMs: this.selectedTrack.durationMs,
      },
      this.slug,
    ).subscribe({
      next: res => {
        this.router.navigate([this.slug, 'confirmation'], {
          state: { request: res, track: this.selectedTrack },
        });
      },
      error: () => { this.isSubmitting = false; },
    });
  }

  goBack(): void {
    this.router.navigate([this.slug]);
  }

  goToQueue(): void {
    this.router.navigate([this.slug, 'queue']);
  }

  formatDuration(ms: number): string {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}