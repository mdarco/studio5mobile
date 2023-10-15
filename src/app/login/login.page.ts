import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, AlertController, Platform } from '@ionic/angular';

import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  username: any;
  password: any;

  private login$: any;
  private backButton$: any;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    this.username = '';
    this.password = '';
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.login$.unsubscribe();
  }

  ionViewDidEnter(){
    this.backButton$ = this.platform.backButton.subscribe(() => {
      //navigator['app'].exitApp();
    });
  }

  ionViewWillLeave() {
    this.backButton$.unsubscribe();
  }

  async login() {
    const loading = await this.loadingController.create({
      spinner: 'circles',
      message: 'Prijava u toku...'
    });

    this.login$ = this.authService.login({
      Username: this.username,
      Password: btoa(this.password)
    }).subscribe({
      next: result => {
        console.log('LOGIN RESULT:', result);
      },
      error: error => {
        console.log('DF API url:', environment.apiUrl);
        loading.dismiss();
        this.username = undefined;
        this.password = undefined;
        this.showAlert(error.message);
      },
      complete: () => {
        loading.dismiss();
        this.username = undefined;
        this.password = undefined;
      }
    });
  }

  showAlert(msg: string) {
    const alert = this.alertController.create({
      message: msg,
      header: 'Greška',
      buttons: ['OK']
    });
    alert.then(a => a.present());
  }
}
