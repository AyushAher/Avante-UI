import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ListTypeItem, ResultMsg, ProfileReadOnly, User, ConfigTypeValue, EngineerCommentList, workDone } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import {
  AccountService, AlertService, ListTypeService, NotificationService, ProfileService, ConfigTypeValueService, workdoneService
} from '../_services';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgbDate, NgbDatepicker, NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ViewChild } from '@angular/core';


@Component({
  selector: 'app-workdonecomponent',
  templateUrl: './workdonecontent.html',
})
export class WorkdoneContentComponent implements OnInit {
  user: User;
  workdoneForm: FormGroup;
  workdone: workDone;
  loading = false;
  submitted = false;
  isSave = false;
  servicereportId: string;
  //id: string;
  listid: string;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  closeResult: string;
  @Input() public itemId;
  @Input() public id;
 

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private configTypeService: ConfigTypeValueService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private workdoneservice: workdoneService,
    public activeModal: BsModalService
  ) { }
 
  
  ngOnInit() {
    console.log(this.itemId);
    this.user = this.accountService.userValue;

    this.workdoneForm = this.formBuilder.group({
      workdone: ['', Validators.required]
    });
    if (this.id != undefined) {
      this.workdoneservice.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.workdoneForm.patchValue(data.object);
           // this.engineerCommentForm.patchValue({ "nextdate": new Date(data.object.nextdate) });
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

    if (this.workdoneForm.invalid) {
      return;
    }
    this.workdone = this.workdoneForm.value;
    this.workdone.servicereportid = this.itemId;

    if (this.id == null) {
      this.workdoneservice.save(this.workdone)
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
      this.workdone.id = this.id;
      this.workdoneservice.update(this.id, this.workdone)
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
