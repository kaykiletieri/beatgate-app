import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VenueService } from '../../core/services/venue.service';
import { SongRequestResponse, SearchTrack, SongRequestStatus } from '../../core/models/song-request.model';

@Component({
  selector: 'bg-confirmation',
  standalone: true,
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly venueSvc = inject(VenueService);

  slug = '';
  request: SongRequestResponse | null = null;
  track: SearchTrack | null = null;

  readonly SongRequestStatus = SongRequestStatus;

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';

    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? history.state;

    this.request = state?.['request'] ?? null;
    this.track = state?.['track'] ?? null;

    if (!this.request) {
      this.router.navigate([this.slug, 'search']);
    }
  }

  suggestAnother(): void {
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