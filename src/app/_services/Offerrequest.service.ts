import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {Offerrequest} from '../_models/Offerrequest.model';
import {AccountService} from './account.service';

@Injectable({
  providedIn: 'root',
})
export class OfferrequestService {
  private corsheaders: HttpHeaders;
  private root: string;

  constructor(private router: Router, private http: HttpClient, private accountService: AccountService) {
  }

  save(offerrequest: Offerrequest) {
    return this.http.post(`${environment.apiUrl}/offerrequest`, offerrequest);
  }

  getAll() {
    return this.http.get<Offerrequest[]>(`${environment.apiUrl}/offerrequest`);
  }

  searchByKeyword(partno: string) {
    return this.http.get(`${environment.apiUrl}/Offerrequest/partno/${partno}`);
  }

  getById(id: string) {
    return this.http.get<Offerrequest>(
      `${environment.apiUrl}/offerrequest/${id}`
    );
  }

  GetSpareQuoteDetailsByParentId(id: string) {
    return this.http.get(
      `${environment.apiUrl}/offerrequest/GetSpareQuoteDetailsByParentId/${id}`
    );
  }

  update(id, params) {
    let tokn = JSON.parse(localStorage.getItem('zohotoken'));

    return this.http
      .put(`${environment.apiUrl}/offerrequest/${id}/${tokn}`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/offerrequest/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}
