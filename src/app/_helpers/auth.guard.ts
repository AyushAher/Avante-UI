import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationStart, ActivatedRoute, Route } from '@angular/router';

import { AccountService, NotificationService } from '../_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) { }

    canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const user = this.accountService.userValue;
        if (user) {
            // authorised so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}

@Injectable({ providedIn: 'root' })
export class TextValidator implements CanActivate {
    constructor(
        private notificationService: NotificationService
    ) { }

    canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
        setTimeout(() => {
            this.notificationService.ValidateTextInputFields();
        }, 3000);
        return true;
    }
}

@Injectable({ providedIn: 'root' })
export class BrowserBack implements CanActivate {

    constructor(router: Router) {
        router.events
            .subscribe((event: NavigationStart) => {
                debugger;
                if (event.navigationTrigger === 'popstate' || event.navigationTrigger === "imperative") {
                    const currentRoute = router.routerState;
                    const isNotSafeNavigation = currentRoute.snapshot.url.includes('isNSNav=false');
                    if(isNotSafeNavigation)
                    {
                        if (!confirm("You are about to navigate away from the page. Your changes will be discarded. Please confrim.")) {
                            router.navigateByUrl(currentRoute.snapshot.url, { skipLocationChange: true });
                        }
                    }
                }
            });
    }

    canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
        return true;
    }
}

