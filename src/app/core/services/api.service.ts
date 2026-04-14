import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    get<T>(path: string, params?: Record<string, string>): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}${path}`, {
            params: new HttpParams({ fromObject: params ?? {} }),
        });
    }

    post<T>(path: string, body: unknown, token?: string): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${path}`, body, {
            headers: this.buildHeaders(token),
        });
    }

    put<T>(path: string, body: unknown, token?: string): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${path}`, body, {
            headers: this.buildHeaders(token),
        });
    }

    private buildHeaders(token?: string): HttpHeaders {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }
}