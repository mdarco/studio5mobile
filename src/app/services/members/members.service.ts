import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private memberDetails_header_memberNameSource = new BehaviorSubject<string>('');
  memberDetails_header_memberName$ = this.memberDetails_header_memberNameSource.asObservable();

  private memberDetails_contentSource = new BehaviorSubject<Object>({});
  memberDetails_content$ = this.memberDetails_contentSource.asObservable();

  apiUrl = environment.apiUrl;
  rootUrl = '/api/members';

  constructor(private http: HttpClient) { }

  getFilteredMembers(filter: any) {
    // console.log('FILTER', filter);
    const url = this.apiUrl + this.rootUrl + '/filtered?nd=' + Date.now();
    return this.http.post(url, filter);
  }

  getMemberDocuments(memberId: any) {
    const url = this.apiUrl + this.rootUrl + '/' + memberId + '/documents?nd=' + Date.now();
    return this.http.get(url);
  }

  getMemberPayments(memberId: any) {
    const url = this.apiUrl + this.rootUrl + '/' + memberId + '/payments?nd=' + Date.now();
    return this.http.get(url);
  }

  getMemberPaymentInstallments(memberId: any, paymentId: any) {
    const url = this.apiUrl + this.rootUrl + '/' + memberId + '/payments/' + paymentId + '/installments?nd=' + Date.now();
    return this.http.get(url);
  }

  editMemberPaymentInstallment(memberId: any, paymentId: any, installmentId: any, model: any) {
    const url = this.apiUrl + this.rootUrl + '/' + memberId + '/payments/' + paymentId + '/installments/' + installmentId;
    return this.http.put(url, model);
  }

  setMemberDetailsHeaderMemberName(name: string) {
    this.memberDetails_header_memberNameSource.next(name);
  }

  setMemberDetailsContent(memberDetails: any) {
    this.memberDetails_contentSource.next(memberDetails);
  }
}
