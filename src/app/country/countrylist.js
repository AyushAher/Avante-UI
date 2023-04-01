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
var rendercomponent_1 = require("../distributor/rendercomponent");
var CountryListComponent = /** @class */ (function () {
    function CountryListComponent(formBuilder, route, router, accountService, alertService, countryService, notificationService, profileService) {
        this.formBuilder = formBuilder;
        this.route = route;
        this.router = router;
        this.accountService = accountService;
        this.alertService = alertService;
        this.countryService = countryService;
        this.notificationService = notificationService;
        this.profileService = profileService;
        this.loading = false;
        this.submitted = false;
        this.isSave = false;
        this.hasReadAccess = false;
        this.hasUpdateAccess = false;
        this.hasDeleteAccess = false;
        this.hasAddAccess = false;
    }
    CountryListComponent.prototype.ngOnInit = function () {
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
        // this.distributorId = this.route.snapshot.paramMap.get('id');
        this.countryService.getAll()
            .pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                //debugger;
                _this.countryList = data.object;
            },
            error: function (error) {
                _this.notificationService.showError(error, "Error");
                _this.loading = false;
            }
        });
        this.columnDefs = this.createColumnDefs();
    };
    CountryListComponent.prototype.Add = function () {
        this.router.navigate(['country']);
    };
    CountryListComponent.prototype.createColumnDefs = function () {
        return [
            {
                headerName: 'Action',
                field: 'id',
                filter: false,
                enableSorting: false,
                editable: false,
                sortable: false,
                width: 100,
                cellRendererFramework: rendercomponent_1.RenderComponent,
                cellRendererParams: {
                    inRouterLink: '/country',
                    deleteLink: 'COU',
                    deleteaccess: this.hasDeleteAccess
                },
            },
            {
                headerName: 'Country Name',
                field: 'name',
                filter: true,
                enableSorting: true,
                editable: false,
                sortable: true,
                tooltipField: 'name',
            }, {
                headerName: 'ISO Code 2',
                field: 'iso_2',
                filter: true,
                editable: false,
                sortable: true,
                tooltipField: 'iso_2',
            }, {
                headerName: 'ISO Code 3',
                field: 'iso_3',
                filter: true,
                editable: false,
                sortable: true,
                tooltipField: 'iso_3',
            }
        ];
    };
    CountryListComponent.prototype.onGridReady = function (params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
        this.api.sizeColumnsToFit();
    };
    CountryListComponent = __decorate([
        core_1.Component({
            selector: 'app-countryList',
            templateUrl: './countrylist.html',
        }),
        __metadata("design:paramtypes", [forms_1.FormBuilder,
            router_1.ActivatedRoute,
            router_1.Router,
            _services_1.AccountService,
            _services_1.AlertService,
            _services_1.CountryService,
            _services_1.NotificationService,
            _services_1.ProfileService])
    ], CountryListComponent);
    return CountryListComponent;
}());
exports.CountryListComponent = CountryListComponent;
//# sourceMappingURL=countrylist.js.map