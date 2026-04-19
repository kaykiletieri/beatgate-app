import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { SongRequestService } from '../../core/services/song-request.service';
import { RealtimeService } from '../../core/services/realtime.service';
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
  private realtimeSvc = inject(RealtimeService);
  readonly venueSvc = inject(VenueService);

  slug = '';
  items: QueueItem[] = [];
  loading = true;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';

    // Carrega fila inicial
    this.load();

    // Conecta ao hub SignalR
    this.realtimeSvc.connect(this.slug);

    // Quando uma música é aprovada, recarrega a fila
    this.subs.push(
      this.realtimeSvc.onRequestApproved$.subscribe(() => this.load()),
    );

    // Quando uma música é rejeitada, recarrega a fila (por segurança)
    this.subs.push(
      this.realtimeSvc.onRequestRejected$.subscribe(() => this.load()),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.realtimeSvc.disconnect();
  }

  load(): void {
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

  get nowPlaying(): QueueItem | null {
    return this.items.find(i => i.isPlaying) ?? null;
  }

  get upcoming(): QueueItem[] {
    return this.items.filter(i => !i.isPlaying);
  }
}