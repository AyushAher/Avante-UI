import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AccountService, NotificationService } from '../_services';
import { LoaderService } from '../_services/loader.service';
import { EnvService } from '../_services/env/env.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private accountService: AccountService,
        private loaderService: LoaderService,
        private notificationService: NotificationService,
        private environment: EnvService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        //start spinner

        this.loaderService.requestStarted()
        if (request.url.startsWith(this.environment.currencyConvert)) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Basic ${btoa("ayushaher494865898:kd0t5dra52rsc50jp4d13642g6")}`
                }
            });
        }

        return this.handler(next, request);
    }

    handler(next, request: HttpRequest<any>) {
        return next.handle(request).pipe(tap((event) => {
            if (event instanceof HttpResponse) {

                // if ((request.method == "POST" || request.method == "PUT") && event.body?.result) {
                //     this.notificationService.SetNavParam();
                // }
                //stop spinner
                this.loaderService.requestEnded()
            }
        }, (err: HttpErrorResponse) => {
            if ([401, 403].includes(err.status) && this.accountService.userValue) {
                // auto logout if 401 or 403 response returned from api
                this.accountService.logout();

                //stop spinner
                this.loaderService.requestEnded()
                this.notificationService.showError("Some Error Occured. Please Login again.", "Error")
            }

            //stop spinner
            this.loaderService.requestEnded()

            const error = err.error?.message || err.statusText;
            console.error(err);
            this.notificationService.showError("Some error ocurred. Please contact system administrator.", "Error")
        }
        ))

    }
}
