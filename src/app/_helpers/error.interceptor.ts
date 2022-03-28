import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AccountService } from '../_services';
import { LoaderService } from '../_services/loader.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService, private loaderService: LoaderService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        //start spinner
        this.loaderService.requestStarted()
        return this.handler(next, request);
    }

    handler(next, request) {
        return next.handle(request).pipe(tap((event) => {
            if (event instanceof HttpResponse) {
                //stop spinner
                this.loaderService.requestEnded()
            }
        }, (err: HttpErrorResponse) => {
            if ([401, 403].includes(err.status) && this.accountService.userValue) {
                // auto logout if 401 or 403 response returned from api
                this.accountService.logout();

                //stop spinner
                this.loaderService.requestEnded()
            }

            //stop spinner
            this.loaderService.requestEnded()

            const error = err.error?.message || err.statusText;
            console.error(err);
            return throwError(error);

        }
        ))

    }
}
