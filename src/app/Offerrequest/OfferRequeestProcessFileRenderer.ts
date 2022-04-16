import { HttpEventType, HttpResponse } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { first } from "rxjs/operators";
import { FileshareService } from "../_services";
import { OfferRequestProcessesService } from "../_services/offer-request-processes.service";

@Component({
    selector: "app-ProcessFileRenderer",
    templateUrl: "./downloadFile.html",
})
export class OfferRequeestProcessFileRenderer implements OnInit {
    list: any[] = []
    @Input() parameters: any;

    constructor(
        private FileShareService: FileshareService,
    ) { }

    ngOnInit(): void {

        this.FileShareService.list(this.parameters.id)
            .pipe(first())
            .subscribe((data: any) => this.list = data.object);

    }

    download(params: any) {
        this.FileShareService.download(params).subscribe((event) => {
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
        a.download = this.parameters.id;
        a.href = URL.createObjectURL(downloadedFile);
        a.innerHTML = this.parameters.fileUrl;
        a.target = "_blank";
        a.click();
        document.body.removeChild(a);
    }
}