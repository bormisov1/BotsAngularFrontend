import { Component, OnInit } from '@angular/core';

import { Bot } from '../shared/bot';
import { BotsService } from '../services/bots.service';

@Component({
  selector: 'app-bots',
  templateUrl: './bots.component.html',
  styleUrls: ['./bots.component.scss']
})
export class BotsComponent implements OnInit {

	bots: Bot[];

	constructor(
        private botsService: BotsService
	) { }

	ngOnInit() {
		this.getBots();
	}

	getBots(): void {
		this.botsService.getBots(bots => {
			this.bots = bots;
		});
	}
}
