import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { RenderComponent } from '../../distributor/rendercomponent';
import { ProfileReadOnly, User, LocalExpenses } from '../../_models';
import { AccountService, AlertService, NotificationService, ProfileService, LocalExpensesService } from '../../_services';

@Component({
  selector: 'app-localexpenseslist',
  templateUrl: './localexpenseslist.component.html',
})
export class LocalexpenseslistComponent implements OnInit {
  form: FormGroup;
  LocalexpensesList: LocalExpenses[];
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
    private localExpensesService: LocalExpensesService,
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

    this.localExpensesService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.LocalexpensesList = data.object;
          console.log(this.LocalexpensesList)
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(["localexpenses"]);
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
          inRouterLink: "/localexpenses",
          deleteLink: "LCEXP",
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
        headerName: "City",
        field: "city",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Amount",
        field: "totalamount",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Travel Date",
        field: "traveldate",
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
