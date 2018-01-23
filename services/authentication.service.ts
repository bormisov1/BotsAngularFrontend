import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

import { baseURL } from '../shared/baseurl';
import { CurrentUser } from '../shared/current-user';

import { GlobalEventsManager } from "../services/global-events-manager.service";
import { LocalStorageService } from "../services/local-storage.service";

@Injectable()
export class AuthenticationService {
    public token: string;

    constructor(
        private http: Http
        , private globalEventsManager: GlobalEventsManager
        , private localStorageService: LocalStorageService
    ) {
        // set token if saved in local storage
        let currentUser = this.localStorageService.get<CurrentUser>('currentUser');
        this.token = currentUser && currentUser.token;
    }

    login(username: string, password: string): Observable<boolean> {
        return this.http.post(baseURL + '/login', { username: username, password: password })
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                if (token) {
                    this.token = token;
                    this.localStorageService.set('currentUser', { username: username, token: token });
                    this.globalEventsManager.showNavBar(true);
                    return true;
                } else {
                    return false;
                }
            })
            .catch((error: any) => {
                console.log('error.status:', error.status);
                return Observable.of(false);
                //error.status
            });
    }

    logout(): void {
        this.token = null;
        this.localStorageService.set('currentUser', {});
        this.globalEventsManager.showNavBar(false);
    }

    isAuthenticated(): boolean {
        if (this.localStorageService.get<CurrentUser>('currentUser')) {
            // logged in so return true
            return true;
        } else {
            return false;
        }
    }
}