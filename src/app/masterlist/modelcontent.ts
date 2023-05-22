import { Component, OnInit, Input } from '@angular/core';

import { ListTypeItem, ResultMsg, ProfileReadOnly, User, ConfigTypeValue } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import {
  AccountService, AlertService, ListTypeService, NotificationService, ProfileService, ConfigTypeValueService
} from '../_services';
import { MRenderComponent } from './rendercomponent';
import { BsModalService } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-modelcomponent',
  templateUrl: './modelcontent.html',
})
export class ModelContentComponent implements OnInit {
  user: User;
  listvalue: FormGroup;
  configVal: ConfigTypeValue;
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
    private configTypeService: ConfigTypeValueService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    public activeModal: BsModalService
  ) { }
 

  get f(){return this.listvalue.controls;}

  ngOnInit() {
    this.user = this.accountService.userValue;
    
    this.listvalue = this.formBuilder.group({
      configValue: ['', Validators.required],
      id:['']
    });

    //debugger;
    this.configTypeService.getById(this.itemId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.configList = data.object;
          //this.listvalue.get("configValue").setValue(data.object[0].configValue);
          //this.id = data.object[0].id;
          //  this.masterlistitemform.patchValue(this.itemList[0]);
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
          this.listvalue.get("configValue").setValue(data.configValue);//itemCode  
          this.id = data.id;
      }
    }
  };

  //open(content) {
  //  this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
  //    this.closeResult = `Closed with: ${result}`;
  //  }, (reason) => {
  //    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //  });
  //}

  //private getDismissReason(reason: any): string {
  //  if (reason === ModalDismissReasons.ESC) {
  //    return 'by pressing ESC';
  //  } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //    return 'by clicking on a backdrop';
  //  } else {
  //    return `with: ${reason}`;
  //  }
  //}

  close() {
    //alert('test cholde');
    this.activeModal.hide();
  }

  onValueSubmit() {
    //debugger;
    
    this.submitted = true;

    this.isSave = true;
    this.loading = true;

    this.listvalue.markAllAsTouched();
    if (this.listvalue.invalid) {
      return;
    }
    this.configVal = this.listvalue.value;
    this.configVal.listTypeItemId = this.itemId;
    //if (this.id == null) {
    if (this.id == null) {
      this.configTypeService.save(this.configVal)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.configList = data.object;
              this.listvalue.get("configValue").reset();//.setValue("");
            }
            else {
              
            }
            this.loading = false;
          },
          error: error => {
            
            this.loading = false;
          }
        });
    }
    else {
      this.configTypeService.update(this.id,this.configVal)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.configList = data.object;
              this.listvalue.get("configValue").setValue("");
              this.id = null;
            }
            else {
              
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
        width: 100,
        cellRendererFramework: MRenderComponent,
        cellRendererParams: {
          deleteLink: 'CNG',
          deleteaccess: true,
          addAccess: false,
          hasUpdateAccess: true,
        },
      },
      {
        headerName: 'Config Value',
        field: 'configValue',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'configValue',
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
