import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

import { GlobalEventsManager } from "../services/global-events-manager.service";

@Injectable()
export class LocalStorageService {

    constructor(
        private globalEventsManager: GlobalEventsManager) { }

    get<T>(key: string): T {
        return JSON.parse(localStorage.getItem(key));
    }

    set(key: string, value: any): void {
        return localStorage.setItem(key, JSON.stringify(value));
    }

    pushElToArrayField<T>(arrayKey: string, element: T): void {
        let modifiedArray = this.get<T[]>(arrayKey) || ([] as T[]);
        modifiedArray.push(element);
        return this.set(arrayKey, modifiedArray);
    }

    updateArrayElWithSameField<T>(matchingField: string, element: any, arrayKey: string): void {
        let modifiedArray = this.get<T[]>(arrayKey) || ([] as T[]);
        for (let i: number = 0; i != modifiedArray.length; i++) {
            if (modifiedArray[i][matchingField] == element[matchingField]) {
                modifiedArray[i] = element;
                break;
            }
        }
        return this.set(arrayKey, modifiedArray);
    }
}