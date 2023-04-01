import { Component, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { ProfileReadOnly, User } from "../_models";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { Router } from "@angular/router";
import { AccountService, ProfileService, SrRecomandService } from "../_services";
import { first } from "rxjs/operators";
import { DatePipe } from "@angular/common";
import { EnvService } from '../_services/env/env.service';

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
  showGrid: any = true;
  isDist: boolean;


  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: SrRecomandService,
    private profileService: ProfileService,
    private environment: EnvService,
  ) {
  }

  ngOnInit() {

    let role = JSON.parse(localStorage.getItem('roles'));
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
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }
    else role = role[0]?.itemCode;
    if (role == this.environment.distRoleCode) this.isDist = true
   
    this.Service.getByGrid(this.user.contactId).pipe(first())
      .subscribe((data: any) => this.List = data.object)
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(["localexpenses"]);
  }

  DataFilter(event) {
    this.List = event;
    const datepipie = new DatePipe("en-US");

    this.List.forEach((value) => {
      value.assignedTofName = value.assignedTofName + " " + value.assignedTolName
      value.serviceReportDate = datepipie.transform(
        value.serviceReportDate,
        'dd/MM/YYYY'
      );
    })

  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  private createColumnDefs() {
    return [
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
        headerName: "HSN Code",
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
  }
}
