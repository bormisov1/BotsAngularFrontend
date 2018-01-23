import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Emitent } from '../shared/emitent';
import { EmitentService } from '../services/emitent.service';
import { Coupon } from '../shared/coupon';
import { CouponService } from '../services/coupon.service';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
	selector: 'app-emitents',
	templateUrl: './emitents.component.html',
	styleUrls: ['./emitents.component.scss'],
	providers: [EmitentService, CouponService, LocalStorageService]
})
export class EmitentsComponent implements OnInit {

	emitents: Emitent[];
	emitentForm: Emitent = new Emitent();

	constructor(
		private emitentService: EmitentService
		, private couponService: CouponService
		, public dialog: MatDialog
	) { }

	ngOnInit() {
		this.getEmitents();
	}

	getEmitents(): void {
		this.emitents = this.emitentService.getEmitents();
	}

	askKeyName(): void {
	    let dialogRef = this.dialog.open(KeyNameDialog, {
			width: '250px'
			//, data: { name: this.name, animal: this.animal }
	    });

	    dialogRef.afterClosed().subscribe(keyName => {
			this.emitentService.generateKey(keyName);
			this.emitents = this.emitentService.getEmitents();
	    });
	}

	makeEmitent(emitent: Emitent): void {
	    let dialogRef = this.dialog.open(MakeEmitentDialog, {
			width: '350px'
			, data: emitent
	    });

	    dialogRef.afterClosed().subscribe(upgradedEmitent => {
	    	upgradedEmitent.isEmitent = true;
			this.emitentService.upgradeEmitent(upgradedEmitent);
			this.emitents = this.emitentService.getEmitents();
	    });
	}

	makeCoupon(ofEmitent: Emitent): void {
	    let dialogRef = this.dialog.open(MakeCouponDialog, {
			width: '350px'
			, data: ofEmitent
	    });

	    dialogRef.afterClosed().subscribe(couponMade => {
	    	couponMade.emitent_pubkey = ofEmitent.pubkey;
	    	couponMade.code = '1'; // coupon index for this emitent should be here? or what?
	    	console.log(couponMade);
	    	this.couponService.addCoupon(couponMade);
	    });
	}
}

@Component({
	selector: 'key-name-dialog',
	templateUrl: 'key-name-dialog.html',
})
export class KeyNameDialog {

	name: string;

	constructor(
		public dialogRef: MatDialogRef<KeyNameDialog>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	onNoClick(): void {
		this.dialogRef.close();
	}

}

@Component({
	selector: 'make-emitent-dialog',
	templateUrl: 'make-emitent-dialog.html',
})
export class MakeEmitentDialog {

	constructor(
		public dialogRef: MatDialogRef<MakeEmitentDialog>,
		@Inject(MAT_DIALOG_DATA) public emitentBlank: any
	) { }

	onNoClick(): void {
		this.dialogRef.close();
	}

}

@Component({
	selector: 'make-coupon-dialog',
	templateUrl: 'make-coupon-dialog.html',
})
export class MakeCouponDialog {

	couponForm = new Coupon();

	constructor(
		public dialogRef: MatDialogRef<MakeCouponDialog>,
		@Inject(MAT_DIALOG_DATA) public ofEmitent: any
	) { }

	onNoClick(): void {
		this.dialogRef.close();
	}

}