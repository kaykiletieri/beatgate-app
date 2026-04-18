import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SongRequestService } from '../../core/services/song-request.service';
import { VenueService } from '../../core/services/venue.service';
import { QueueItem } from '../../core/models/song-request.model';

@Component({
  selector: 'bg-queue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss'],
})
export class QueueComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private songRequestSvc = inject(SongRequestService);
  readonly venueSvc = inject(VenueService);

  slug = '';
  items: QueueItem[] = [];
  loading = true;

  private poll$: Subscription | null = null;

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.load();

    // Polling a cada 10s até integrarmos SignalR
    this.poll$ = interval(10000).pipe(
      switchMap(() => this.songRequestSvc.getQueue(this.slug)),
    ).subscribe(items => this.items = items);
  }

  ngOnDestroy(): void {
    this.poll$?.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.songRequestSvc.getQueue(this.slug).subscribe({
      next: items => { this.items = items; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  goToSearch(): void {
    this.router.navigate([this.slug, 'search']);
  }

  goBack(): void {
    this.router.navigate([this.slug]);
  }

  formatDuration(ms: number): string {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}