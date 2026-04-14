import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchTrack } from '../../../../core/models/song-request.model';

@Component({
  selector: 'bg-track-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-card.component.html',
  styleUrls: ['./track-card.component.scss'],
})
export class TrackCardComponent {
  @Input() track!: SearchTrack;
  @Input() selected = false;
  @Input() duration = '';
  @Output() select = new EventEmitter<void>();
}