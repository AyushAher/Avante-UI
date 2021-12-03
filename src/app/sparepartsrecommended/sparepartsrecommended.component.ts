import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ProfileReadOnly, User} from "../_models";
import {ColDef, ColumnApi, GridApi} from "ag-grid-community";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService, AlertService, NotificationService, ProfileService, SrRecomandService} from "../_services";
import {first} from "rxjs/operators";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-sparepartsrecommended',
  templateUrl: './sparepartsrecommended.component.html'
})

export class SparepartsrecommendedComponent implements OnInit {
  form: FormGroup;
  List: any;
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
    private Service: SrRecomandService,
    private notificationService: NotificationService,
    private profileService: ProfileService
  ) {
  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "SPRCM"
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

    this.Service.getByGrid(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.List = data.object;
          const datepipie = new DatePipe("en-US");

          this.List.forEach((value) => {
            value.assignedTofName = value.assignedTofName + " " + value.assignedTolName
            value.serviceReportDate = datepipie.transform(
              value.serviceReportDate,
              "MM/dd/yyyy"
            );
          })

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
      // {
      //   headerName: "Action",
      //   field: "id",
      //   filter: false,
      //   enableSorting: false,
      //   editable: false,
      //   sortable: false,
      //   cellRendererFramework: RenderComponent,
      //   cellRendererParams: {
      //     inRouterLink: "/localexpenses",
      //     deleteLink: "LCEXP",
      //     deleteaccess: this.hasDeleteAccess,
      //   },
      // },
      {
        headerName: "Service Request No.",
        field: "serreqno",
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true
      },
      {
        headerName: "Service Report Date",
        field: "serviceReportDate",
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: "Engineer Name",
        field: "assignedTofName",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Part No",
        field: "partno",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Qty",
        field: "qtyRecommended",
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: "HSC Code",
        field: "hsccode",
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
