import {Component} from '@angular/core';
import {first} from 'rxjs/operators';
import {AgRendererComponent} from 'ag-grid-angular';
import {
  AlertService,
  AmcService,
  ContactService,
  CountryService,
  CurrencyService,
  CustomersatisfactionsurveyService,
  CustomerService,
  CustomerSiteService,
  DistributorRegionService,
  DistributorService,
  InstrumentService,
  ListTypeService,
  LocalExpensesService,
  NotificationService,
  ProfileService,
  ServiceReportService,
  ServiceRequestService,
  SparePartService,
  StaydetailsService,
  TravelDetailService,
  UserProfileService,
  VisadetailsService
} from '../_services';
import {CustspinventoryService} from "../_services/custspinventory.service";
import {OfferrequestService} from "../_services/Offerrequest.service";


@Component({
  template: `<a [routerLink]="[params.inRouterLink,params.value]" class="btn btn-link"
                style="margin-right: 10px; padding: 0;"><i class="fas fa-pen" title="Edit"></i></a>
  <button class="btn btn-link"  [disabled]="!params.deleteaccess" (click)="delete(params)"><i class="fas fa-trash-alt"
                                                                                       title="Delete"></i></button>`
})
export class RenderComponent implements AgRendererComponent  {
  params: any;
  constructor(private distributorService: DistributorService,
              private distributorRegionService: DistributorRegionService,
              private alertService: AlertService,
              private contactService: ContactService,
              private custsiteService: CustomerSiteService,
              private sparepartService: SparePartService,
              private instrumnetservice: InstrumentService,
              private customerservice: CustomerService,
              private notificationService: NotificationService,
              private profileService: ProfileService,
              private userprofileService: UserProfileService,
              private currencyService: CurrencyService,
              private countryService: CountryService,
              private listTypeService: ListTypeService,
              private servicerequestService: ServiceRequestService,
              private servicereportservice: ServiceReportService,
              private TravelDetailService: TravelDetailService,
              private VisaDetailsService: VisadetailsService,
              private StayDetailsService: StaydetailsService,
              private LocalExpensesService: LocalExpensesService,
              private CustomerSatisfactionSurveyService: CustomersatisfactionsurveyService,
              private CustomerSPInventoory: CustspinventoryService,
              private OfferrequestService: OfferrequestService,
              private AMCService: AmcService
  ) {

  }
  agInit(params: any): void {
   // //debugger;
    this.params = params;

  }

  refresh(params: any): boolean {
    return false;
  }

  delete(params: any) {
    // //debugger;
    if (confirm("Are you sure, you want to delete the record?") == true) {
      if (params.deleteLink == "D") {
        //debugger;
        this.distributorService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              //debugger;
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({ remove: selectedData });
              }
              else {
                this.notificationService.showError(data.resultMessage, "Error");
              }


            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      }
      else if (params.deleteLink == "DR") {
        this.distributorRegionService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({ remove: selectedData });
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }

            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "AMC") {
        this.AMCService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }

            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "C") {
        this.contactService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "CU") {
        this.customerservice.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              //this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "CS") {
        this.custsiteService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "I") {
        this.instrumnetservice.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "S") {
        this.sparepartService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "P") {
        this.profileService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "CUR") {
        this.currencyService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              //debugger;
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "COU") {
        this.countryService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "UP") {
        this.userprofileService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "SR") {
        this.servicerequestService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "SRE") {
        this.servicereportservice.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "TRDET") {
        this.TravelDetailService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "VSDET") {
        this.VisaDetailsService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "LITYIT") {
        this.listTypeService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "STDET") {
        this.StayDetailsService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "LCEXP") {
        this.LocalExpensesService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "CSS") {
        this.CustomerSatisfactionSurveyService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "CUSTS") {
        this.CustomerSPInventoory.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      } else if (params.deleteLink == "OFFER") {
        this.OfferrequestService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({remove: selectedData});
              } else {
                this.notificationService.showError(data.resultMessage, "Error");
              }
            },
            error: error => {
              // this.alertService.error(error);
              this.notificationService.showError(error, "Error");
            }
          });
      }
    }
  }
}
