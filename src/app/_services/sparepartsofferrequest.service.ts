import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SparePartsOfferRequestService {

  constructor(
    private http: HttpClient
  ) { }

  SaveSpareParts = (params) => {
    return this.http.post(`${environment.apiUrl}/SparePartsOfferRequests`, params);
  }


  getSparePartsByOfferRequestId = (id: string) => {
    return this.http.get(`${environment.apiUrl}/SparePartsOfferRequests/${id}`);
  }

  
  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/SparePartsOfferRequests/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}
