import { Component, OnInit } from '@angular/core';

import { Country, Customer, ProfileReadOnly, User } from '../_models';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  CustomerService,
  ProfileService
} from '../_services';
import { EnvService } from '../_services/env/env.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ImportCustomerData } from './ImportCustomer.component';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './customerlist.html',
})
export class CustomerListComponent implements OnInit {
  user: User;
  form: FormGroup;
  customerList: Customer[];
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
  showGrid = true;
  IsDist: boolean;
  bsModalRef: BsModalRef;

  constructor(
    private router: Router,
    private modalService: BsModalService,
    private accountService: AccountService,
    private customerService: CustomerService,
    private profileService: ProfileService,
    private environment: EnvService

  ) { }

  ngOnInit() {
    let role = JSON.parse(localStorage.getItem('roles'));
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
      this.showGrid = true;
      this.IsDist = false
    }
    else {
      role = role[0]?.itemCode;
    }

    this.IsDist = role == this.environment.distRoleCode

    this.customerService.getAllByConId(this.user.contactId).pipe(first())
      .subscribe((data: any) => this.customerList = data.object)
    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['customer']);
  }


  DataFilter(event) {
    this.customerList = event
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`customer/${data.id}`])
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Customer Name',
        field: 'custname',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'custname',
      },
      {
        headerName: 'Principal Distributor',
        field: 'defdist',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: 'Is Active',
        field: 'isactive',
        filter: true,
        editable: false,
        sortable: true
      },

    ]
  }

  onGridReady(params): void {
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
    this.bsModalRef = this.modalService.show(ImportCustomerData, config);
  }
}
