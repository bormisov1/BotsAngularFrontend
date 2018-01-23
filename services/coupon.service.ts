import { Injectable } from '@angular/core';

import { HttpService } from './http.service';
import { baseURL } from '../shared/baseurl'

import { Coupon } from '../shared/coupon';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class CouponService {
	constructor(
		private localStorageService: LocalStorageService
		, private httpService: HttpService
	) { }

	getCoupons(emitentPubkey: string): Coupon[] {
		let coupons: Coupon[] = [];
		this.localStorageService.get<Coupon[]>('coupons').forEach(coupon => {
			if (coupon.emitent_pubkey == emitentPubkey)
				coupons.push(coupon);
		});
		return coupons;
	}

	addCoupon(coupon: Coupon): void {
		return this.localStorageService.pushElToArrayField('coupons', coupon);
	}
}