import { Component, OnInit, ViewChild } from '@angular/core';

import { CustomerSite, Instrument, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import { AccountService, AlertService, CustomerSiteService, InstrumentService, NotificationService } from '../_services';
import { lnkRenderComponent } from './lnkrendercomponent';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-search',
  templateUrl: './search.html',
})
export class SearchComponent implements OnInit {

  user: User;
  form: FormGroup;
  instrumentList: Instrument[];
  customersite: CustomerSite[];
  loading = false;
  submitted = false;
  isSave = false;
  customerSiteId: string;
  customerId: string;
  type: string = "D";
  searchKeyword: search;
  visible: boolean = false;

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

  showGrid: any;

  @ViewChild('sform') testFormElement;
  isDist: boolean;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private instrumentService: InstrumentService,
    private customerSiteService: CustomerSiteService,
    private notificationService: NotificationService,
  ) {

  }
  ngOnInit() {

    let role = JSON.parse(localStorage.getItem('roles'));
    this.user = this.accountService.userValue;
    this.customerSiteService.getAllCustomerSites()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.customersite = data.object;
        },
        error: error => {

          this.loading = false;
        }
      });

    if (this.user.username != "admin") {
      role = role[0]?.itemCode;
      if (role == environment.distRoleCode) this.isDist = true;
      else {
        this.toggleFilter();
      }
    }

    //debugger;
    this.form = this.fb.group({
      search: [''],
      custSiteId: [''],
      isactive: [true],

    });
    this.columnDefs = this.createColumnDefs();
    if (JSON.parse(localStorage.getItem('search')) != null) {
      this.form.get('search').setValue(JSON.parse(localStorage.getItem('search')).search);
      this.form.get('custSiteId').setValue(JSON.parse(localStorage.getItem('search')).custSiteId);
      this.searchKeyword = new search;
      this.searchKeyword.search = JSON.parse(localStorage.getItem('search')).search;
      this.searchKeyword.custSiteId = JSON.parse(localStorage.getItem('search')).custSiteId;
      //localStorage.removeItem('search');

      //  this.testFormElement.ngSubmit.emit();
    }
  }

  ngAfterViewInit() {
    if (this.searchKeyword.search != null || this.searchKeyword.custSiteId != null) {
      this.instrumentService.searchByKeyword(this.searchKeyword.search, this.searchKeyword.custSiteId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            this.visible = true;
            this.instrumentList = data.object;
            // localStorage.setItem('search', JSON.stringify(this.searchKeyword));
          },
          error: error => {
            //this.alertService.error(error);

            this.loading = false;
          }
        });
    }
  }

  public testMethod(): void {
    this.testFormElement.nativeElement.submit();
  }
  get f() { return this.form.controls; }

  Add() {
    this.router.navigate(['customersite', this.customerId]);
  }




  DataFilter(event) {
    this.instrumentList = event
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
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 50,
        cellRendererFramework: lnkRenderComponent,
        cellRendererParams: {
          inRouterLink: '/instrumentRonly',
        },
      },
      {
        headerName: 'serial No',
        field: 'serialnos',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'serialnos',
      },
      {
        headerName: 'Site Name',
        field: 'custSiteName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'custSiteName',
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  onSubmit() {
    //debugger;
    if (this.form.invalid) {
      return;
    }
    this.searchKeyword = this.form.value

    //this.customerId = this.route.snapshot.paramMap.get('id');
    this.instrumentService.searchByKeyword(this.searchKeyword.search, this.searchKeyword.custSiteId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.visible = true;
          this.instrumentList = data.object;
          localStorage.setItem('search', JSON.stringify(this.searchKeyword));
        },
        error: error => {
          //this.alertService.error(error);

          this.loading = false;
        }
      });
  }

}

export class search {
  search: string;
  custSiteId: string;
}
