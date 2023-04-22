import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { actionList, ListTypeItem, User } from '../_models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';

import { AccountService, EngActionService, FileshareService, ListTypeService, NotificationService } from '../_services';
import { BsModalService } from 'ngx-bootstrap/modal';
import { HttpEventType } from "@angular/common/http";
import { Router } from '@angular/router';
import { GetParsedDate, GetParsedDatePipe } from '../_helpers/Providers';

@Component({
  selector: 'app-modelcomponent',
  templateUrl: './modelengactioncontent.html',
})
export class ModelEngActionContentComponent implements OnInit {
  user: User;
  actionForm: FormGroup;
  action: actionList;
  listid: string;
  closeResult: string;
  actiontakenlist: ListTypeItem[];
  @Input() itemId;
  @Input() item;
  @Input() id;
  @Input() engineerlist;
  @Input() engineerid;
  hasRemote: boolean = false;


  file: any;
  fileList: [] = [];
  public progress: number;
  public message: string;

  @Output() public onUploadFinished = new EventEmitter();
  formData: any;


  constructor(
    private formBuilder: FormBuilder,
    private FileShareService: FileshareService,
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private actionService: EngActionService,
    private activeModal: BsModalService,
    private router: Router
  ) { }


  ngOnInit() {
    this.user = this.accountService.userValue;
    console.log(this.item);

    this.actionForm = this.formBuilder.group({
      engineerid: ['', Validators.required],
      comments: ['', Validators.required],
      actiondate: [new Date(), Validators.required],
      actiontaken: ['', Validators.required],
      isactive: [true],
      isdeleted: [false],
      teamviewrecording: ['']
    });


    this.actionForm.get("actiondate").valueChanges
      .subscribe(value => {
        if (value < GetParsedDate(this.item.serreqdate)) {
          this.notificationService.showError("The Action Date should be after Service Request Date", "Invalid Date")
        }
      })

    this.listTypeService.getById("ACTKN")
      .subscribe((data: ListTypeItem[]) => this.actiontakenlist = data);

    this.actionForm.patchValue({ "engineerid": this.engineerid });

    if (this.id == undefined) return;

    this.actionService.getById(this.id)
      .subscribe((data: any) => {
        this.formData = data.object;
        this.actionForm.patchValue(this.formData);
        this.actionForm.patchValue({ "actiondate": new Date(data.object.actiondate) });
      });
  }

  close() {
    //alert('test cholde');
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

  getActiontaken(e) {
    this.listTypeService.getById('ACTKN')
      .subscribe((data: ListTypeItem[]) => {
        data = data.filter(x => x.itemCode == "RMD")
        e.value == data[0].listTypeItemId ? this.hasRemote = true : this.hasRemote = false;
      })
  }

  getfil(x) {
    this.file = x;
  }
  public uploadFile = (files, id) => {
    if (files.length === 0) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });

    this.FileShareService.upload(formData, id, "SRREQ-TV", "VIDEO").subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress)
        this.progress = Math.round((100 * event.loaded) / event.total);
      else if (event.type === HttpEventType.Response) {
        this.message = "Upload success.";
        this.onUploadFinished.emit(event.body);
      }
    });
  };

  get f() {
    return this.actionForm.controls
  }

  onValueSubmit() {
    this.actionForm.markAllAsTouched();
    if (this.hasRemote && this.file == null) return this.notificationService.showInfo("Upload Recording", "Info")
    if (this.actionForm.invalid) return

    if (this.f.actiondate.value < GetParsedDate(this.item.serreqdate))
      return this.notificationService.showError("The Action Date should be after Service Request Date", "Invalid Date")

    this.action = this.actionForm.value;
    this.action.servicerequestid = this.itemId;
    this.action.engineerid = this.engineerid;
    this.action.teamviewrecording = null;

    if (this.id == null) {
      this.actionService.save(this.action)
        .subscribe((data: any) => {
          if (data.result) {
            if (this.file != null) this.uploadFile(this.file, data.object.id);
            this.router.navigate([`/schedule/${this.itemId}`], { queryParams: { action: this.actiontakenlist.find(x => x.listTypeItemId == this.action.actiontaken)?.itemCode, isNSNav: true } })
            this.notificationService.showSuccess(data.resultMessage, "Success");
          }

          this.close();
        });
    }
    else {

      if (this.file != null)
        this.uploadFile(this.file, this.id);

      this.action.id = this.id;
      this.actionService.update(this.id, this.action)
        .subscribe((data: any) => {
          if (data.result) {
            this.router.navigate([`/schedule/${this.itemId}`], { queryParams: { action: this.actiontakenlist.find(x => x.listTypeItemId == this.action.actiontaken)?.itemCode, isNSNav: true } })
            this.notificationService.showSuccess(data.resultMessage, "Success");
          }
          this.close();
        });
    }
  }
}
