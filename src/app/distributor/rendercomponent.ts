import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';


@Component({
  template: `<a [routerLink]="[params.inRouterLink,params.data.id]" class="nav-link"> {{params.value}}  </a>`
})
export class RenderComponent implements AgRendererComponent {
  params: any;
  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return false;
  }

  // delete(params: any) {
  //   // //debugger;
  //   if (confirm("Are you sure, you want to delete the record?") == true) {
  //     if (params.deleteLink == "D") {
  //       //debugger;
  //       this.distributorService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             //debugger;
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             }
  //             else {

  //             }


  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     }
  //     else if (params.deleteLink == "DR") {
  //       this.distributorRegionService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }

  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "AMC") {
  //       this.AMCService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }

  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "C") {
  //       this.contactService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "CU") {
  //       this.customerservice.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             //this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "CS") {
  //       this.custsiteService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "I") {
  //       this.instrumnetservice.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "S") {
  //       this.sparepartService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "P") {
  //       this.profileService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "CUR") {
  //       this.currencyService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             //debugger;
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "COU") {
  //       this.countryService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {

  //           }
  //         });
  //     } else if (params.deleteLink == "UP") {
  //       this.userprofileService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "SR") {
  //       this.servicerequestService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "SRE") {
  //       this.servicereportservice.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "TRDET") {
  //       this.TravelDetailService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "VSDET") {
  //       this.VisaDetailsService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "LITYIT") {
  //       this.listTypeService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "STDET") {
  //       this.StayDetailsService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "LCEXP") {
  //       this.LocalExpensesService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "CSS") {
  //       this.CustomerSatisfactionSurveyService.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     } else if (params.deleteLink == "CUSTS") {
  //       this.CustomerSPInventoory.delete(params.value)
  //         .pipe(first())
  //         .subscribe({
  //           next: (data: any) => {
  //             if (data.result) {
  //               this.notificationService.showSuccess(data.resultMessage, "Success");
  //               const selectedData = params.api.getSelectedRows();
  //               params.api.applyTransaction({ remove: selectedData });
  //             } else {

  //             }
  //           },
  //           error: error => {
  //             // this.alertService.error(error);

  //           }
  //         });
  //     }
  //     else if (params.deleteLink == "TREXP") {
  //       this.TravelExpensesService.delete(params.value)
  //         .pipe(first())
  //         .subscribe((data: any) => {
  //           if (data.result) {
  //             this.notificationService.showSuccess(data.resultMessage, "Success");
  //             const selectedData = params.api.getSelectedRows();
  //             params.api.applyTransaction({ remove: selectedData });
  //           }
  //         });
  //     }
  //   }
  // }
}
