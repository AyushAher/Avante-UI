import { Address } from "./distributor";

export class Contact {
  id: string;
  fname: string;
  lname: string;
  mname: string;
  pcontactno: string;
  pemail: string;
  scontactno: string;
  whatsappNo: string;
  semail: string;
  designationid: string;
  designation: string;
  isActive: boolean;
  address: Address;
  contactMapping: ContactMapping;
  //street: string;
  //area: string;
  //place: string;
  //city: string;
  //country: string;
  //zip: string;
  //latitude: string;
  //longitude: string;
  //addressActive: boolean;

}

export class ContactMapping {
  mappedFor: string;
  parentId: string;
}
