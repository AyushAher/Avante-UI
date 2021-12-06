(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["account-account-module"],{

/***/ "952/":
/*!***************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/account/register.component.html ***!
  \***************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<div class=\"card\">\r\n    <h4 class=\"card-header\">Register</h4>\r\n    <div class=\"card-body\">\r\n        <form [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\">\r\n            <div class=\"form-group\">\r\n                <label for=\"firstName\">First Name</label>\r\n                <input type=\"text\" formControlName=\"firstName\" class=\"form-control\" [ngClass]=\"{ 'is-invalid': submitted && f.firstName.errors }\" />\r\n                <div *ngIf=\"submitted && f.firstName.errors\" class=\"invalid-feedback\">\r\n                    <div *ngIf=\"f.firstName.errors.required\">First Name is required</div>\r\n                </div>\r\n            </div>\r\n            <div class=\"form-group\">\r\n                <label for=\"lastName\">Last Name</label>\r\n                <input type=\"text\" formControlName=\"lastName\" class=\"form-control\" [ngClass]=\"{ 'is-invalid': submitted && f.lastName.errors }\" />\r\n                <div *ngIf=\"submitted && f.lastName.errors\" class=\"invalid-feedback\">\r\n                    <div *ngIf=\"f.lastName.errors.required\">Last Name is required</div>\r\n                </div>\r\n            </div>\r\n            <div class=\"form-group\">\r\n                <label for=\"username\">Username</label>\r\n                <input type=\"text\" formControlName=\"username\" class=\"form-control\" [ngClass]=\"{ 'is-invalid': submitted && f.username.errors }\" />\r\n                <div *ngIf=\"submitted && f.username.errors\" class=\"invalid-feedback\">\r\n                    <div *ngIf=\"f.username.errors.required\">Username is required</div>\r\n                </div>\r\n            </div>\r\n            <div class=\"form-group\">\r\n                <label for=\"password\">Password</label>\r\n                <input type=\"password\" formControlName=\"password\" class=\"form-control\" [ngClass]=\"{ 'is-invalid': submitted && f.password.errors }\" />\r\n                <div *ngIf=\"submitted && f.password.errors\" class=\"invalid-feedback\">\r\n                    <div *ngIf=\"f.password.errors.required\">Password is required</div>\r\n                    <div *ngIf=\"f.password.errors.minlength\">Password must be at least 6 characters</div>\r\n                </div>\r\n            </div>\r\n            <div class=\"form-group\">\r\n                <button [disabled]=\"loading\" class=\"btn btn-primary\">\r\n                    <span *ngIf=\"loading\" class=\"spinner-border spinner-border-sm mr-1\"></span>\r\n                    Register\r\n                </button>\r\n                <a routerLink=\"../login\" class=\"btn btn-link\">Cancel</a>\r\n            </div>\r\n        </form>\r\n    </div>\r\n</div>");

/***/ }),

/***/ "CKnY":
/*!*********************************************!*\
  !*** ./src/app/account/layout.component.ts ***!
  \*********************************************/
/*! exports provided: LayoutComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LayoutComponent", function() { return LayoutComponent; });
/* harmony import */ var _raw_loader_layout_component_html__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! raw-loader!./layout.component.html */ "LCmf");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../_services */ "J9tS");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




let LayoutComponent = class LayoutComponent {
    constructor(router, accountService) {
        this.router = router;
        this.accountService = accountService;
        //debugger;
        // redirect to home if already logged in
        if (this.accountService.userValue) {
            this.router.navigate(['/']);
        }
    }
};
LayoutComponent.ctorParameters = () => [
    { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] },
    { type: _services__WEBPACK_IMPORTED_MODULE_3__["AccountService"] }
];
LayoutComponent = __decorate([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({ template: _raw_loader_layout_component_html__WEBPACK_IMPORTED_MODULE_0__["default"] }),
    __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
        _services__WEBPACK_IMPORTED_MODULE_3__["AccountService"]])
], LayoutComponent);



/***/ }),

/***/ "LCmf":
/*!*************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/account/layout.component.html ***!
  \*************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<div class=\"bg-gradient-primary\">\r\n  <router-outlet></router-outlet>\r\n  <footer class=\"py-4 bg-light mt-auto\">\r\n    <div class=\"container-fluid\">\r\n      <div class=\"d-flex align-items-center justify-content-between small\">\r\n        <div class=\"text-muted\">Copyright &copy; Avante 2021</div>\r\n        <div><a href=\"#\">Privacy Policy &middot;</a><a href=\"#\">Terms &amp; Conditions</a></div>\r\n      </div>\r\n    </div>\r\n  </footer>\r\n</div>\r\n\r\n\r\n");

/***/ }),

/***/ "YF+o":
/*!********************************************!*\
  !*** ./src/app/account/login.component.ts ***!
  \********************************************/
