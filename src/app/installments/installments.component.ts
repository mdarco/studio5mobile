import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from '@ionic/angular';
import * as moment from 'moment';

import { AuthService } from '../services/auth/auth.service';
import { MembersService } from '../services/members/members.service';

@Component({
  selector: 'app-installments',
  templateUrl: './installments.component.html',
  styleUrls: ['./installments.component.scss']
})
export class InstallmentsComponent implements OnInit, OnDestroy {
  @Input() memberId: any;
  @Input() paymentId: any;

  installments: any = [];
  installments$: any;

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private authService: AuthService,
    private membersService: MembersService
  ) { }

  ngOnInit() {
    this.getInstallments();
  }

  ngOnDestroy() {
    this.installments$.unsubscribe();
  }

  async getInstallments() {
    const loading = await this.loadingController.create({
      spinner: 'circles',
      message: 'Učitavanje u toku..'
    });

    await loading.present();

    this.installments$ = this.membersService.getMemberPaymentInstallments(this.memberId, this.paymentId).subscribe({
      next: (response: any) => {
        if (response && response['length'] > 0) {
          this.installments = response;
        }
      },
      error: error => {
        console.error('INSTALLMENTS ERROR', error);
        this.installments = [];
        this.showToast('Došlo je do greške prilikom preuzimanja spiska rata.', 'danger');
        loading.dismiss();
      },
      complete: () => {
        loading.dismiss();
      }
    });
  }

  async editInstallment(installment: any, model: any) {
    const loading = await this.loadingController.create({
      spinner: 'circles',
      message: 'Molim Vas, sačekajte..'
    });

    await loading.present();

    this.membersService.editMemberPaymentInstallment(this.memberId, this.paymentId, installment.ID, model).subscribe({
      next: () => {
        Object.keys(model).forEach(key => {
          installment[key] = model[key];

          if (key === 'IsPaid') {
            if (!model[key]) {
              installment.PaymentDate = undefined;
            } else {
              installment.PaymentDate = Date.now();
            }
          }
        });
        this.showToast('Rata plaćanja je uspešno ažurirana.', 'success');
      },
      error: error => {
        console.error('EDIT INSTALLMENT ERROR', error);
        this.showToast('Došlo je do greške prilikom izmene rate plaćanja.', 'danger');
        loading.dismiss();
      },
      complete: () => {
        loading.dismiss();
      }
    });
  }

  userIsAdmin() {
    if (this.authService.userModel.UserGroups && this.authService.userModel.UserGroups.length > 0) {
      return this.authService.userModel.UserGroups.includes('ADMIN');
    }
  }

  async openActionSheet(installment: any) {
    const button_cancelPayment = {
      text: (!installment.IsCanceled ? 'Poništi ratu' : 'Aktiviraj ratu'),
        handler: () => {
          this.showConfirmDialog(
            'Da li ste sigurni?',
            (!installment.IsCanceled ? 'Poništavate plaćanje?' : 'Aktivirate plaćanje?'),
            () => {
              this.editInstallment(installment, {
                IsCanceled: !installment.IsCanceled
              });
            }
          );
        }
    };

    const button_changeStatus = {
      text: 'Izmeni status (plaćeno/neplaćeno)',
        handler: () => {
          this.showConfirmDialog(
            'Da li ste sigurni?',
            (!installment.IsPaid ? 'Rata je plaćena?' : 'Rata nije plaćena?'),
            () => {
              this.editInstallment(installment, {
                IsPaid: !installment.IsPaid
              });
            }
          );
        }
    };

    const button_close = {
      text: 'Zatvori',
        icon: 'close',
        role: 'cancel',
        handler: () => {}
    };

    const buttons = [];
    buttons.push(button_close);
    buttons.push(button_changeStatus);

    if (this.userIsAdmin()) {
      buttons.push(button_cancelPayment);
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Plaćanja',
      buttons
    });
    await actionSheet.present();
  }

  getStatusColor(installment: any) {
    if (installment.IsPaid) {
      return 'success';
    }

    if (!installment.IsPaid) {
        const today = moment(Date.now());
        const installmentDate = moment(installment.InstallmentDate);

        if (installmentDate > today) {
            return 'primary';
        } else {
            return 'danger';
        }
    }
    return 'primary';
  }

  async showConfirmDialog(header: any, message: any, yesCallback?: any, noCallback?: any) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [{
        text: 'Ne',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          if (noCallback) {
            noCallback();
          }
        }
      }, {
        text: 'Da',
          handler: () => {
            if (yesCallback) {
              yesCallback();
            }
          }
      }]
    });

    await alert.present();
  }

  cancel() {
    this.modalController.dismiss();
  }

  async showToast(message: any, color: any) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}
