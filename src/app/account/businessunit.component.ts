import { OnInit, Component, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalService } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";
import { NotificationService } from "../_services";
import { BusinessUnitService } from "../_services/businessunit.service";

@Component({
  templateUrl: "./businessunit.component.html"
})
export class CreateBusinessUnitComponent implements OnInit {
  Form: FormGroup
  submitted: boolean
  @Input("companyId") companyId: any

  constructor(
    private notificationService: NotificationService,
    private bsModelService: BsModalService,
    private formBuilder: FormBuilder,
    private businessUnitService: BusinessUnitService,
  ) {
  }

  ngOnInit(): void {
    this.Form = this.formBuilder.group({
      businessUnitName: ['', [Validators.required]],
      companyId: ['', [Validators.required]]
    });

    if (this.companyId) this.f.companyId.setValue(this.companyId)
    else {
      this.close()
      this.notificationService.showError("Some Error Occurred", "Error")
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.Form.invalid) return this.notificationService.showError("Form Invalid", "Error");

    this.businessUnitService.Save(this.Form.value)
      .pipe(first()).subscribe(() => this.close())
  }

  get f() {
    return this.Form.controls;
  }

  close() {
    this.bsModelService.hide();
    this.notificationService.filter("cim");
  }
}