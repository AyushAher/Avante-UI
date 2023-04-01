"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var forms_1 = require("@angular/forms");
var operators_1 = require("rxjs/operators");
var _services_1 = require("../_services");
var CountryComponent = /** @class */ (function () {
    function CountryComponent(formBuilder, route, router, accountService, alertService, countryService, currencyService, listTypeService, notificationService, profileService) {
        this.formBuilder = formBuilder;
        this.route = route;
        this.router = router;
        this.accountService = accountService;
        this.alertService = alertService;
        this.countryService = countryService;
        this.currencyService = currencyService;
        this.listTypeService = listTypeService;
        this.notificationService = notificationService;
        this.profileService = profileService;
        this.loading = false;
        this.submitted = false;
        this.isSave = false;
        this.code = "CONTI";
        this.hasReadAccess = false;
        this.hasUpdateAccess = false;
        this.hasDeleteAccess = false;
        this.hasAddAccess = false;
    }
    CountryComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.user = this.accountService.userValue;
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            var profilePermission = this.profilePermission.permissions.filter(function (x) { return x.screenCode == "SCOUN"; });
            if (profilePermission.length > 0) {
                this.hasReadAccess = profilePermission[0].read;
                this.hasAddAccess = profilePermission[0].create;
                this.hasDeleteAccess = profilePermission[0].delete;
                this.hasUpdateAccess = profilePermission[0].update;
            }
        }
        if (this.user.isAdmin) {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
            this.hasUpdateAccess = true;
            this.hasReadAccess = true;
        }
        this.countryform = this.formBuilder.group({
            name: ['', forms_1.Validators.required],
            iso_2: ['', forms_1.Validators.required],
            iso_3: ['', forms_1.Validators.required],
            formal: [''],
            region: ['', forms_1.Validators.required],
            sub_Region: [''],
            capital: [''],
            continentid: ['', forms_1.Validators.required],
            currencyid: ['', forms_1.Validators.required]
        });
        this.currencyService.getAll()
            .pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                _this.currency = data.object;
            },
            error: function (error) {
                _this.notificationService.showError(error, "Error");
                _this.loading = false;
            }
        });
        this.listTypeService.getById(this.code)
            .pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                _this.continents = data;
            },
            error: function (error) {
                _this.notificationService.showError(error, "Error");
                _this.loading = false;
            }
        });
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id != null) {
            this.hasAddAccess = false;
            if (this.user.isAdmin) {
                this.hasAddAccess = true;
            }
            this.countryService.getById(this.id)
                .pipe(operators_1.first())
                .subscribe({
                next: function (data) {
                    _this.countryform.patchValue(data.object);
                },
                error: function (error) {
                    _this.notificationService.showError(error, "Error");
                    _this.loading = false;
                }
            });
        }
    };
    Object.defineProperty(CountryComponent.prototype, "f", {
        // convenience getter for easy access to form fields
        get: function () { return this.countryform.controls; },
        enumerable: true,
        configurable: true
    });
    CountryComponent.prototype.onSubmit = function () {
        var _this = this;
        //debugger;
        this.submitted = true;
        // reset alerts on submit
        this.alertService.clear();
        // stop here if form is invalid
        if (this.countryform.invalid) {
            return;
        }
        this.isSave = true;
        this.loading = true;
        if (this.id == null) {
            this.countryService.save(this.countryform.value)
                .pipe(operators_1.first())
                .subscribe({
                next: function (data) {
                    if (data.result) {
                        _this.notificationService.showSuccess(data.resultMessage, "Success");
                        _this.router.navigate(['countrylist']);
                    }
                    else {
                        _this.notificationService.showError(data.resultMessage, "Error");
                    }
                    _this.loading = false;
                },
                error: function (error) {
                    _this.notificationService.showError(error, "Error");
                    _this.loading = false;
                }
            });
        }
        else {
            this.country = this.countryform.value;
            this.country.id = this.id;
            this.countryService.update(this.id, this.country)
                .pipe(operators_1.first())
                .subscribe({
                next: function (data) {
                    if (data.result) {
                        _this.notificationService.showSuccess(data.resultMessage, "Success");
                        _this.router.navigate(['countrylist']);
                    }
                    else {
                        _this.notificationService.showError(data.resultMessage, "Error");
                    }
                    _this.loading = false;
                },
                error: function (error) {
                    _this.notificationService.showError(error, "Error");
                    _this.loading = false;
                }
            });
        }
    };
    CountryComponent = __decorate([
        core_1.Component({
            selector: 'app-country',
            templateUrl: './country.html',
        }),
        __metadata("design:paramtypes", [forms_1.FormBuilder,
            router_1.ActivatedRoute,
            router_1.Router,
            _services_1.AccountService,
            _services_1.AlertService,
            _services_1.CountryService,
            _services_1.CurrencyService,
            _services_1.ListTypeService,
            _services_1.NotificationService,
            _services_1.ProfileService])
    ], CountryComponent);
    return CountryComponent;
}());
exports.CountryComponent = CountryComponent;
//# sourceMappingURL=country.js.map