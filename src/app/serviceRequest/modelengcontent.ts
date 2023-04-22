import { Component, Input, OnInit } from '@angular/core';

import { EngineerCommentList, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  ConfigTypeValueService,
  EngCommentService,
  ListTypeService,
  NotificationService
} from '../_services';
import { BsModalService } from 'ngx-bootstrap/modal';
import { GetParsedDate } from '../_helpers/Providers';


@Component({
  selector: 'app-modelcomponent',
  templateUrl: './modelengcontent.html',
})
export class ModelEngContentComponent implements OnInit {
  user: User;
  engineerCommentForm: FormGroup;
  engcomment: EngineerCommentList;
  //id: string;
  listid: string;
  closeResult: string;
  @Input() itemId;
  @Input() item;
  @Input() id;
  @Input() engineerid;
  formData: any;


  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private engcommentService: EngCommentService,
    public activeModal: BsModalService
  ) { }


  ngOnInit() {
    this.user = this.accountService.userValue;

    this.engineerCommentForm = this.formBuilder.group({
      comments: ['', Validators.required],
      nextdate: ['', Validators.required],
      isactive: [true],
      isdeleted: [false],

    });

    this.engineerCommentForm.get("nextdate").valueChanges
      .subscribe(value => {
        if (value < GetParsedDate(this.item.serreqdate)) {
          this.notificationService.showError("The Next Date should be after Service Request Date", "Invalid Date")
        }
      })

    if (this.id == undefined) return;
    this.engcommentService.getById(this.id)
      .subscribe((data: any) => {
        this.formData = data.object;
        this.engineerCommentForm.patchValue(this.formData);
        this.engineerCommentForm.patchValue({ "nextdate": new Date(data.object.nextdate) });
      });
  }

  close() {
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

  get f() {
    return this.engineerCommentForm.controls
  }

  onValueSubmit() {
    this.engineerCommentForm.markAllAsTouched();
    if (this.engineerCommentForm.invalid) {
      return;
    }

    if (this.f.nextdate.value < GetParsedDate(this.item.serreqdate)) {
      return this.notificationService.showError("The Next Date should be after Service Request Date", "Invalid Date")
    }

    this.engcomment = this.engineerCommentForm.value;
    this.engcomment.servicerequestid = this.itemId;
    this.engcomment.engineerid = this.engineerid;

    if (this.id == null) {
      this.engcommentService.save(this.engcomment)
        .subscribe((data: any) => {
          if (data.result)
            this.notificationService.showSuccess(data.resultMessage, "Success");
          this.close();
        });
    }
    else {
      this.engcomment.id = this.id;
      this.engcommentService.update(this.id, this.engcomment)
        .subscribe((data: any) => {
          if (data.result)
            this.notificationService.showSuccess(data.resultMessage, "Success");
          this.close();
        });
    }
  }
}
