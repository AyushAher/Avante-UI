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
var environment_1 = require("../../environments/environment");
var _services_1 = require("../_services");
var rendercomponent_1 = require("./rendercomponent");
var modal_1 = require("ngx-bootstrap/modal");
var modelcontent_1 = require("./modelcontent");
var MasterListItemComponent = /** @class */ (function () {
    function MasterListItemComponent(formBuilder, route, router, accountService, alertService, listTypeService, notificationService, profileService, modalService) {
        this.formBuilder = formBuilder;
        this.route = route;
        this.router = router;
        this.accountService = accountService;
        this.alertService = alertService;
        this.listTypeService = listTypeService;
        this.notificationService = notificationService;
        this.profileService = profileService;
        this.modalService = modalService;
        this.loading = false;
        this.submitted = false;
        this.isSave = false;
        this.code = "";
        this.hasReadAccess = false;
        this.hasUpdateAccess = false;
        this.hasDeleteAccess = false;
        this.hasAddAccess = false;
        this.addAccess = false;
    }
    MasterListItemComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.user = this.accountService.userValue;
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            var profilePermission = this.profilePermission.permissions.filter(function (x) { return x.screenCode == "MAST"; });
            if (profilePermission.length > 0) {
                this.hasReadAccess = profilePermission[0].read;
                this.hasAddAccess = profilePermission[0].create;
                this.hasDeleteAccess = profilePermission[0].delete;
                this.hasUpdateAccess = profilePermission[0].update;
            }
        }
        if (this.user.username == "admin") {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
            this.hasUpdateAccess = true;
            this.hasReadAccess = true;
        }
        this.masterlistitemform = this.formBuilder.group({
            itemname: ['', forms_1.Validators.required],
            code: ['', forms_1.Validators.compose([forms_1.Validators.required, forms_1.Validators.minLength(2), forms_1.Validators.maxLength(5)])],
            listName: [''],
            listTypeId: [''],
            id: ['']
        });
        this.listid = this.route.snapshot.paramMap.get('id');
        if (this.listid != null) {
            this.hasAddAccess = false;
            if (this.user.username == "admin") {
                this.hasAddAccess = true;
            }
        }
        this.listTypeService.getByListId(this.listid)
            .pipe(operators_1.first())
            .subscribe({
            next: function (data) {
                _this.itemList = data.object;
                _this.masterlistitemform.get("listName").setValue(_this.itemList[0].listName);
                _this.masterlistitemform.get("listTypeId").setValue(_this.itemList[0].listTypeId);
                //  this.masterlistitemform.patchValue(this.itemList[0]);
            },
            error: function (error) {
                _this.notificationService.showError(error, "Error");
                _this.loading = false;
            }
        });
        if (this.listid == environment_1.environment.configTypeId) {
            this.addAccess = true;
        }
        this.columnDefs = this.createColumnDefs();
        //if (this.id != null) {
        //  this.listTypeService.getById(this.id)
        //    .pipe(first())
        //    .subscribe({
        //      next: (data: any) => {
        //        this.masterlistitemform.patchValue(data.object);
        //      },
        //      error: error => {
        //        
        //        this.loading = false;
        //      }
        //    });
        //}
    };
    MasterListItemComponent.prototype.open = function (param) {
        var initialState = {
            itemId: param
        };
        this.bsModalRef = this.modalService.show(modelcontent_1.ModelContentComponent, { initialState: initialState });
    };
    MasterListItemComponent.prototype.close = function () {
        alert('test');
        this.bsModalRef.hide();
    };
    MasterListItemComponent.prototype.createColumnDefs = function () {
        return [
            {
                headerName: 'Action',
                field: 'listTypeItemId',
                filter: false,
                enableSorting: false,
                editable: false,
                sortable: false,
                width: 100,
                cellRendererFramework: rendercomponent_1.MRenderComponent,
                cellRendererParams: {
                    deleteLink: 'LITYIT',
                    deleteaccess: this.hasDeleteAccess,
                    addAccess: this.addAccess,
                    hasUpdateAccess: this.hasUpdateAccess,
                },
            },
            {
                headerName: 'Item Name',
                field: 'itemname',
                filter: true,
                enableSorting: true,
                editable: false,
                sortable: true,
                tooltipField: 'itemname',
            }
        ];
    };
    MasterListItemComponent.prototype.onGridReady = function (params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
        this.api.sizeColumnsToFit();
    };
    MasterListItemComponent.prototype.onRowClicked = function (e) {
        //debugger;
        if (e.event.target !== undefined) {
            var data = e.data;
            var actionType = e.event.target.getAttribute("data-action-type");
            switch (actionType) {
                case "add":
                    this.open(data.listTypeItemId);
                case "edit":
                    this.masterlistitemform.get("id").setValue(data.listTypeItemId);
                    this.masterlistitemform.get("itemname").setValue(data.itemname); //itemCode
                    this.masterlistitemform.get("code").setValue(data.itemCode);
                    //this.masterlistitemform.get("listName").setValue(data.listName);
                    this.masterlistitemform.get("listTypeId").setValue(data.listTypeId);
                    this.id = data.listTypeItemId;
            }
        }
    };
    ;
    Object.defineProperty(MasterListItemComponent.prototype, "f", {
        // convenience getter for easy access to form fields
        get: function () { return this.masterlistitemform.controls; },
        enumerable: true,
        configurable: true
    });
    MasterListItemComponent.prototype.onSubmit = function () {
        var _this = this;
        //debugger;
        this.submitted = true;
        // reset alerts on submit
        this.alertService.clear();
        // stop here if form is invalid
        if (this.masterlistitemform.invalid) {
            return;
        }
        this.isSave = true;
        this.loading = true;
        if (this.id == null) {
            this.listTypeService.save(this.masterlistitemform.value)
                .pipe(operators_1.first())
                .subscribe({
                next: function (data) {
                    if (data.result) {
                        _this.notificationService.showSuccess(data.resultMessage, "Success");
                        _this.itemList = data.object;
                        _this.masterlistitemform.get("itemname").setValue('');
                        _this.masterlistitemform.get("code").setValue('');
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
            this.ItemData = this.masterlistitemform.value;
            this.listTypeService.update(this.id, this.ItemData)
                .pipe(operators_1.first())
                .subscribe({
                next: function (data) {
                    if (data.result) {
                        _this.notificationService.showSuccess(data.resultMessage, "Success");
                        _this.masterlistitemform.get("itemname").setValue('');
                        _this.masterlistitemform.get("code").setValue('');
                        _this.id = null;
                        _this.itemList = data.object;
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
    MasterListItemComponent = __decorate([
        core_1.Component({
            selector: 'app-masterlistitem',
            templateUrl: './masterlistitem.html',
        }),
        __metadata("design:paramtypes", [forms_1.FormBuilder,
            router_1.ActivatedRoute,
            router_1.Router,
            _services_1.AccountService,
            _services_1.AlertService,
            _services_1.ListTypeService,
            _services_1.NotificationService,
            _services_1.ProfileService,
            modal_1.BsModalService])
    ], MasterListItemComponent);
    return MasterListItemComponent;
}());
exports.MasterListItemComponent = MasterListItemComponent;
//# sourceMappingURL=masterlistitem.js.map