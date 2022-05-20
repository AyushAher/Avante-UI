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
var rendercomponent_1 = require("./rendercomponent");
var modal_1 = require("ngx-bootstrap/modal");
var ModelContentComponent = /** @class */ (function () {
    function ModelContentComponent(formBuilder, route, router, accountService, configTypeService, listTypeService, notificationService, profileService, activeModal) {
        this.formBuilder = formBuilder;
        this.route = route;
        this.router = router;
        this.accountService = accountService;
        this.configTypeService = configTypeService;
        this.listTypeService = listTypeService;
        this.notificationService = notificationService;
        this.profileService = profileService;
        this.activeModal = activeModal;
        this.loading = false;
        this.submitted = false;
        this.isSave = false;
    }
    ModelContentComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.user = this.accountService.userValue;
        this.listvalue = this.formBuilder.group({
            configValue: ['', forms_1.Validators.required],
            id: ['']
        });
        //debugger;
        this.configTypeService.getById(this.itemId)
            .pipe(operators_1.first())
            .subscribe({
                next: function (data) {
                    //debugger;
                    _this.configList = data.object;
                    //this.listvalue.get("configValue").setValue(data.object[0].configValue);
                    //this.id = data.object[0].id;
                    //  this.masterlistitemform.patchValue(this.itemList[0]);
                },
                error: function (error) {
                    _this.notificationService.showError(error, "Error");
                    _this.loading = false;
                }
            });
        this.columnDefs = this.createColumnDefs();
    };
    ModelContentComponent.prototype.onRowClicked = function (e) {
        //debugger;
        if (e.event.target !== undefined) {
            var data = e.data;
            var actionType = e.event.target.getAttribute("data-action-type");
            switch (actionType) {
                case "edit":
                    this.listvalue.get("id").setValue(data.id);
                    this.listvalue.get("configValue").setValue(data.configValue); //itemCode  
                    this.id = data.id;
            }
        }
    };
    ;
    //open(content) {
    //  this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
    //    this.closeResult = `Closed with: ${result}`;
    //  }, (reason) => {
    //    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //  });
    //}
    //private getDismissReason(reason: any): string {
    //  if (reason === ModalDismissReasons.ESC) {
    //    return 'by pressing ESC';
    //  } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
    //    return 'by clicking on a backdrop';
    //  } else {
    //    return `with: ${reason}`;
    //  }
    //}
    ModelContentComponent.prototype.close = function () {
        //alert('test cholde');
        this.activeModal.hide();
    };
    ModelContentComponent.prototype.onValueSubmit = function () {
        //debugger;
        var _this = this;
        this.submitted = true;
        this.isSave = true;
        this.loading = true;
        if (this.listvalue.invalid) {
            return;
        }
        this.configVal = this.listvalue.value;
        this.configVal.listTypeItemId = this.itemId;
        //if (this.id == null) {
        if (this.id == null) {
            this.configTypeService.save(this.configVal)
                .pipe(operators_1.first())
                .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            _this.configList = data.object;
                            _this.listvalue.get("configValue").setValue("");
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
            this.configTypeService.update(this.id, this.configVal)
                .pipe(operators_1.first())
                .subscribe({
                    next: function (data) {
                        if (data.result) {
                            _this.notificationService.showSuccess(data.resultMessage, "Success");
                            _this.configList = data.object;
                            _this.listvalue.get("configValue").setValue("");
                            _this.id = null;
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
    ModelContentComponent.prototype.createColumnDefs = function () {
        return [
            {
                headerName: 'Action',
                field: 'id',
                filter: false,
                enableSorting: false,
                editable: false,
                sortable: false,
                width: 100,
                cellRendererFramework: rendercomponent_1.MRenderComponent,
                cellRendererParams: {
                    deleteLink: 'CNG',
                    deleteaccess: true,
                    addAccess: false,
                    hasUpdateAccess: true,
                },
            },
            {
                headerName: 'Config Value',
                field: 'configValue',
                filter: true,
                enableSorting: true,
                editable: false,
                sortable: true,
                tooltipField: 'configValue',
            }
        ];
    };
    ModelContentComponent.prototype.onGridReady = function (params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
        this.api.sizeColumnsToFit();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], ModelContentComponent.prototype, "itemId", void 0);
    ModelContentComponent = __decorate([
        core_1.Component({
            selector: 'app-modelcomponent',
            templateUrl: './modelcontent.html',
        }),
        __metadata("design:paramtypes", [forms_1.FormBuilder,
        router_1.ActivatedRoute,
        router_1.Router,
        _services_1.AccountService,
        _services_1.ConfigTypeValueService,
        _services_1.ListTypeService,
        _services_1.NotificationService,
        _services_1.ProfileService,
        modal_1.BsModalService])
    ], ModelContentComponent);
    return ModelContentComponent;
}());
exports.ModelContentComponent = ModelContentComponent;
//# sourceMappingURL=modelcontent.js.map