import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RenderComponent } from '../distributor/rendercomponent';
import { User } from '../_models';
import { Offerrequest } from '../_models/Offerrequest.model';
import { AccountService, NotificationService, ProfileService } from '../_services';
import { OfferrequestService } from '../_services/Offerrequest.service';
import { OfferRequestListRenderer } from './offerrequestlistrenderer';

@Component({
  selector: 'app-Offerrequestlist',
  templateUrl: './Offerrequestlist.component.html',
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
  zohocode: any;
  role: string;
  showGrid: any;
  isDist: boolean;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private Service: OfferrequestService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    let role = JSON.parse(localStorage.getItem('roles'));
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

    if (this.user.username == 'admin') {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    } else {
      this.role = role[0]?.itemCode;
    }
    if (this.role == environment.distRoleCode) this.isDist = true;
    else {
      this.toggleFilter()
      this.Service.getAll().pipe(first())
        .subscribe((data: any) => this.model = data.object);
    }
    this.columnDefs = this.createColumnDefs();
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  DataFilter(event) {
    this.model = event
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
        cellRendererFramework: OfferRequestListRenderer,
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
        headerName: "Customer",
        field: "customerName",
        filter: true,
        hide: this.role != environment.distRoleCode,
        tooltipField: "customerName",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Spare Parts Quote No.",
        field: "offReqNo",
        filter: true,
        tooltipField: "Spare Parts Quote No.",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Process Stage",
        field: "stageName",
        filter: true,
        tooltipField: "stage",
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
