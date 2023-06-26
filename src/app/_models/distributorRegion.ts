import { Address } from "./distributor";

export class DistributorRegion {
  id: string;
  distid: string;
  region: string;
  distregname: string;
  countries: string | string[];
  payterms: string;
  isblocked: boolean;
  isActive: boolean;
  isprincipal: boolean;
  address: Address;
}
