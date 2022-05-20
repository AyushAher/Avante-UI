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
var XLSX = require("xlsx");
var ExportSparePartComponent = /** @class */ (function () {
    function ExportSparePartComponent(formBuilder, route, router, accountService, alertService, countryService, sparePartService, currencyService, listTypeService, uploadService, notificationService, profileService, configService) {
        this.formBuilder = formBuilder;
        this.route = route;
        this.router = router;
        this.accountService = accountService;
        this.alertService = alertService;
        this.countryService = countryService;
        this.sparePartService = sparePartService;
        this.currencyService = currencyService;
        this.listTypeService = listTypeService;
        this.uploadService = uploadService;
        this.notificationService = notificationService;
        this.profileService = profileService;
        this.configService = configService;
        this.loading = false;
        this.submitted = false;
        this.isSave = false;
        //configValueAllList: ConfigTypeValue[];
        this.fileName = 'ExcelSheet.xlsx';
    }
    ExportSparePartComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.user = this.accountService.userValue;
        this.listTypeService.getById("CONTY")
            .pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                _this.listTypeItems = data;
            },
            error: function (error) {
                _this.notificationService.showError(error, "Error");
                _this.loading = false;
            }
        });
        this.countryService.getAll()
            .pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                _this.countries = data.object;
            },
            error: function (error) {
                _this.notificationService.showError(error, "Error");
                _this.loading = false;
            }
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
        this.listTypeService.getById("PART")
            .pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                _this.parttypes = data;
            },
            error: function (error) {
                _this.notificationService.showError(error, "Error");
                _this.loading = false;
            }
        });
        this.configService.getAll()
            .pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                _this.configValueAllList = data.object;
            },
            error: function (error) {
                _this.notificationService.showError(error, "Error");
                _this.loading = false;
            }
        });
    };
    ExportSparePartComponent.prototype.onConfigChange = function (param) {
        var _this = this;
        this.configService.getById(param)
            .pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                _this.configValueList = data.object;
            },
            error: function (error) {
                _this.notificationService.showError(error, "Error");
                _this.loading = false;
            }
        });
    };
    ExportSparePartComponent.prototype.onDropdownChange = function (value, configvalue) {
        var _this = this;
        //debugger;
        if (configvalue == "0") {
            configvalue = "";
        }
        // for (let i = 0; i < this.selectedConfigType.length; i++) {
        this.sparePartService.getByConfignValueId(value, configvalue)
            .pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                if (data.object.length > 0) {
                    _this.exportSparePart = data.object;
                    _this.exportexcel(data.object);
                }
            },
            error: function (error) {
                _this.notificationService.showError(error, "Error");
                _this.loading = false;
            }
        });
        // }
    };
    ExportSparePartComponent.prototype.exportexcel = function (data) {
        /* table id is passed over here */
        //   let element = document.getElementById('excel-table');
        data = data.filter(function (props) {
            // delete props.id;
            delete props.configTypeid;
            delete props.configValueid;
            delete props.partType;
            delete props.countryid;
            delete props.currencyid;
            delete props.image;
            delete props.replacepPartNoId;
            return true;
        });
        var ws = XLSX.utils.json_to_sheet(data);
        var ws1 = XLSX.utils.json_to_sheet(this.countries);
        var ws2 = XLSX.utils.json_to_sheet(this.parttypes);
        var ws3 = XLSX.utils.json_to_sheet(this.currency);
        var ws4 = XLSX.utils.json_to_sheet(this.listTypeItems);
        var ws5 = XLSX.utils.json_to_sheet(this.configValueAllList);
        //this.listTypeItems
        /* generate workbook and add the worksheet */
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.utils.book_append_sheet(wb, ws1, 'Country');
        XLSX.utils.book_append_sheet(wb, ws2, 'PartType');
        XLSX.utils.book_append_sheet(wb, ws3, 'Currency');
        XLSX.utils.book_append_sheet(wb, ws4, 'ConfigType');
        XLSX.utils.book_append_sheet(wb, ws5, 'ConfigValue');
        /* save to file */
        XLSX.writeFile(wb, this.fileName);
    };
    ExportSparePartComponent.prototype.uploadFile = function (event) {
        var _this = this;
        //debugger;
        var file = event.files[0];
        if (event.files && event.files[0]) {
            this.sparePartService.uploadSparePart(file)
                .pipe(operators_1.first())
                .subscribe({
                next: function (data) {
                    //debugger;
                    if (data.result == true) {
                        // this.alertService.success('File Upload Successfully.');
                        _this.notificationService.showSuccess("File Upload Successfully", "Success");
                    }
                    else {
                        _this.notificationService.showError(data.resultMessage, "Error");
                    }
                    // this.imagePath = data.path;
                },
                error: function (error) {
                    _this.notificationService.showError(error, "Error");
                }
            });
        }
    };
    ExportSparePartComponent = __decorate([
        core_1.Component({
            selector: 'app-sparepart',
            templateUrl: './export.html',
        }),
        __metadata("design:paramtypes", [forms_1.FormBuilder,
            router_1.ActivatedRoute,
            router_1.Router,
            _services_1.AccountService,
            _services_1.AlertService,
            _services_1.CountryService,
            _services_1.SparePartService,
            _services_1.CurrencyService,
            _services_1.ListTypeService,
            _services_1.UploadService,
            _services_1.NotificationService,
            _services_1.ProfileService,
            _services_1.ConfigTypeValueService])
    ], ExportSparePartComponent);
    return ExportSparePartComponent;
}());
exports.ExportSparePartComponent = ExportSparePartComponent;
//# sourceMappingURL=export.js.map