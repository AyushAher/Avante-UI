import { Component } from "@angular/core";
import { first } from "rxjs/operators";
import { AgRendererComponent } from "ag-grid-angular";
import {
  NotificationService,
  FileshareService,
} from "../_services";
import { HttpEventType, HttpResponse } from "@angular/common/http";

@Component({
  template: ` <button
      type="button"
      class="btn btn-link"
      (click)="download(params)"
    >
      <i class="fas fa-download" title="Download"></i>
    </button>

    <button class="btn btn-link" *ngIf="params.deleteaccess" type="button"
     (click)="delete(params)">
      <i class="fas fa-trash-alt" title="Delete"></i>
    </button>`,
})
export class FilerendercomponentComponent implements AgRendererComponent {
  params: any;
  constructor(
    private fileService: FileshareService,
    private notificationService: NotificationService
  ) { }


  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return false;
  }

  delete(params) {
    this.fileService
      .delete(params.value)
      .pipe(first())
      .subscribe({
        next: (data) => {
          if (data) {
            this.refresh(params);

            this.notificationService.showSuccess("File Deleted", "Success");
            const selectedData = params.api.getSelectedRows();
            params.api.applyTransaction({ remove: selectedData });
          }
        },
        error: (error) => {
          
        },
      });
  }

  download(params: any) {
    this.fileService.download(this.params.value).subscribe((event) => {
      if (event.type === HttpEventType.Response) {
        this.downloadFile(event);
      }
    });
  }

  private downloadFile(data: HttpResponse<Blob>) {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const a = document.createElement("a");
    a.setAttribute("style", "display:block;");
    document.body.appendChild(a);
    a.download = this.params.id;
    a.href = URL.createObjectURL(downloadedFile);
    a.innerHTML = this.params.fileUrl;
    a.target = "_blank";
    a.click();
    document.body.removeChild(a);
  }
}
