import {Component, OnInit} from '@angular/core';

import {CustomerSite, ProfileReadOnly, User} from '../_models';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import {first} from 'rxjs/operators';
import {ColDef, ColumnApi, GridApi} from 'ag-grid-community';

import {
  AccountService,
  AlertService,
  CountryService,
  CustomerService,
  NotificationService,
  ProfileService
} from '../_services';
import {RenderComponent} from '../distributor/rendercomponent';


@Component({
  selector: 'app-customerls',
  templateUrl: './customersitelist.html',
})
export class CustomerSiteListComponent implements OnInit {
  user: User;
  form: FormGroup;
  customerSite: CustomerSite[];
  loading = false;
  submitted = false;
  isSave = false;
  customerSiteId: string;
  customerId: string;
  type: string = "D";
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
    private customerService: CustomerService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
      if (profilePermission.length > 0) {

        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;

      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }

    this.customerId = this.route.snapshot.paramMap.get('id');
    this.customerService.getById(this.customerId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.customerSite = data.object.sites;
        },
        error: error => {
         // this.alertService.error(error);
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['customersite', this.customerId]);
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
          inRouterLink: '/customersite/' + this.customerId,
          deleteLink: 'CS',
          deleteaccess: this.hasDeleteAccess
        },
      },{
      headerName: 'Customer Region',
      field: 'custregname',
      filter: true,
      enableSorting: true,
      editable: false,
        sortable: true,
        tooltipField: 'custregname',
     }, {
      headerName: 'Region',
        field: 'regname',
      filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'regname',
      },

    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
