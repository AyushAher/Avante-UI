import { Component, OnInit, ViewChild } from '@angular/core';

import { User, Customer, CustomerSite, Instrument } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef,GridApi,ColumnApi} from 'ag-grid-community'; 

import { AccountService, AlertService, CustomerSiteService, CustomerService, InstrumentService, CountryService, NotificationService } from '../_services';
import { lnkRenderComponent } from './lnkrendercomponent';


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

  @ViewChild('sform') testFormElement;
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

    this.customerSiteService.getAllCustomerSites()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.customersite = data.object;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });

    //debugger;
    this.form = this.fb.group({
      search: [''],
      custSiteId: ['']
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
            this.notificationService.showError(error, "Error");
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
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

}

export class search {
  search: string;
  custSiteId: string;
}
