import { DatePipe } from "@angular/common";
import { BsDatepickerConfig } from "ngx-bootstrap/datepicker";

export function ConfigBsDatepicker(): BsDatepickerConfig {
    return Object.assign(new BsDatepickerConfig(), {
        dateInputFormat: 'DD/MM/YYYY'
    });
}

export function GetParsedDate(date: string | Date): Date {
    if (date === null || date === undefined) return;
    if (typeof date != "string") date = date.toString();
    if (date?.search('/') === -1) return new Date(date)

    var parts = [];
    parts = date.split("/");

    var dt = new Date(parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10));
    return dt;

}

export function GetParsedDatePipe(date: string | Date, formatDate: string): string {
    var datepipe = new DatePipe('en-US');

    if (date === null || date === undefined) return;
    if (typeof date != "string") date = date.toString();
    if (date?.search('/') === -1) return datepipe.transform(date, formatDate);
    
    var parts = [];
    parts = date.split("/");

    var dt = new Date(parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10));
    return datepipe.transform(dt, formatDate);
}