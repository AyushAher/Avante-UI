import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../_services";
import {AudittrailService} from "../_services/audittrail.service";
import {User} from "../_models";
import {DatePipe} from "@angular/common";
import {FormBuilder, FormGroup} from "@angular/forms";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-audittraildetails',
  templateUrl: './audittraildetails.html',
})
export class AudittrailDetailsComponent implements OnInit {
  user: User;
  id: any;
  datepipie = new DatePipe("en-US");
  form: FormGroup;
  nValue
  oValue

  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: AudittrailService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.user = this.accountService.userValue;

    this.form = this.formBuilder.group({
      action: [{value: '', disabled: true}],
      createdon: [{value: '', disabled: true}],
      user: [{value: '', disabled: true}],
      screen: [{value: '', disabled: true}],
    })

    if (this.user.username == "admin") {
      this.id = this.route.snapshot.paramMap.get("id");
      this.Service.getById(this.id)
        .pipe(first()).subscribe({
        next: (data: any) => {
          let nString = String(data.object.nValue).replace('`', "")
          nString = nString.replace('`', "")
          this.nValue = JSON.parse(String(nString))

          let oString = String(data.object.oValue).replace('`', "")
          oString = oString.replace('`', "")
          this.oValue = JSON.parse(String(oString))

          data.object.createdon = this.datepipie.transform(data.object.createdon, "MM-dd-yyyy HH:mm:ss")
          this.form.patchValue(data.object);
        }
      })
    }

  }

}
