import { OnInit, Component, AfterViewInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { NotificationService, AccountService } from "../_services";
import { CompanyService } from "../_services/company.service";
import { User } from "../_models";

@Component({
  selector: "CreateBrand",
  templateUrl: "./company.component.html"
})
export class CreateCompanyComponent implements OnInit, AfterViewInit {
  Form: FormGroup
  submitted: boolean
  companyId: any
  id: any;
  isNewMode: any;
  isEditMode: any;
  hasDeleteAccess: boolean = false;

  public modalRef: BsModalRef;
  public onClose: Subject<any>;
  @Input("isDialog") isDialog: boolean = false;
  formData: { [key: string]: any; };
  user: User;

  constructor(
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private companyService: CompanyService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public activeModal: BsModalService,
  ) {
  }

  async ngOnInit() {
    this.user = this.accountService.userValue
    this.onClose = new Subject();
    this.Form = this.formBuilder.group({
      companyName: ['', [Validators.required]],
      companyEmail: ['', [Validators.required, Validators.email, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]],
      id: [""]
    });

    var id = this.activeRoute.snapshot.paramMap.get("id")
    this.isNewMode = id == null;

    if (id) {
      this.id = id;
      this.Form.get('id').setValue(id);
      var getByIdRequest: any = await this.companyService.GetCompanyById(id).toPromise();
      this.formData = getByIdRequest.object;
      this.Form.patchValue(this.formData);
    }

    if (this.isNewMode) this.FormControlDisable()
    else this.Form.disable();
  }

  ngAfterViewInit(): void {
    if (!this.isNewMode) this.Form.disable();
  }

  Back() {
    this.router.navigate(["/companylist"])
  }


  FormControlDisable() {
    if (this.isEditMode) this.Form.get('companyName').disable();
    else this.Form.get('companyName').enable();
  }

  EditMode() {
    if (!confirm("Are you sure you want to edit the record?")) return;

    this.isEditMode = true;
    this.Form.enable();
    this.FormControlDisable()
  }

  DeleteRecord() {
    this.companyService.DeleteCompany(this.id)
      .subscribe((data: any) => {
        if (data.result) {
          this.notificationService.showSuccess("Company deleted", "Success");
          this.Back();
        }
        else {
          this.notificationService.showInfo(data.resultMessage, "Info");
        }
      })
  }


  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.Form.patchValue(this.formData);
    else this.Form.reset();
    this.Form.disable()
    this.isEditMode = false;
    this.isNewMode = false;

  }

  async onSubmit() {
    this.submitted = true;
    this.Form.markAllAsTouched();

    this.Form.enable();
    let formData = this.Form.value;
    if (this.Form.invalid) return this.notificationService.showError("Form Invalid", "Error");

    // if (!this.isDialog) this.CancelEdit();

    if (!this.id) {
      this.companyService.Save(formData).subscribe((data: any) => {
        if (data.result) {
          this.onClose.next({ result: data.result, object: data.object });
          //this.activeModal.hide();
          if (!this.isDialog) {
            this.notificationService.showSuccess("Company created successfully", "Success")
            setTimeout(() => this.router.navigate(["/companylist"]), 100);
            return;
          }
        } else {
          this.notificationService.showInfo(data.resultMessage, "Info");
        }
      })

    }

    else {
      var updateRequest: any = await this.companyService.Update(this.id, formData).toPromise();
      let success = updateRequest.httpResponceCode == 200;

      if (success) {
        this.onClose.next({ result: success, object: updateRequest.object });
        if (!this.isDialog) {
          this.notificationService.showSuccess("Company Updated successfully", "Success")
          this.router.navigate(["/companylist"])
          return;
        }
      }

    }
  }

  close(success) {
    this.onClose.next(success);
  }

  get f() {
    return this.Form.controls;
  }

}