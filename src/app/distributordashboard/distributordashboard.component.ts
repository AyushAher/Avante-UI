import {Component, OnInit} from '@angular/core';
import {AccountService, DistributordashboardsettingsService, ListTypeService} from "../_services";
import {ListTypeItem, User} from "../_models";
import {first} from "rxjs/operators";

declare function DistributorDashboardCharts(): any;

@Component({
  selector: 'app-distributordashboard',
  templateUrl: './distributordashboard.component.html',
  styleUrls: ['./distributordashboard.component.css']
})
export class DistributordashboardComponent implements OnInit {
  user: User;
  row1: string[]
  row2: string[]
  private rowdata1: ListTypeItem[];

  constructor(
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private SettingsService: DistributordashboardsettingsService,
  ) {
  }

  ngOnInit() {
    DistributorDashboardCharts()
    this.user = this.accountService.userValue;

    this.SettingsService.getById(this.user.userId)
      .pipe(first())
      .subscribe({
        next: (data0: any) => {

          this.row1 = data0.object.row1.split(",")

          if (this.row1 != []) {
            this.row1.forEach((value, index) => {
              document.getElementById(value).style.visibility = 'visible'
            })
          }

          if (this.row2 != []) {
            this.row2 = data0.object.row2.split(",")
            this.row2.forEach((value, index) => {
              document.getElementById(value).style.visibility = 'visible'
            })
          }

          this.listTypeService
            .getById("DDRW1")
            .pipe(first())
            .subscribe({
              next: (data1: any) => {
                for (var i in data1) {
                  if (!this.row1.includes(data1[i].listTypeItemId)) {
                    document.getElementById((data1[i].listTypeItemId)).style.display = 'none';
                  }
                }
              }
            });

          this.listTypeService
            .getById("DDRW2")
            .pipe(first())
            .subscribe({
              next: (data2: any) => {
                for (var i in data2) {
                  console.log(data2[i].listTypeItemId)
                  if (!this.row2.includes(data2[i].listTypeItemId)) {
                    document.getElementById((data2[i].listTypeItemId)).style.display = 'none';
                  }
                }
              }
            });
        }
      })
  }
}
