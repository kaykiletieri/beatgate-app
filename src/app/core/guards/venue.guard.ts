import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { VenueService } from '../services/venue.service';
import { SessionService } from '../services/session.service';

export const venueGuard: CanActivateFn = (route) => {
    const slug = route.paramMap.get('slug') ?? '';
    const venueSvc = inject(VenueService);
    const sessionSvc = inject(SessionService);
    const router = inject(Router);

    return venueSvc.loadVenue(slug).pipe(
        map(() => {
            sessionSvc.ensureSession(slug).subscribe();
            return true;
        }),
        catchError(() => {
            router.navigate(['/']);
            return of(false);
        }),
    );
};