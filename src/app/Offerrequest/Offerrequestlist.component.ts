import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { first } from "rxjs/operators";
import { RenderComponent } from "../distributor/rendercomponent";
import { User } from "../_models";
import { Offerrequest } from "../_models/Offerrequest.model";
import { AccountService, NotificationService, ProfileService } from "../_services";
import { OfferrequestService } from "../_services/Offerrequest.service";

@Component({
  selector: "app-Offerrequestlist",
  templateUrl: "./Offerrequestlist.component.html",
})

export class OfferrequestlistComponent implements OnInit {
  form: FormGroup;
  model: Offerrequest;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  user: User;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  profilePermission: any;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private Service: OfferrequestService,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "OFREQ");
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


    this.columnDefs = this.createColumnDefs();

    this.Service.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.model = data.object;
        },
        error: (error) => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        },
      });
  }
  Add() {
    this.router.navigate(["offerrequest"]);
  }
  private createColumnDefs() {
    return [
      {
        headerName: "Action",
        field: "id",
        filter: false, enableSorting: false,
        editable: false,
        sortable: false,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: "/offerrequest",
          deleteLink: "OFFER",
          deleteaccess: this.hasDeleteAccess,
        },
      },
      {
        headerName: "Distributor",
        field: "distributor",
        filter: true,
        tooltipField: "Distributor",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Offer Request No.",
        field: "offReqNo",
        filter: true,
        tooltipField: "Offer Request No.",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "RFQ Date",
        field: "podate",
        filter: true,
        tooltipField: "PODate",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }
  onGridReady(params: any): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }
}
