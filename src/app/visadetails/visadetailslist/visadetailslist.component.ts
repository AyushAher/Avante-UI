import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { RenderComponent } from '../../distributor/rendercomponent';
import { ProfileReadOnly, User, Visadetails } from '../../_models';
import { AccountService, NotificationService, ProfileService, VisadetailsService } from '../../_services';

@Component({
  selector: 'app-visadetailslist',
  templateUrl: './visadetailslist.component.html',
})
export class VisadetailsListComponent implements OnInit {
  form: FormGroup;
  traveldetailsList: Visadetails[];
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
    private travelDetailsService: VisadetailsService,
    private notificationService: NotificationService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "SCURR"
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
    }
    // console.log(this.user.id);

    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.travelDetailsService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.traveldetailsList = data.object;
          console.log(this.traveldetailsList)
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
        width: 100,
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
    this.api.sizeColumnsToFit();
  }
}