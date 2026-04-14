import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VenueService } from '../../core/services/venue.service';
import { Venue } from '../../core/models/venue.model';

@Component({
  selector: 'bg-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly venueSvc = inject(VenueService);

  venue: Venue | null = null;
  slug = '';

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.venue = this.venueSvc.venue();
  }

  goToSearch(): void {
    this.router.navigate([this.slug, 'search']);
  }

  goToQueue(): void {
    this.router.navigate([this.slug, 'queue']);
  }
}