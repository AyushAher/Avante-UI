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
var operators_1 = require("rxjs/operators");
var _services_1 = require("../_services");
var RenderComponent = /** @class */ (function () {
    function RenderComponent(distributorService, distributorRegionService, alertService, contactService, custsiteService, sparepartService, instrumnetservice, customerservice, notificationService, profileService, userprofileService, currencyService, countryService, listTypeService) {
        this.distributorService = distributorService;
        this.distributorRegionService = distributorRegionService;
        this.alertService = alertService;
        this.contactService = contactService;
        this.custsiteService = custsiteService;
        this.sparepartService = sparepartService;
        this.instrumnetservice = instrumnetservice;
        this.customerservice = customerservice;
        this.notificationService = notificationService;
        this.profileService = profileService;
        this.userprofileService = userprofileService;
        this.currencyService = currencyService;
        this.countryService = countryService;
        this.listTypeService = listTypeService;
    }
    RenderComponent.prototype.agInit = function (params) {
        // //debugger;
        this.params = params;
    };
    RenderComponent.prototype.refresh = function (params) {
        return false;
    };
    RenderComponent.prototype.delete = function (params) {
        var _this = this;
        // //debugger;
        if (confirm("Are you sure, you want to delete the record?") == true) {
            if (params.deleteLink == "D") {
                //debugger;
                this.distributorService.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        //debugger;
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        // this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "DR") {
                this.distributorRegionService.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        // this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "C") {
                this.contactService.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        // this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "CU") {
                this.customerservice.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        //this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "CS") {
                this.custsiteService.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        // this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "I") {
                this.instrumnetservice.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        // this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "S") {
                this.sparepartService.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        // this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "P") {
                this.profileService.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        // this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "CUR") {
                this.currencyService.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        //debugger;
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        // this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "COU") {
                this.countryService.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "UP") {
                this.userprofileService.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        // this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
            else if (params.deleteLink == "LITYIT") {
                this.listTypeService.delete(params.value)
                    .pipe(operators_1.first())
                    .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            var selectedData = params.api.getSelectedRows();
                            params.api.applyTransaction({ remove: selectedData });
                        }
                        else {
                            _this.notificationService.showError(data.resultMessage, "Error");
                        }
                    },
                    error: function (error) {
                        // this.alertService.error(error);
                        _this.notificationService.showError(error, "Error");
                    }
                });
            }
        }
    };
    RenderComponent = __decorate([
        core_1.Component({
            template: "<a [routerLink]=\"[params.inRouterLink,params.value]\"  style=\"margin-right: 10px;\"><i class=\"fas fa-pen\" title=\"Edit\"></i></a>\n<button class=\"btn btn-link\" *ngIf=\"params.deleteaccess\" (click)=\"delete(params)\"><i class=\"fas fa-trash-alt\" title=\"Delete\"></i></button>"
        }),
        __metadata("design:paramtypes", [_services_1.DistributorService,
            _services_1.DistributorRegionService,
            _services_1.AlertService,
            _services_1.ContactService,
            _services_1.CustomerSiteService,
            _services_1.SparePartService,
            _services_1.InstrumentService,
            _services_1.CustomerService,
            _services_1.NotificationService,
            _services_1.ProfileService,
            _services_1.UserProfileService,
            _services_1.CurrencyService,
            _services_1.CountryService,
            _services_1.ListTypeService])
    ], RenderComponent);
    return RenderComponent;
}());
exports.RenderComponent = RenderComponent;
//# sourceMappingURL=rendercomponent.js.map