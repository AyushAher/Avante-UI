import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private ContactSubject: BehaviorSubject<Country>;
  public contact: Observable<Country>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {

  }

  upload(file: File) {
    const formData: FormData = new FormData();

    formData.append('file', file);
    return this.http.post(this.environment.uiUrl + `WeatherForecast/` + file.name, formData);
  }

  uploadPdf(file: File[]) {
    const formData: FormData = new FormData();
    for (var i = 0; i < file.length; ++i) {
      formData.append('files', file[i]);
    }
    return this.http.post(this.environment.uiUrl + `WeatherForecast/UploadPdfFile/`, formData);
  }

  getFile(filename: string) {
    return this.http.get(this.environment.uiUrl + `WeatherForecast/GetFile/` + encodeURI(filename));
  }

}
