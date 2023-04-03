import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { RenderComponent } from '../distributor/rendercomponent';
import { User } from '../_models';
import { Offerrequest } from '../_models/Offerrequest.model';
import { AccountService, NotificationService, ProfileService } from '../_services';
import { EnvService } from '../_services/env/env.service';
import { OfferrequestService } from '../_services/Offerrequest.service';
import { ImportOfferRequestComponent } from './importofferrequest.component';
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
  showGrid: any = true;
  isDist: boolean;
  bsModalRef: BsModalRef;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private environment: EnvService,
    private modalService: BsModalService,
    private Service: OfferrequestService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    let role = JSON.parse(sessionStorage.getItem('roles'));
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
    if (this.role == this.environment.distRoleCode) this.isDist = true;

    this.Service.getAll().pipe(first())
      .subscribe((data: any) => this.model = data.object?.filter(x => !x.isCompleted));
    this.columnDefs = this.createColumnDefs();
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  DataFilter(event) {
    this.model = event?.filter(x => !x.isCompleted)
  }

  Add() {
    this.router.navigate(["offerrequest"], {
      queryParams: {
        isNSNav: false
      }
    });
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`offerrequest/${data.id}`], {
      queryParams: {
        isNSNav: true,
        creatingNewDistributor: true
      },
    })
  }

  private createColumnDefs() {
    return [
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
        hide: this.role != this.environment.distRoleCode,
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

  ImportData() {

    const config: any = {
      backdrop: 'static',
      keyboard: false,
      animated: true,
      ignoreBackdropClick: true,
    };
    this.bsModalRef = this.modalService.show(ImportOfferRequestComponent, config);
  }

}

