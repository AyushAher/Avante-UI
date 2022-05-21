import { Component, OnInit } from '@angular/core';

import { User, Distributor, Country, DistributorRegion, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, DistributorRegionService, CountryService, DistributorService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './distregionlist.html',
})
export class DistributorRegionListComponent implements OnInit {
  user: User;
  form: FormGroup;
  distributorModel: DistributorRegion[];
  loading = false;
  submitted = false;
  isSave = false;
  distributorId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private distributorService: DistributorService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }


    this.distributorId = this.route.snapshot.paramMap.get('id');
    this.distributorService.getById(this.distributorId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.distributorModel = data.object.regions;
        },
        error: () => {
          //this.alertService.error(error);

          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['distributorregion', this.distributorId]);
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`distributorregion/${this.distributorId}/${data.id}`])
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Distributor Region',
        field: 'region',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'region',
      }, {
        headerName: 'Pay Term',
        field: 'payterms',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'payterms',
      }, {
        headerName: 'Dist Region Name',
        field: 'distregname',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'distregname',
      }

    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}
