import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, Instrument, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, InstrumentService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-instuList',
  templateUrl: './instrumentlist.html',
})
export class InstrumentListComponent implements OnInit {
  user: User;
  form: FormGroup;
  instrumentList: Instrument[];
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private instrumentService: InstrumentService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SINST");
      if (profilePermission.length > 0) {

        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;

      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }



    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.instrumentService.getAll(this.user.userId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.instrumentList = data.object;
        },
        error: error => {
          
          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['instrument']);
  }


  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: '/instrument',
          deleteLink: 'I',
          deleteaccess: this.hasDeleteAccess
        },
      },
      {
        headerName: 'Site Name',
        field: 'custSiteName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'custSiteName'
      }, {
        headerName: 'Serial No',
        field: 'serialnos',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'serialnos'
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
