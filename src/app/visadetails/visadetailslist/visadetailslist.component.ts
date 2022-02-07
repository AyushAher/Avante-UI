import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { RenderComponent } from '../../distributor/rendercomponent';
import { ProfileReadOnly, User, Visadetails } from '../../_models';
import {
  AccountService,
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService,
  VisadetailsService
} from '../../_services';
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-visadetailslist',
  templateUrl: './visadetailslist.component.html',
})
export class VisadetailsListComponent implements OnInit {
  form: FormGroup;
  List: Visadetails[];
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
    private router: Router,
    private accountService: AccountService,
    private Service: VisadetailsService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private distributorService: DistributorService,
    private listTypeService: ListTypeService,

  ) { }

  ngOnInit() {
    let role = JSON.parse(localStorage.getItem('roles'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;

    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "VADET"
      );

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
    } else {
      role = role[0]?.itemCode;
      this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    }
    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.Service.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.user.username != "admin") {
            this.distributorService.getByConId(this.user.contactId)
              .pipe(first())
              .subscribe({
                next: (data1: any) => {
                  if (role == environment.distRoleCode) {
                    this.List = data.object.filter(x => x.distId == data1.object[0].id)
                  } else if (role == environment.engRoleCode) {
                    data.object = data.object.filter(x => x.createdby == this.user.userId || x.engineerid == this.user.contactId)
                    this.List = data.object;
                  } else if (this.user.username == 'admin') {
                    this.List = data.object
                  }
                }

              })
          } else {
            this.List = data.object
          }

        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });

    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(["visadetails"]);
  }

  private createColumnDefs() {
    return [
      {
        headerName: "Action",
        field: "id",
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: "/visadetails",
          deleteLink: "VSDET",
          deleteaccess: this.hasDeleteAccess,
        },
      },
      {
        headerName: "Engineer Name",
        field: "engineername",
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: "name",
      },
      {
        headerName: "Service Request No",
        field: "servicerequestno",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },

      {
        headerName: "Country",
        field: "countryname",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },

      {
        headerName: "Visa Type",
        field: "visatype",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },

      {
        headerName: "Start Date - End Date",
        field: "startEndDate",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },

    ];
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    // this.api.sizeColumnsToFit();
  }
}
