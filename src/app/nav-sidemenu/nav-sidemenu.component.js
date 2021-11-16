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
var _services_1 = require("../_services");
var NavSideMenuComponent = /** @class */ (function () {
    function NavSideMenuComponent(accountService, profileService) {
        this.accountService = accountService;
        this.profileService = profileService;
        this.hasDistributor = false;
        this.hasCustomer = false;
        this.hasInstrument = false;
        this.hasSparePart = false;
        this.hasUserProfile = false;
        this.hasProfile = false;
        this.hasCurrency = false;
        this.hasCountry = false;
        this.hasSearch = false;
        this.hasMaster = false;
        this.hasexport = false;
        this.hasTravelDetails = false;
        this.hasStayDetails = false;
        this.hasVisaDetails = false;
        this.hasLocalExpenses = false;
        this.hascustomersatisfactionsurveylist = false;
        debugger;
        this.user = this.accountService.userValue;
        this.profile = this.profileService.userProfileValue;
        if (this.profile != null) {
            if (this.profile.permissions.filter(function (x) { return x.screenCode == 'SDIST'; }).length > 0) {
                this.hasDistributor = this.profile.permissions.filter(function (x) { return x.screenCode == 'SDIST'; })[0].create == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SDIST'; })[0].update == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SDIST'; })[0].read == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SDIST'; })[0].delete == true;
            }
            if (this.profile.permissions.filter(function (x) { return x.screenCode == 'SCUST'; }).length > 0) {
                this.hasCustomer = this.profile.permissions.filter(function (x) { return x.screenCode == 'SCUST'; })[0].create == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SCUST'; })[0].update == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SCUST'; })[0].read == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SCUST'; })[0].delete == true;
            }
            if (this.profile.permissions.filter(function (x) { return x.screenCode == 'SINST'; }).length > 0) {
                this.hasInstrument = this.profile.permissions.filter(function (x) { return x.screenCode == 'SINST'; })[0].create == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SINST'; })[0].update == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SINST'; })[0].read == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SINST'; })[0].delete == true;
            }
            if (this.profile.permissions.filter(function (x) { return x.screenCode == 'SSPAR'; }).length > 0) {
                this.hasSparePart = this.profile.permissions.filter(function (x) { return x.screenCode == 'SSPAR'; })[0].create == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SSPAR'; })[0].update == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SSPAR'; })[0].read == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SSPAR'; })[0].delete == true;
            }
            if (this.profile.permissions.filter(function (x) { return x.screenCode == 'URPRF'; }).length > 0) {
                this.hasUserProfile = this.profile.permissions.filter(function (x) { return x.screenCode == 'URPRF'; })[0].create == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'URPRF'; })[0].update == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'URPRF'; })[0].read == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'URPRF'; })[0].delete == true;
            }
            if (this.profile.permissions.filter(function (x) { return x.screenCode == 'SCURR'; }).length > 0) {
                this.hasCurrency = this.profile.permissions.filter(function (x) { return x.screenCode == 'SCURR'; })[0].create == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SCURR'; })[0].update == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SCURR'; })[0].read == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SCURR'; })[0].delete == true;
            }
            if (this.profile.permissions.filter(function (x) { return x.screenCode == 'SCOUN'; }).length > 0) {
                this.hasCountry = this.profile.permissions.filter(function (x) { return x.screenCode == 'SCOUN'; })[0].create == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SCOUN'; })[0].update == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SCOUN'; })[0].read == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SCOUN'; })[0].delete == true;
            }
            if (this.profile.permissions.filter(function (x) { return x.screenCode == 'SSRCH'; }).length > 0) {
                this.hasSearch = this.profile.permissions.filter(function (x) { return x.screenCode == 'SSRCH'; })[0].create == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SSRCH'; })[0].update == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SSRCH'; })[0].read == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'SSRCH'; })[0].delete == true;
            }
            if (this.profile.permissions.filter(function (x) { return x.screenCode == 'PROF'; }).length > 0) {
                this.hasProfile = this.profile.permissions.filter(function (x) { return x.screenCode == 'PROF'; })[0].create == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'PROF'; })[0].update == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'PROF'; })[0].read == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'PROF'; })[0].delete == true;
            }
            if (this.profile.permissions.filter(function (x) { return x.screenCode == 'MAST'; }).length > 0) {
                this.hasMaster = this.profile.permissions.filter(function (x) { return x.screenCode == 'MAST'; })[0].create == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'MAST'; })[0].update == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'MAST'; })[0].read == true
                    || this.profile.permissions.filter(function (x) { return x.screenCode == 'MAST'; })[0].delete == true;
            }
            //this.hasDistributor = this.profile.Permissions
        }
        if (this.user.username == "admin") {
            this.hasDistributor = true;
            this.hasCustomer = true;
            this.hasInstrument = true;
            this.hasSparePart = true;
            this.hasUserProfile = true;
            this.hasProfile = true;
            this.hasCurrency = true;
            this.hasCountry = true;
            this.hasSearch = true;
            this.hasMaster = true;
            this.hasexport = true;
            this.hasTravelDetails = true;
            this.hasStayDetails = true;
            this.hasVisaDetails = true;
            this.hasLocalExpenses = true;
            this.hascustomersatisfactionsurveylist = true;
        }
    }
    NavSideMenuComponent = __decorate([
        core_1.Component({
            selector: 'app-nav-sidemenu',
            templateUrl: './navsidemenu.html',
        }),
        __metadata("design:paramtypes", [_services_1.AccountService,
            _services_1.ProfileService])
    ], NavSideMenuComponent);
    return NavSideMenuComponent;
}());
exports.NavSideMenuComponent = NavSideMenuComponent;
//# sourceMappingURL=nav-sidemenu.component.js.map