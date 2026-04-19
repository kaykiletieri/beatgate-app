import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { VenueService } from '../../core/services/venue.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { SongRequestResponse, SearchTrack, SongRequestStatus } from '../../core/models/song-request.model';

@Component({
  selector: 'bg-confirmation',
  standalone: true,
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private realtimeSvc = inject(RealtimeService);
  readonly venueSvc = inject(VenueService);

  slug = '';
  request: SongRequestResponse | null = null;
  track: SearchTrack | null = null;

  readonly SongRequestStatus = SongRequestStatus;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';

    // Tenta sessionStorage primeiro
    try {
      const stored = sessionStorage.getItem(`bg_confirmation_${this.slug}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.request = parsed.request ?? null;
        this.track = parsed.track ?? null;
      }
    } catch { /* noop */ }

    // Se não achou no sessionStorage, tenta o history.state
    // mas só se tiver request dentro (não apenas navigationId)
    if (!this.request) {
      const state = history.state;
      if (state?.request && state?.track) {
        this.request = state.request;
        this.track = state.track;
        sessionStorage.setItem(`bg_confirmation_${this.slug}`, JSON.stringify({
          request: this.request,
          track: this.track,
        }));
      }
    }

    if (!this.request) {
      this.router.navigate([this.slug, 'search']);
      return;
    }

    this.realtimeSvc.connect(this.slug);

    this.subs.push(
      this.realtimeSvc.onRequestApproved$.subscribe(event => {
        if (event.id === this.request?.id) {
          this.request = { ...this.request!, status: SongRequestStatus.Approved };
          sessionStorage.setItem(`bg_confirmation_${this.slug}`, JSON.stringify({
            request: this.request,
            track: this.track,
          }));
        }
      }),
    );

    this.subs.push(
      this.realtimeSvc.onRequestRejected$.subscribe(event => {
        if (event.id === this.request?.id) {
          this.request = { ...this.request!, status: SongRequestStatus.Rejected };
          sessionStorage.setItem(`bg_confirmation_${this.slug}`, JSON.stringify({
            request: this.request,
            track: this.track,
          }));
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.realtimeSvc.disconnect();
  }

  suggestAnother(): void {
    sessionStorage.removeItem(`bg_confirmation_${this.slug}`);
    this.router.navigate([this.slug, 'search']);
  }

  goToQueue(): void {
    this.router.navigate([this.slug, 'queue']);
  }

  get isPending(): boolean {
    return this.request?.status === SongRequestStatus.Pending;
  }

  get isApproved(): boolean {
    return this.request?.status === SongRequestStatus.Approved;
  }

  get isRejected(): boolean {
    return this.request?.status === SongRequestStatus.Rejected;
  }
}