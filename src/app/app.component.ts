import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, MenuController } from '@ionic/angular';

import { SplashScreen } from '@capacitor/splash-screen';
//import { StatusBar } from '@capacitor/status-bar';
import { Storage } from '@ionic/storage-angular';

import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  hideMenu = true;

  public appPages = [
    {
      title: 'Plesači',
      url: '/list',
      icon: 'people'
    },
    {
      title: 'Treninzi',
      url: '/trainings',
      icon: 'body'
    }
  ];

  constructor(
    private platform: Platform,
    private router: Router,
    private menuController: MenuController,
    private storage: Storage,
    private authService: AuthService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      //create storage
      this.storage.create();

      //StatusBar.styleDefault();
      SplashScreen.hide();
      this.authService.checkToken();

      this.authService.authenticationState.subscribe(state => {
        this.hideMenu = !this.authService.isAuthenticated();
        if (state) {
          //console.log('GOING TO THE LIST PAGE');
          this.router.navigate(['list']);
        } else {
          this.router.navigate(['login']);
        }
      });

      // this event fires when the native platform pulls the app
      // from the background - it is fired only with the Cordova apps,
      // it wouldn't fire on a standard web browser
      this.platform.resume.subscribe(result => {
        //this.authService.checkToken();
      });
    });
  }

  logout() {
    this.authService.logout();
    this.menuController.close();
  }
}
