import { Component, Input, OnInit } from '@angular/core';

import { User, workTime } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  ConfigTypeValueService,
  ListTypeService,
  NotificationService,
  worktimeService
} from '../_services';
import { BsModalService } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-workTimecomponent',
  templateUrl: './workTime.html',
})
export class WorkTimeContentComponent implements OnInit {
  user: User;
  workTimeForm: FormGroup;
  workTime: workTime;
  loading = false;
  submitted = false;
  isSave = false;
  servicereportId: string;
  //id: string;
  listid: string;
  public columnDefs: ColDef[];
  closeResult: string;
  @Input() public itemId;
  @Input() public id;


  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private worktimeservice: worktimeService,
    public activeModal: BsModalService
  ) { }


  ngOnInit() {
    this.user = this.accountService.userValue;

    this.workTimeForm = this.formBuilder.group({
      worktimedate: ['', Validators.required],
      starttime: ['', Validators.required],
      endtime: ['', Validators.required],
      perdayhrs: ['', Validators.required],
      isactive: [true],
      isdeleted: [false],

    });
    if (this.id != undefined) {
      this.worktimeservice.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.workTimeForm.patchValue(data.object);
            this.workTimeForm.patchValue({ "worktimedate": new Date(data.object.worktimedate) });
            this.PerDayHrs()
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

  PerDayHrs() {
    let startTime: Date;
    let endTime: Date;

    startTime = new Date(new Date(this.workTimeForm.get('worktimedate').value).toDateString() + " " + this.workTimeForm.get('endtime').value);
    endTime = new Date(new Date(this.workTimeForm.get('worktimedate').value).toDateString() + " " + this.workTimeForm.get('starttime').value);

    let diff = (startTime.getTime() - endTime.getTime()) / (1000 * 60 * 60);
    if (
      this.workTimeForm.get('worktimedate').value != "" &&
      this.workTimeForm.get('endtime').value != "" &&
      this.workTimeForm.get('starttime').value != ""
    ) {

      if (diff > 0) {
        this.workTimeForm.get('perdayhrs').setValue(diff.toFixed(2).toString());
      } else {
        diff = 0;
        this.workTimeForm.get('perdayhrs').setValue(diff.toString());
        this.notificationService.showError("End Time cannot be more than start time", "Error")
      }

    }
  }

  onValueSubmit() {
    //debugger;

    this.submitted = true;

    this.isSave = true;
    this.loading = true;

    if (this.workTimeForm.invalid) {
      return;
    }
    this.workTime = this.workTimeForm.value;
    this.workTime.servicereportid = this.itemId;

    if (this.id == null) {
      this.worktimeservice.save(this.workTime)
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

              this.close();
            }
            this.loading = false;
          },
          error: () => {

            this.loading = false;
          }
        });
    }
    else {
      this.workTime.id = this.id;
      this.worktimeservice.update(this.id, this.workTime)
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

              this.close();
            }
            this.loading = false;
          },
          error: () => {

            this.loading = false;
          }
        });
    }
  }
}
