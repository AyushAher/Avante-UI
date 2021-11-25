/// <reference path="../../environments/environment.ts" />
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AccountService } from '../_services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to the api url
      const user = this.accountService.userValue;
      const zohotoken = this.accountService.zohoauthValue;
        const isLoggedIn = user && user.token;
        const isApiUrl = request.url.startsWith(environment.apiUrl);
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
        else if (request.url.startsWith(environment.bookapi)) {
          request = request.clone({
            setHeaders: {
              Authorization: `Zoho-oauthtoken ${zohotoken}`
            }
          });
        }
      }

        return next.handle(request);
    }
}