import { Component, Inject } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	ValidatorFn,
	AbstractControl,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BankOtcService } from 'src/app/services/otc-service/bank-otc.service';
import { FrontendOfferDto } from 'src/app/dtos/frontend-offer-dto';
import { error } from 'cypress/types/jquery';
@Component({
	selector: 'app-new-interbank-offer-dialog',
	templateUrl: './new-interbank-offer-dialog.component.html',
	styleUrls: ['./new-interbank-offer-dialog.component.css'],
})
export class NewInterbankOfferDialogComponent {
	form: FormGroup;
	maxAmount: number; // Store the maximum allowed amount

	constructor(
		private fb: FormBuilder,
		private otcService: BankOtcService,
		@Inject(MAT_DIALOG_DATA)
		public data: { ticker: string; amount: number },
	) {
		this.maxAmount = data.amount; // Set the maximum amount from data

		this.form = this.fb.group({
			ticker: [
				{ value: data.ticker, disabled: true },
				Validators.required,
			],
			amount: ['', [Validators.required, this.amountValidator()]], // Add custom validator
			price: ['', Validators.required],
		});
	}

	amountValidator(): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			const amountEntered = parseFloat(control.value);
			if (isNaN(amountEntered) || amountEntered > this.maxAmount) {
				return { invalidAmount: true };
			}
			return null;
		};
	}

	createOrder(): void {
		if (this.form.valid) {
			const frontendOfferDto: FrontendOfferDto = {
				ticker: this.form.get('ticker')?.value,
				amount: this.form.get('amount')?.value,
				price: this.form.get('price')?.value,
			};

			console.log('Form submitted:', this.form.value);
			this.otcService.postMakeOffer(frontendOfferDto).subscribe(
				response => {
					console.log(response);
				},
				error => {
					console.error(error);
				},
			);
		}
	}
}
