import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

import { baseURL } from '../shared/baseurl';
import { CurrentUser } from '../shared/current-user';

import { LocalStorageService } from './local-storage.service';

@Injectable()
export class HttpService {

	token: string;

    constructor(
    	private http: Http
    	, private localStorageService: LocalStorageService
    ) { }

    post(path: string, data: {}, callback: (any) => void): void {
        this.token = this.localStorageService.get<CurrentUser>('currentUser').token;
        let headers = new Headers();
        if (this.token)
            headers.append('x-access-token', this.token);
        headers.append('Content-Type', 'application/json');
        this.http.post(baseURL + path, JSON.stringify(data), { headers: headers })
            .map((response: Response) => {
                console.log(response);
                callback(response.json());
            })
            .catch((error: any) => {
                console.log('error:', error);
                console.log('error.status:', error.status);
                return Observable.of(false);
            })
            .subscribe();
    }

    get(path: string, data: {}, callback: (any) => void): void {
        this.token = this.localStorageService.get<CurrentUser>('currentUser').token;
        let headers = new Headers();
        if (this.token)
            headers.append('x-access-token', this.token);
        headers.append('Content-Type', 'application/json');
        this.http.get(baseURL + path, { params: JSON.stringify(data), headers: headers })
            .map((response: Response) => {
                console.log(response);
                callback(response.json());
            })
            .catch((error: any) => {
                console.log('error:', error);
                console.log('error.status:', error.status);
                return Observable.of(false);
            })
            .subscribe();
    }
}