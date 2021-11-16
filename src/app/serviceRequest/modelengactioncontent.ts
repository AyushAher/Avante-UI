import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ListTypeItem, ResultMsg, ProfileReadOnly, User, ConfigTypeValue, EngineerCommentList, actionList } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import {
  AccountService, ListTypeService, NotificationService, EngActionService
} from '../_services';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modelcomponent',
  templateUrl: './modelengactioncontent.html',
})
export class ModelEngActionContentComponent implements OnInit {
  user: User;
  actionForm: FormGroup;
  action: actionList;
  loading = false;
  submitted = false;
  isSave = false;
  //id: string;
  listid: string;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  closeResult: string;
  actiontakenlist: ListTypeItem[];
  @Input() public itemId;
  @Input() public id;
  @Input() public engineerlist;
  @Input() public engineerid;
 

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private actionService: EngActionService,
    public activeModal: BsModalService
  ) { }
 
  
  ngOnInit() {
    console.log(this.itemId);
    this.user = this.accountService.userValue;

    this.actionForm = this.formBuilder.group({
      engineerid: ['', Validators.required],
      comments: ['', Validators.required],
      actiondate: ['', Validators.required],
      actiontaken: [''],
      teamviewrecording:['']
    });


    this.listTypeService.getById("ACTKN")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          //debugger;
          this.actiontakenlist = data;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
    this.actionForm.patchValue({ "engineerid": this.engineerid });
    if (this.id != undefined) {
      this.actionService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.actionForm.patchValue(data.object);
            this.actionForm.patchValue({ "actiondate": new Date(data.object.actiondate) });
          },
          error: error => {
            // this.alertService.error(error);
            this.notificationService.showSuccess(error, "Error");
            this.loading = false;
          }
        });
    }
  }

  close() {
    //alert('test cholde');
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

  onValueSubmit() {
    //debugger;
    
    this.submitted = true;

    this.isSave = true;
    this.loading = true;

    if (this.actionForm.invalid) {
      return;
    }
    this.action = this.actionForm.value;
    this.action.servicerequestid = this.itemId;
    this.action.engineerid = this.engineerid;
    if (this.id == null) {
      this.actionService.save(this.action)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.close();
              //this.configList = data.object;
             // this.listvalue.get("configValue").setValue("");
            }
            else {
              this.notificationService.showError(data.resultMessage, "Error");
              this.close();
            }
            this.loading = false;
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
    else {
      this.action.id = this.id;
      this.actionService.update(this.id, this.action)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.close();
              //this.configList = data.object;
              //this.listvalue.get("configValue").setValue("");
              //this.id = null;
            }
            else {
              this.notificationService.showError(data.resultMessage, "Error");
              this.close();
            }
            this.loading = false;
          },
          error: error => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          }
        });
    }
  }
}
