import { Component, OnInit } from '@angular/core';

import { Currency, ProfileReadOnly, User } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CurrencyService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-currList',
  templateUrl: './currencylist.html',
})
export class CurrencyListComponent implements OnInit {
  form: FormGroup;
  currencyList: Currency[];
  loading = false;
  submitted = false;
  isSave = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: User;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private currencyService: CurrencyService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCURR");
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
    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currencyList = data.object;
        },
        error: error => {

          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['currency']);
  }


  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`currency/${data.id}`])
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Code',
        field: 'code',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'code',
      },
      {
        headerName: 'Currency Name',
        field: 'name',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'name',
      },
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
