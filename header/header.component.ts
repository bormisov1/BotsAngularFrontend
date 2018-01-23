import { Component, OnInit } from '@angular/core';

import { MenuButton, menuButtons } from './buttons';

import { AuthenticationService } from '../services/authentication.service';
import { GlobalEventsManager } from "../services/global-events-manager.service";

// what do I need this for?
//import { MdButtonModule } from '@angular/material';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

	buttons: MenuButton[];
	userStatus: number;
	//isAuthenticated: boolean;

	constructor(
		private authenticationService: AuthenticationService
		, private globalEventsManager: GlobalEventsManager) {
	}

	ngOnInit() {
		this.userStatus = this.authenticationService.isAuthenticated()?2:1;
		//this.isAuthenticated = this.authenticationService.isAuthenticated();
		this.buttons = menuButtons;
        this.globalEventsManager.showNavBarEmitter.subscribe(mode => {        
            this.userStatus = mode?2:1;
            //this.isAuthenticated = mode;
        });
	}

}