/*! exports provided: LoginComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginComponent", function() { return LoginComponent; });
/* harmony import */ var _raw_loader_login_component_html__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! raw-loader!./login.component.html */ "kXUf");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _services__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../_services */ "J9tS");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






let LoginComponent = class LoginComponent {
    constructor(formBuilder, route, router, accountService, alertService, notificationService) {
        this.formBuilder = formBuilder;
        this.route = route;
        this.router = router;
        this.accountService = accountService;
        this.alertService = alertService;
        this.notificationService = notificationService;
        this.loading = false;
        this.submitted = false;
    }
    ngOnInit() {
        //debugger;
        if (localStorage.getItem('user') !== null) {
            localStorage.removeItem('user');
            localStorage.removeItem('userprofile');
        }
        this.form = this.formBuilder.group({
            username: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required],
            password: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required]
        });
    }
    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }
    onSubmit() {
        this.submitted = true;
        // reset alerts on submit
        this.alertService.clear();
        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }
        this.loading = true;
        this.accountService.login(this.f.username.value, this.f.password.value)
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["first"])())
            .subscribe({
            next: () => {
                // get return url from query parameters or default to home page
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                this.router.navigateByUrl(returnUrl);
            },
            error: error => {
                this.notificationService.showError(error, "Error");
                this.loading = false;
            }
        });
    }
};
LoginComponent.ctorParameters = () => [
    { type: _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormBuilder"] },
    { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"] },
    { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] },
    { type: _services__WEBPACK_IMPORTED_MODULE_5__["AccountService"] },
    { type: _services__WEBPACK_IMPORTED_MODULE_5__["AlertService"] },
    { type: _services__WEBPACK_IMPORTED_MODULE_5__["NotificationService"] }
];
LoginComponent = __decorate([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({ template: _raw_loader_login_component_html__WEBPACK_IMPORTED_MODULE_0__["default"] }),
    __metadata("design:paramtypes", [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormBuilder"],
        _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"],
        _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
        _services__WEBPACK_IMPORTED_MODULE_5__["AccountService"],
        _services__WEBPACK_IMPORTED_MODULE_5__["AlertService"],
        _services__WEBPACK_IMPORTED_MODULE_5__["NotificationService"]])
], LoginComponent);



/***/ }),

/***/ "jcJX":
/*!*******************************************!*\
  !*** ./src/app/account/account.module.ts ***!
  \*******************************************/
/*! exports provided: AccountModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AccountModule", function() { return AccountModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _account_routing_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./account-routing.module */ "sGj0");
/* harmony import */ var _layout_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./layout.component */ "CKnY");
/* harmony import */ var _login_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./login.component */ "YF+o");
/* harmony import */ var _register_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./register.component */ "q8HH");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};







let AccountModule = class AccountModule {
};
AccountModule = __decorate([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
        imports: [
            _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
            _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ReactiveFormsModule"],
            _account_routing_module__WEBPACK_IMPORTED_MODULE_3__["AccountRoutingModule"],
        ],
        declarations: [
            _layout_component__WEBPACK_IMPORTED_MODULE_4__["LayoutComponent"],
            _login_component__WEBPACK_IMPORTED_MODULE_5__["LoginComponent"],
            _register_component__WEBPACK_IMPORTED_MODULE_6__["RegisterComponent"]
        ]
    })
], AccountModule);



/***/ }),

