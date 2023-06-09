import { OnInit, Component, AfterViewInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { NotificationService, AccountService } from "../_services";
import { BusinessUnitService } from "../_services/businessunit.service";
import { CompanyService } from "../_services/company.service";

@Component({
  templateUrl: "./businessunit.component.html"
})
export class CreateBusinessUnitComponent implements OnInit, AfterViewInit {
  Form: FormGroup
  submitted: boolean
  @Input("companyId") companyId: any
  id: any;

  isNewMode: any;
  isEditMode: any;

  hasDeleteAccess: boolean = false;
  companyList: any;


  public modalRef: BsModalRef;
  public onClose: Subject<any>;
  @Input("isDialog") isDialog: boolean = false;
  formData: { [key: string]: any; };

  constructor(
    public activeModal: BsModalService,
    private businessUnitService: BusinessUnitService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private AccountService: AccountService,
    private CompanyService: CompanyService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.onClose = new Subject();
    this.hasDeleteAccess = this.AccountService.userValue.isAdmin;

    this.Form = this.formBuilder.group({
      businessUnitName: ['', [Validators.required]],
      companyId: ['', [Validators.required]],
      company: ['', [Validators.required]],
      id: [""]
    });
    var id = this.activeRoute.snapshot.paramMap.get("id")
    this.isNewMode = id == null;

    let user = this.AccountService.userValue;
    console.log(user);

    this.Form.get('companyId').setValue(user.companyId);
    this.Form.get('companyId').disable();

    if (id) {
      this.id = id;
      this.Form.get('id').setValue(id);

      var getByIdRequest: any = await this.businessUnitService.GetById(id).toPromise();
      this.formData = getByIdRequest.object;
      this.Form.patchValue(this.formData);
    }

    var request: any = await this.CompanyService.GetAllCompany().toPromise();

    this.companyList = request.object;


    if (this.companyId) this.f.companyId.setValue(this.companyId)
    else {
      this.companyId = user.companyId;
    }

    this.Form.get("company")
      .setValue(this.companyList?.find(comp => comp.id == this.companyId)?.companyName)

  }

  ngAfterViewInit(): void {
    if (!this.isNewMode) {
      this.Form.disable();
    }

    this.FormControlDisable()
  }

  Back() {
    this.router.navigate(["/businessunitlist"]);
  }


  EditMode() {
    if (!confirm("Are you sure you want to edit the record?")) return;

    this.isEditMode = true;
    this.Form.enable();
    this.FormControlDisable();
    this.router.navigate(
      ["."],
      {
        relativeTo: this.activeRoute,
        queryParams: {
          isNSNav: false
        },
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
  }

  DeleteRecord() {
    this.businessUnitService.Delete(this.id)
      .subscribe((data: any) => {
        if (data.result) {
          this.notificationService.showSuccess("Deleted Successfully", "Success")
          this.router.navigate(["/businessunitlist"], { queryParams: { isNSNav: true } })
        }
        else this.notificationService.showInfo(data.resultMessage, "Error")
      })
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.Form.patchValue(this.formData);
    else this.Form.get("businessUnitName").reset();

    this.Form.disable()
    this.isEditMode = false;
    this.isNewMode = false;

    this.notificationService.SetNavParam();
  }

  FormControlDisable() {
    this.Form.get('companyId').disable();
    this.Form.get('company').disable();
  }

  async onSubmit() {
    this.submitted = true;
    this.Form.markAllAsTouched();

    if (this.Form.invalid) return;

    this.Form.enable();
    let formData = this.Form.value;
    this.FormControlDisable();

    if (!this.id) {
      this.businessUnitService.Save(formData)
        .subscribe((data: any) => {
          var success = data.result;
          if (success) {
            this.notificationService.showSuccess("Business Unit created successfully!", "Success")
            this.router.navigate(["/businessunitlist"],
              {
                queryParams: { isNSNav: true },
              });

          }
          else this.notificationService.showInfo(data.resultMessage, "Info");
        })
    }

    else {
      this.businessUnitService.Update(this.id, formData)
        .subscribe((data: any) => {
          var success = data.result;
          if (success) {
            this.onClose.next({ result: success, object: data.object });
            this.notificationService.showSuccess("Business Unit updated successfully!", "Success")
            this.router.navigate(["/businessunitlist"],
              {
                queryParams: { isNSNav: true },
              });
          }

          else this.notificationService.showInfo(data.resultMessage, "Info");
        })
    }
  }


  close(success) {
    this.onClose.next(success);
  }

  get f() {
    return this.Form.controls;
  }

}