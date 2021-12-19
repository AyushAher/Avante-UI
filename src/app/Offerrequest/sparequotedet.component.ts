import {Component, Input, OnInit} from '@angular/core';
import {User} from "../_models";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ColDef, ColumnApi, GridApi} from "ag-grid-community";
import {Sparequotedet} from "../_models/sparequotedet";
import {ActivatedRoute, Router} from "@angular/router";
import {
  AccountService,
  ConfigTypeValueService,
  ListTypeService,
  NotificationService,
  ProfileService
} from "../_services";
import {BsModalService} from "ngx-bootstrap/modal";
import {first} from "rxjs/operators";
import {SparequotedetService} from "../_services/sparequotedet.service";
import {DatePipe} from "@angular/common";

// import {moment} from "ngx-bootstrap/chronos/test/chain";

@Component({
  selector: 'app-sparequotedet',
  templateUrl: './sparequotedet.component.html'
})

export class SparequotedetComponent implements OnInit {

  user: User;
  Form: FormGroup;
  sparequotedet: Sparequotedet
  loading = false;
  submitted = false;
  isSave = false;
  listid: string;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  closeResult: string;
  statusList: any
  raisedByList: any
  @Input() public parentId;
  @Input() public id;

  currentStatus: string;
  completedId: string = "706a8df4-5202-11ec-abe2-54bf64020316";
  PORaisedId: string = "707d7598-5202-11ec-abe2-54bf64020316";
  shippedId: string = "70914028-5202-11ec-abe2-54bf64020316";

  datepipie = new DatePipe("en-US");
  showStatus: boolean;
  ShowCustResponseDate: boolean;
  isRaisedBy: boolean;

  profilePermission: any;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  hasId: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private configTypeService: ConfigTypeValueService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private Service: SparequotedetService,
    private profileService: ProfileService,
    public activeModal: BsModalService
  ) {
  }


  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "OFREQ");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    this.Form = this.formBuilder.group({
      raisedBy: ['', Validators.required],
      raisedDate: ["", Validators.required],
      custResponseDate: [""],
      comments: [''],
      status: [''],
      zohoPORaisedDate: [""],
      deliveredOn: [""],
      shippedDate: [""],
      isactive: [true],
    });

    this.listTypeService.getById("SQDTS")
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.statusList = data;
        }
      });

    this.Service.GetDistContacts(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.raisedByList = data.object;
        }
      });

    if (this.id != undefined) {
      this.hasId = true
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            data.object.zohoPORaisedDate = this.datepipie.transform(data.object.zohoPORaisedDate, "MM/dd/yyyy");
            data.object.deliveredOn = this.datepipie.transform(data.object.deliveredOn, "MM/dd/yyyy");
            data.object.custResponseDate = this.datepipie.transform(data.object.custResponseDate, "MM/dd/yyyy");
            data.object.shippedDate = this.datepipie.transform(data.object.shippedDate, "MM/dd/yyyy");
            data.object.raisedDate = this.datepipie.transform(data.object.raisedDate, "MM/dd/yyyy");
            this.statusChanged(data.object.status)

            if ((data.object.raisedBy != null && data.object.raisedBy != "") && (data.object.raisedDate != null && data.object.raisedDate != "")) {
              this.ShowCustResponseDate = true
              this.isRaisedBy = true
              this.Form.get('custResponseDate').setValidators([Validators.required])
              this.Form.get('custResponseDate').updateValueAndValidity()

            }
            this.Form.patchValue(data.object);

            var raisedby = document.getElementById('raisedby') as HTMLInputElement
            raisedby.disabled = true
            var raisedDAte = document.getElementById('raiseddate') as HTMLInputElement
            raisedDAte.disabled = true
          }
        });
    } else {
      this.hasId = false
    }
    this.Form.get('custResponseDate').valueChanges.subscribe(value => {
      if (value != null) {
        this.Form.get('status').setValidators([Validators.required])
        this.Form.get('status').updateValueAndValidity()
      }
    })
    this.Form.get('status').valueChanges.subscribe(
      value => {
        if (value != null) {
          switch (value) {
            case this.completedId:
              this.Form.get('deliveredOn').setValidators([Validators.required])
              this.Form.get('deliveredOn').updateValueAndValidity()

              this.Form.get('shippedDate').clearValidators()
              this.Form.get('shippedDate').updateValueAndValidity()

              this.Form.get('zohoPORaisedDate').clearValidators()
              this.Form.get('zohoPORaisedDate').updateValueAndValidity()

              break;

            case this.shippedId:
              this.Form.get('deliveredOn').clearValidators()
              this.Form.get('deliveredOn').updateValueAndValidity()

              this.Form.get('shippedDate').setValidators([Validators.required])
              this.Form.get('shippedDate').updateValueAndValidity()

              this.Form.get('zohoPORaisedDate').clearValidators()
              this.Form.get('zohoPORaisedDate').updateValueAndValidity()
              break;

            case this.PORaisedId:
              this.Form.get('deliveredOn').clearValidators()
              this.Form.get('deliveredOn').updateValueAndValidity()

              this.Form.get('shippedDate').clearValidators()
              this.Form.get('shippedDate').updateValueAndValidity()

              this.Form.get('zohoPORaisedDate').setValidators([Validators.required])
              this.Form.get('zohoPORaisedDate').updateValueAndValidity()
              break;
          }

        }
      }
    )
  }

  get f() {
    return this.Form.controls;
  }

  changeDate(e, screen) {
    if (e != null && e != "") {
      switch (screen) {

        case "RaisedBy":
          this.isRaisedBy = true
          break

        case "CustResDate":
          this.showStatus = true
          break

        case "RaisedDate":
          this.ShowCustResponseDate = true
          break
      }
    }
  }

  close() {
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

  statusChanged(status: string) {
    this.currentStatus = status;
  }

  onValueSubmit() {
    //debugger;

    this.submitted = true;

    if (this.Form.invalid) {
      console.log(this.Form.controls['shippedDate'].errors)
      return
    }

    this.isSave = true;
    this.loading = true;

    this.sparequotedet = this.Form.value;
    this.sparequotedet.offerRequestId = this.parentId;

    this.sparequotedet.zohoPORaisedDate = this.datepipie.transform(this.sparequotedet.zohoPORaisedDate, "MM/dd/yyyy");
    this.sparequotedet.deliveredOn = this.datepipie.transform(this.sparequotedet.deliveredOn, "MM/dd/yyyy");
    this.sparequotedet.custResponseDate = this.datepipie.transform(this.sparequotedet.custResponseDate, "MM/dd/yyyy");
    this.sparequotedet.raisedDate = this.datepipie.transform(this.sparequotedet.raisedDate, "MM/dd/yyyy");
    this.sparequotedet.shippedDate = this.datepipie.transform(this.sparequotedet.shippedDate, "MM/dd/yyyy");

    if (this.id == null) {
      this.Service.save(this.sparequotedet)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.result) {
              this.notificationService.showSuccess(data.resultMessage, "Success");
              this.close();
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
    } else {
      this.sparequotedet.id = this.id;
      this.Service.update(this.id, this.sparequotedet)
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
