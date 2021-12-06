import {Component, OnInit} from '@angular/core';

import {ListTypeItem, ProfileReadOnly, User} from '../_models';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';
import {ColDef, ColumnApi, GridApi} from 'ag-grid-community';
import {AccountService, AlertService, ListTypeService, NotificationService, ProfileService} from '../_services';
import {MRenderComponent} from './rendercomponent';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {ModelContentComponent} from './modelcontent';
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-masterlistitem',
  templateUrl: './masterlistitem.html',
})
export class MasterListItemComponent implements OnInit {
  user: User;
  masterlistitemform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  listid: string;
  itemList: ListTypeItem[];
  ItemData: ListTypeItem;
  code: string = "";
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  bsModalRef: BsModalRef;
  addAccess: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "MAST");
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
      itemname: ['', Validators.required],
      code: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(5)])],
      listName: [''],
      listTypeId: [''],
      id:['']
    });

    this.listid = this.route.snapshot.paramMap.get('id');
    if (this.listid != null) {

      this.hasAddAccess = this.user.username == "admin";
    }
    this.listTypeService.getByListId(this.listid)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.itemList = data.object
          this.masterlistitemform.get("listName").setValue(this.itemList[0].listName);
          this.masterlistitemform.get("listTypeId").setValue(this.itemList[0].listTypeId);

          //  this.masterlistitemform.patchValue(this.itemList[0]);
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
    var list2 = JSON.parse(localStorage.getItem(this.listid))
    if (list2 != null) {
      if (list2[0].listCode == environment.configTypeId) {
        this.addAccess = true;
      }
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
    //        this.notificationService.showError(error, "Error");
    //        this.loading = false;
    //      }
    //    });
    //}

  }

  open(param:string) {
    const initialState  = {
      itemId: param
    };
    this.bsModalRef = this.modalService.show(ModelContentComponent, {initialState});
  }

  close() {
    alert('test');
    this.bsModalRef.hide();
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'listTypeItemId',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        cellRendererFramework: MRenderComponent,
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
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  onRowClicked(e): void {
    //debugger;
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");

      switch (actionType) {
        case "add":
          this.open(data.listTypeItemId);

        case "edit":
          this.masterlistitemform.get("id").setValue(data.listTypeItemId);
          this.masterlistitemform.get("itemname").setValue(data.itemname);//itemCode
          this.masterlistitemform.get("code").setValue(data.itemCode);
          //this.masterlistitemform.get("listName").setValue(data.listName);
          this.masterlistitemform.get("listTypeId").setValue(data.listTypeId);
          this.id = data.listTypeItemId;
      }
    }
  };

  // convenience getter for easy access to form fields
  get f() { return this.masterlistitemform.controls; }

  onSubmit() {
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
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.itemList = data.object;

            this.masterlistitemform.get("itemname").setValue('');
            this.masterlistitemform.get("code").setValue('');
          }
          else {
            this.notificationService.showError(data.resultMessage, "Error");
          }
          this.loading = false;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    }
    else {
      this.ItemData = this.masterlistitemform.value;
      this.listTypeService.update(this.id, this.ItemData)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (data.result) {
            this.notificationService.showSuccess(data.resultMessage, "Success");
            this.masterlistitemform.get("itemname").setValue('');
            this.masterlistitemform.get("code").setValue('');
            this.id = null;
            this.itemList = data.object;
          }
          else {
            this.notificationService.showError(data.resultMessage, "Error");
          }
          this.loading = false;

        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    }

  }

}
