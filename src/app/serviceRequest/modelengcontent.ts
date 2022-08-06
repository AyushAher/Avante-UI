import {Component, Input, OnInit} from '@angular/core';

import {EngineerCommentList, User} from '../_models';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';
import {ColDef, ColumnApi, GridApi} from 'ag-grid-community';

import {
  AccountService,
  ConfigTypeValueService,
  EngCommentService,
  ListTypeService,
  NotificationService
} from '../_services';
import {BsModalService} from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-modelcomponent',
  templateUrl: './modelengcontent.html',
})
export class ModelEngContentComponent implements OnInit {
  user: User;
  engineerCommentForm: FormGroup;
  engcomment: EngineerCommentList;
  loading = false;
  submitted = false;
  isSave = false;
  //id: string;
  listid: string;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  closeResult: string;
  @Input() public itemId;
  @Input() public id;
  @Input() public engineerid;


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private configTypeService: ConfigTypeValueService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private engcommentService: EngCommentService,
    public activeModal: BsModalService
  ) {
  }


  ngOnInit() {
    this.user = this.accountService.userValue;

    this.engineerCommentForm = this.formBuilder.group({
      comments: ['', Validators.required],
      nextdate: ['', Validators.required],
      isactive: [true],
      isdeleted: [false],

    });
    if (this.id != undefined) {
      this.engcommentService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.engineerCommentForm.patchValue(data.object);
            this.engineerCommentForm.patchValue({"nextdate": new Date(data.object.nextdate)});
          },
          error: error => {
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

    if (this.engineerCommentForm.invalid) {
      return;
    }
    this.engcomment = this.engineerCommentForm.value;
    this.engcomment.servicerequestid = this.itemId;
    this.engcomment.engineerid = this.engineerid;

    if (this.id == null) {
      this.engcommentService.save(this.engcomment)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.close();
              //this.configList = data.object;
              // this.listvalue.get("configValue").setValue("");
            } else {
              
              this.close();
            }
            this.loading = false;
          },
          error: error => {
            
            this.loading = false;
          }
        });
    } else {
      this.engcomment.id = this.id;
      this.engcommentService.update(this.id, this.engcomment)
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
              
              this.close();
            }
            this.loading = false;
          },
          error: error => {
            
            this.loading = false;
          }
        });
    }
  }
}
