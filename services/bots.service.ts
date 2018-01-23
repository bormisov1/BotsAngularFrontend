import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from './http.service';
import { baseURL } from '../shared/baseurl'

import { Bot } from '../shared/bot';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class BotsService {
	constructor(
		private localStorageService: LocalStorageService
		, private httpService: HttpService
	) { }

	getBots(callback): void {
		this.httpService.get('/bots', {}, (bots) => {
			this.localStorageService.set('bots', bots);
			callback(bots);
		});
	}

	addBot(bot: Bot): void {
		return this.localStorageService.pushElToArrayField('bots', bot);
	}
}