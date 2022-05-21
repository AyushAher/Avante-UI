/// <reference path="../../environments/environment.ts" />
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../_services';
import { EnvService } from '../_services/env/env.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private accountService: AccountService,
    private environment: EnvService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add auth header with jwt if user is logged in and request is to the api url
    const user = this.accountService.userValue;
    const zohotoken = this.accountService.zohoauthValue;
    const isLoggedIn = user && user.token;
    const isApiUrl = request.url.startsWith(this.environment.apiUrl);
    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${user.token}`
        }
      });
    }
    else {
      if (request.url.startsWith("https://accounts.zoho.com")) {
        request = request;
      }
      else if (request.url.startsWith(this.environment.bookapi)) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${zohotoken}`
          }
        });
      }
    }

    return next.handle(request);
  }
}
