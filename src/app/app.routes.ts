import { Routes } from '@angular/router';
import { venueGuard } from './core/guards/venue.guard';

export const routes: Routes = [
    {
        path: ':slug',
        canActivate: [venueGuard],
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/landing/landing.component').then(m => m.LandingComponent),
            },/*
            {
                path: 'search',
                loadComponent: () =>
                    import('./features/search/search.component').then(m => m.SearchComponent),
            },
            {
                path: 'confirmation',
                loadComponent: () =>
                    import('./features/confirmation/confirmation.component').then(m => m.ConfirmationComponent),
            },
            {
                path: 'queue',
                loadComponent: () =>
                    import('./features/queue/queue.component').then(m => m.QueueComponent),
            },*/
        ],
    },
    { path: '**', redirectTo: '' },
];
