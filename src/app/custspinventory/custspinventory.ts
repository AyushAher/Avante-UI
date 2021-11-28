import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {
  AccountService,
  AlertService,
  ConfigTypeValueService,
  ListTypeService,
  NotificationService,
  SparePartService
} from "../_services";
import {CustspinventoryService} from "../_services/custspinventory.service";
import {Custspinventory} from "../_models/custspinventory";
import {first} from "rxjs/operators";
import {ConfigTypeValue, ListTypeItem, ResultMsg, SparePart, User} from "../_models";

@Component({
  selector: "app-Custspinventory",
  templateUrl: "./custspinventory.html",
})

export class CustSPInventoryComponent implements OnInit {
  form: FormGroup;
  model: Custspinventory;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  user: User;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;


  replacementParts: SparePart[];
  configValueList: ConfigTypeValue[];
  listTypeItems: ListTypeItem[];
  code: string = "CONTY";

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private listTypeService: ListTypeService,
    private Service: CustspinventoryService,
    private sparePartService: SparePartService,
    private configService: ConfigTypeValueService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.form = this.formBuilder.group({
      isactive: [true],
      configType: ["", Validators.required],
      configValue: ["", Validators.required],
      partNo: ["", Validators.required],
      hscCode: ["", Validators.required],
      qtyAvailable: ["", Validators.required],
    })
    this.id = this.route.snapshot.paramMap.get("id");
    this.listTypeService.getById(this.code)
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.listTypeItems = data;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
    if (this.id != null) {
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {

            this.configService.getById(data.object.configType)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  this.configValueList = data.object;
                },
                error: error => {
                  this.notificationService.showError(error, "Error");
                  this.loading = false;
                }
              });
            this.form.patchValue(data.object);

          },
          error: (error) => {
            this.notificationService.showError("Error", "Error");
            this.loading = false;
          },
        });
    }
  }

  onConfigChange(param: string) {
    this.configService.getById(param)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.configValueList = data.object;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

  onConfigVChange(configid: string, configval: string) {
    //debugger;
    this.sparePartService.getByConfignValueId(configid, configval)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.replacementParts = data.object;
        },
        error: error => {
          this.notificationService.showError(error, "Error");
          this.loading = false;
        }
      });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();
    // stop here if form is invalid
    if (this.form.invalid) return
    this.model = this.form.value
    if (this.id == null) {
      this.Service.save(this.model)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            debugger;
            if (data.result) {
              this.notificationService.showSuccess(
                data.resultMessage,
                "Success"
              );
              this.router.navigate(["Custspinventorylist"]);
            } else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;
          },
          error: (error) => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          },
        });
    } else {
      this.model = this.form.value;
      this.model.id = this.id;
      this.Service.update(this.id, this.model)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            if (data.result) {
              this.notificationService.showSuccess(
                data.resultMessage,
                "Success"
              );
              this.router.navigate(["Custspinventorylist"]);
            } else {
              this.notificationService.showError(data.resultMessage, "Error");
            }
            this.loading = false;
          },
          error: (error) => {
            this.notificationService.showError(error, "Error");
            this.loading = false;
          },
        });
    }
  }
}
