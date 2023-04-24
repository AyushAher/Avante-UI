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
import { GetParsedDate } from '../_helpers/Providers';


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
  listid: string;
  public columnDefs: ColDef[];
  closeResult: string;
  @Input() public itemId;
  @Input() public item;
  @Input() public id;
  formData: any;


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


    this.workTimeForm.get("worktimedate").valueChanges
      .subscribe(value => {
        console.log(this.item);
        
        if (value < GetParsedDate(this.item.serreqdate)) {
          this.notificationService.showError("The Date should be after Service Request Date", "Invalid Date")
        }
      })

    if (this.id == undefined) return;

    this.worktimeservice.getById(this.id)
      .subscribe((data: any) => {
        this.formData = data.object;
        this.workTimeForm.patchValue(this.formData);
        this.workTimeForm.patchValue({ "worktimedate": new Date(data.object.worktimedate) });
        this.PerDayHrs()
      });
  }

  close() {
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

  get f() {
    return this.workTimeForm.controls
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
        this.notificationService.showError("End Time should not be earlier than Start Time.", "Invalid Time Range")
      }

    }
  }

  onValueSubmit() {
    this.workTimeForm.markAllAsTouched();
    if (this.workTimeForm.get("worktimedate").value < GetParsedDate(this.item.serreqdate))
      return this.notificationService.showError("The Work Time Date should be after Service Request Date", "Invalid Date")

    if (this.workTimeForm.invalid) return this.notificationService.showError("Please fill all required fields", "Invalid Form");

    this.workTime = this.workTimeForm.value;
    this.workTime.servicereportid = this.itemId;

    if (this.id == null) {
      this.worktimeservice.save(this.workTime)
        .subscribe((data: any) => {
          if (data.result) this.notificationService.showSuccess(data.resultMessage, "Success");
          this.close();
        });
    }
    else {
      this.workTime.id = this.id;
      this.worktimeservice.update(this.id, this.workTime)
        .subscribe((data: any) => {
          if (data.result) this.notificationService.showSuccess(data.resultMessage, "Success");
          this.close();
        });
    }
  }
}
