import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {actionList, ListTypeItem, User} from '../_models';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';
import {ColDef, ColumnApi, GridApi} from 'ag-grid-community';

import {AccountService, EngActionService, FileshareService, ListTypeService, NotificationService} from '../_services';
import {BsModalService} from 'ngx-bootstrap/modal';
import {HttpEventType} from "@angular/common/http";

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
  hasRemote: boolean = false;


  file: any;
  fileList: [] = [];
  public progress: number;
  public message: string;

  @Output() public onUploadFinished = new EventEmitter();


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private FileShareService: FileshareService,
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

  getActiontaken(e) {
    this.hasRemote = e.value == "a2e5b403-fd00-11eb-ae84-fc45964f576b";
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
    this.action.teamviewrecording = null
    if (this.id == null) {
      this.actionService.save(this.action)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {

              if (this.file != null) {
                this.uploadFile(this.file, data.object.id);
              }

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

      if (this.file != null) {
        this.uploadFile(this.file, this.id);
      }
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
            } else {
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
