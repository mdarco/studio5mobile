import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, AlertController, ToastController, ModalController } from '@ionic/angular';

import { AuthService } from '../services/auth/auth.service';
import { MembersService } from '../services/members/members.service';

import { ListFilterComponent } from '../list-filter/list-filter.component';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit, OnDestroy {
  private getMembers$: any;

  filter: any = {
    PageNo: 1,
    RecordsPerPage: 10,
    ExcludeNonActive: false,
    FullName: undefined,
    DanceGroupID: undefined,
    DanceGroups: undefined
  };

  members: Array<any> = [];
  membersTotal: any = null;
  membersDisplayed: any = null;

  constructor(
    private authService: AuthService,
    private membersService: MembersService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.checkUserDanceGroups();
    this.applyFilter();
  }

  ngOnDestroy() {
    this.getMembers$.unsubscribe();
  }

  checkUserDanceGroups() {
    // see if user is a part of any dance groups and set filter accordingly
    if (this.authService.userModel.UserDanceGroups && this.authService.userModel.UserDanceGroups.length > 0) {
      this.filter.DanceGroups = this.authService.userModel.UserDanceGroups;
      this.filter.DanceGroupID = this.authService.userModel.UserDanceGroups[0].DanceGroupID;
    }
  }

  async applyFilter(noConcat = false) {
    const loading = await this.loadingController.create({
      spinner: 'circles',
      message: 'Molim Vas, sačekajte...'
    });

    await loading.present();

    this.getMembers$ = this.membersService.getFilteredMembers(this.filter).subscribe({
      next: (response: any) => {
        // console.log('RESPONSE', response);
        if (response && response['Data'] && response['Data'].length > 0) {
          if (noConcat) {
            this.members = response['Data'];
          } else {
            this.members = this.members.concat(response['Data']);
          }

          this.membersTotal = response['Total'];
          this.membersDisplayed = this.filter.PageNo * this.filter.RecordsPerPage;

          if (this.membersTotal < this.membersDisplayed) {
            this.membersDisplayed = this.membersTotal;
          }
        }
      },
      error: error => {
        // console.log('MEMBERS ERROR', error);
        this.members = [];
        this.membersTotal = null;
        this.membersDisplayed = null;
        this.showAlert('Došlo je do greške prilikom preuzimanja liste plesača.');
        loading.dismiss();
      },
      complete: () => {
        loading.dismiss();
      }
    });
  }

  resetFilter() {
    this.filter = {
      PageNo: 1,
      RecordsPerPage: 10,
      ExcludeNonActive: false,
      FullName: undefined,
      DanceGroupID: undefined
    };

    this.checkUserDanceGroups();
    this.applyFilter(true);
  }

  async onInfiniteScroll(event: any) {
    // if (this.membersDisplayed === this.membersTotal) {
      // event.target.disabled = true;
    // } else {
      this.filter.PageNo++;
      await this.applyFilter();
      event.target.complete();
    // }
  }

  setHeaderMemberName(name: any) {
    this.membersService.setMemberDetailsHeaderMemberName(name);
  }

  setContentMemberDetails(memberDetails: any) {
    this.membersService.setMemberDetailsContent(memberDetails);
  }

  async showFilterDialog() {
    const modal = await this.modalController.create({
      component: ListFilterComponent,
      componentProps: this.filter
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data && data.filterData) {
      this.filter.PageNo = 1;

      if (data.filterData.Status) {
        if (data.filterData.Status === 'active') {
          this.filter.ExcludeNonActive = true;
        }

        if (data.filterData.Status === 'all') {
          this.filter.ExcludeNonActive = false;
        }
      } else {
        this.filter.ExcludeNonActive = false;
      }

      if (data.filterData.FullName) {
        if (data.filterData.FullName !== '') {
          this.filter.FullName = data.filterData.FullName;
        } else {
          this.filter.FullName = undefined;
        }
      } else {
        this.filter.FullName = undefined;
      }

      if (data.filterData.DanceGroupID) {
        if (data.filterData.DanceGroupID !== '') {
          this.filter.DanceGroupID = data.filterData.DanceGroupID;
        } else {
          this.filter.DanceGroupID = undefined;
        }
      } else {
        this.filter.DanceGroupID = undefined;
      }

      this.applyFilter(true);
    }
  }

  async showAddMemberDialog() {
    await this.showWipToast();
  }

  showAlert(msg: string) {
    const alert = this.alertController.create({
      message: msg,
      header: 'Greška',
      buttons: ['OK']
    });
    alert.then(a => a.present());
  }

  async showWipToast() {
    const toast = await this.toastController.create({
      message: 'Work in progress...',
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
}
