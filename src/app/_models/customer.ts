import { Address } from "./distributor";

export class Customer {
  id: string;
  custname: string;
  defdistid: string;
  defdistregionid: string;
  isActive: boolean;
  address: Address;
}

