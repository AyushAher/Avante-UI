import { Address } from "./distributor";

export class DistributorRegion {
  id: string;
  distid: string;
  region: string;
  distregname: string;
  payterms: string;
  isblocked: boolean;
  isActive: boolean;
  address: Address;
}
