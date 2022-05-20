import {Component, Input, OnInit} from '@angular/core';
import {ConfigTypeValue, User} from "../_models";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ColDef, ColumnApi, GridApi} from "ag-grid-community";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService, ListTypeService, NotificationService} from "../_services";
import {BsModalService} from "ngx-bootstrap/modal";
import {first} from "rxjs/operators";
import {MRenderComponent} from "./rendercomponent";
import {PrevchklocpartelementService} from "../_services/prevchklocpartelement.service";

@Component({
  selector: 'app-prevchklocpartelementvalue',
  templateUrl: './prevchklocpartelementvalue.component.html'
})
export class PrevchklocpartelementvalueComponent implements OnInit {
  user: User;
  listvalue: FormGroup;
  configVal: any;
  configList: ConfigTypeValue[];
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  listid: string;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  closeResult: string;
  @Input() public itemId;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    public activeModal: BsModalService,
    private prevchklocpartelementService: PrevchklocpartelementService,
  ) {
  }


  ngOnInit() {
    this.user = this.accountService.userValue;

    this.listvalue = this.formBuilder.group({
      element: ['', Validators.required],
      id: '',
      isactive: [true],

    });

    //debugger;
    this.prevchklocpartelementService.getListById(this.itemId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.configList = data.object;
        },
        error: error => {
          
          this.loading = false;
        }
      });

    this.columnDefs = this.createColumnDefs();
  }

  onRowClicked(e): void {
    //debugger;
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");

      switch (actionType) {
        case "edit":
          this.listvalue.get("id").setValue(data.id);
          this.listvalue.get("element").setValue(data.element);//itemCode
          this.id = data.id;
      }
    }
  };

  close() {
    //alert('test cholde');
    this.activeModal.hide();
  }

  onValueSubmit() {
    //debugger;

    this.submitted = true;

    this.isSave = true;
    this.loading = true;

    if (this.listvalue.invalid) {
      return;
    }
    this.configVal = this.listvalue.value;
    this.configVal.locationId = this.itemId;

    if (this.id == null) {
      this.prevchklocpartelementService.save(this.configVal)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.configList = data.object;
              this.listvalue.get("element").setValue("");
            } else {
              
            }
            this.loading = false;
          },
          error: error => {
            
            this.loading = false;
          }
        });
    } else {

      this.prevchklocpartelementService.update(this.id, this.configVal)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.configList = data.object;
              this.listvalue.get("element").setValue("");
              this.id = null;
            } else {
              
            }
            this.loading = false;
          },
          error: error => {
            
            this.loading = false;
          }
        });
    }
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
        cellRendererFramework: MRenderComponent,
        cellRendererParams: {
          deleteLink: 'ELEMENT',
          deleteaccess: true,
          addAccess: false,
          hasUpdateAccess: true,
        },
      },
      {
        headerName: 'Element',
        field: 'element',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'element',
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }
}
