import { Injectable } from '@angular/core';

import { HttpService } from './http.service';
import { baseURL } from '../shared/baseurl'

import { Emitent } from '../shared/emitent';
import { LocalStorageService } from './local-storage.service';

import * as Blockchain from 'bitcoinjs-lib';

@Injectable()
export class EmitentService {
	constructor(			
		private localStorageService: LocalStorageService
		, private httpService: HttpService
	) { }	

	getEmitents(): Emitent[] {
		return this.localStorageService.get<Emitent[]>('emitents');
	}

	addEmitent(emitent: Emitent): void {
		return this.localStorageService.pushElToArrayField('emitents', emitent);
	}

	generateKey(name: string): void {
		console.log("Generating key with name " + name);
		// generate...
		let options = {
			network: Blockchain.networks.couponcoin
		};
		let keyPair = Blockchain.ECPair.makeRandom(options);
		let emitent: Emitent = {
			title: name
			, address: keyPair.getAddress()
			, pubkey: keyPair.getPublicKeyBuffer().toString('hex')
			, privkey: keyPair.toWIF()
			, city: ''
			, region: ''
			, description: ''
			, pubkey_confirmation: ''
			, isEmitent: false
		};
		this.addEmitent(emitent);
	}

	upgradeEmitent(emitent: Emitent): void {
		this.localStorageService.updateArrayElWithSameField('title', emitent, 'emitents');
		let emitentMessage = this.makeSignedEmitentMessage(emitent);
		console.log(emitentMessage);
	    this.httpService.post('/', emitentMessage, result => {
	    	console.log(result);
	    });
	}

	makeSignedEmitentMessage(emitent: Emitent): {} {
		let emitentMessage = new Blockchain.Message('emitent');
		emitentMessage.type = 'emitent';
		emitentMessage.pubkey = emitent.pubkey;
		emitentMessage.description = emitent.description;
		emitentMessage.region = emitent.region;
		emitentMessage.city = emitent.city;
		emitentMessage.address = emitent.address;
		emitentMessage.pubkey_confirmation = emitent.pubkey_confirmation;
		let keyPair = Blockchain.ECPair.fromWIF(emitent.privkey, Blockchain.networks.couponcoin);
		emitentMessage.sign(keyPair);
		return emitentMessage;
	}
}