/***/ "kXUf":
/*!************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/account/login.component.html ***!
  \************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<div class=\"container\">\r\n  <div class=\"row justifylogin-content-center\">\r\n\r\n    <div class=\"col-xl-10 col-lg-12 col-md-9\">\r\n      <div class=\"card o-hidden border-0 shadow-lg my-5\">\r\n        <div class=\"card-body p-0\" style=\"height:76vh\">\r\n          <!-- Nested Row within Card Body -->\r\n          <div class=\"row\" style=\"height:76vh\">\r\n            <div class=\"col-lg-8 d-none d-lg-block bg-login-image\">\r\n             \r\n            </div>\r\n            <div class=\"col-lg-4\">\r\n              <div style=\"float:right;margin-top:20px;margin-right:10px;\">\r\n                <img src=\"assets/img/1_Avante_ Logo.png\" style=\"width:166px\" />\r\n              </div>\r\n              <br />\r\n              <br />\r\n              <br />\r\n              <div class=\"p-5\">\r\n                <div class=\"text-center\">\r\n                  <h1 class=\"h4 text-gray-900 mb-4\"></h1>\r\n                </div>\r\n                <form class=\"user\" [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\">\r\n\r\n                  <br />\r\n                  <div class=\"form-group\">\r\n                    <label for=\"username\">Username</label>\r\n                    <input type=\"text\" formControlName=\"username\" class=\"form-control\" [ngClass]=\"{ 'is-invalid': submitted && f.username.errors }\" />\r\n                    <div *ngIf=\"submitted && f.username.errors\" class=\"invalid-feedback\">\r\n                      <div *ngIf=\"f.username.errors.required\">Username is required</div>\r\n                    </div>\r\n                  </div>\r\n                  <div class=\"form-group\">\r\n                    <label for=\"password\">Password</label>\r\n                    <input type=\"password\" formControlName=\"password\" class=\"form-control\" [ngClass]=\"{ 'is-invalid': submitted && f.password.errors }\" />\r\n                    <div *ngIf=\"submitted && f.password.errors\" class=\"invalid-feedback\">\r\n                      <div *ngIf=\"f.password.errors.required\">Password is required</div>\r\n                    </div>\r\n                  </div>\r\n                  <div class=\"form-group\">\r\n                    <button [disabled]=\"loading\" class=\"btn btn-primary\">\r\n                      <span *ngIf=\"loading\" class=\"spinner-border spinner-border-sm mr-1\"></span>\r\n                      Login\r\n                    </button>\r\n                  </div>\r\n                  <div class=\"form-group\">\r\n                  </div>\r\n                  <!--<hr>-->\r\n                </form>\r\n\r\n                <div class=\"text-center\">\r\n                  <!--<a class=\"small\"  routerLink=\"../register\">Create an Account!</a>-->\r\n                </div>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n\r\n    </div>\r\n\r\n  </div>\r\n</div>\r\n");

/***/ }),

/***/ "q8HH":
/*!***********************************************!*\
  !*** ./src/app/account/register.component.ts ***!
  \***********************************************/
/*! exports provided: RegisterComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RegisterComponent", function() { return RegisterComponent; });
/* harmony import */ var _raw_loader_register_component_html__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! raw-loader!./register.component.html */ "952/");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _services__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../_services */ "J9tS");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






let RegisterComponent = class RegisterComponent {
    constructor(formBuilder, route, router, accountService, alertService) {
        this.formBuilder = formBuilder;
        this.route = route;
        this.router = router;
        this.accountService = accountService;
        this.alertService = alertService;
        this.loading = false;
        this.submitted = false;
    }
    ngOnInit() {
        this.form = this.formBuilder.group({
            firstName: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required],
            lastName: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required],
            username: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required],
            password: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].minLength(6)]]
        });
    }
    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }
    onSubmit() {
        this.submitted = true;
        // reset alerts on submit
        this.alertService.clear();
        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }
        this.loading = true;
        this.accountService.register(this.form.value)
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["first"])())
            .subscribe({
            next: () => {
                this.alertService.success('Registration successful', { keepAfterRouteChange: true });
                this.router.navigate(['../login'], { relativeTo: this.route });
            },
            error: error => {
                this.alertService.error(error);
                this.loading = false;
            }
        });
    }
};
RegisterComponent.ctorParameters = () => [
    { type: _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormBuilder"] },
    { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"] },
    { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] },
    { type: _services__WEBPACK_IMPORTED_MODULE_5__["AccountService"] },
    { type: _services__WEBPACK_IMPORTED_MODULE_5__["AlertService"] }
];
RegisterComponent = __decorate([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({ template: _raw_loader_register_component_html__WEBPACK_IMPORTED_MODULE_0__["default"] }),
    __metadata("design:paramtypes", [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormBuilder"],
        _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"],
        _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
        _services__WEBPACK_IMPORTED_MODULE_5__["AccountService"],
        _services__WEBPACK_IMPORTED_MODULE_5__["AlertService"]])
], RegisterComponent);



/***/ }),

/***/ "sGj0":
/*!***************************************************!*\
  !*** ./src/app/account/account-routing.module.ts ***!
  \***************************************************/
/*! exports provided: AccountRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AccountRoutingModule", function() { return AccountRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _layout_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./layout.component */ "CKnY");
/* harmony import */ var _login_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./login.component */ "YF+o");
/* harmony import */ var _register_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./register.component */ "q8HH");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





const routes = [
    {
        path: '', component: _layout_component__WEBPACK_IMPORTED_MODULE_2__["LayoutComponent"],
        children: [
            { path: 'login', component: _login_component__WEBPACK_IMPORTED_MODULE_3__["LoginComponent"] },
            { path: 'register', component: _register_component__WEBPACK_IMPORTED_MODULE_4__["RegisterComponent"] }
        ]
    }
];
let AccountRoutingModule = class AccountRoutingModule {
};
AccountRoutingModule = __decorate([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
        imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes)],
        exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]]
    })
], AccountRoutingModule);



/***/ })

}]);
//# sourceMappingURL=account-account-module-es2015.js.map