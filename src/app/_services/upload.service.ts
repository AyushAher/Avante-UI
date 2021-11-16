import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Country } from '../_models';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private ContactSubject: BehaviorSubject<Country>;
  public contact: Observable<Country>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
       
    }
   
  upload(file: File) {
    const formData: FormData = new FormData();

    formData.append('file', file);
    return this.http.post(environment.uiUrl+`WeatherForecast/` + file.name, formData);
  }

  uploadPdf(file: File[]) {
    const formData: FormData = new FormData();
    for (var i = 0; i < file.length; ++i) {
      formData.append('files', file[i]);
    }
    return this.http.post(environment.uiUrl + `WeatherForecast/UploadPdfFile/`, formData);
  }

  getFile(filename: string) {
    return this.http.get(environment.uiUrl +`WeatherForecast/GetFile/` + encodeURI(filename));
  }
 
}
