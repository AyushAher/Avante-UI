export class Distributor {
  id: string;
  distname: string;
  payterms: string;
  isblocked: boolean;
  isactive: boolean;
  address: Address;
}

export class Address {
  id: string;
  addressFor: string;
  street: string;
  area: string;
  place: string;
  city: string;
  countryid: string;
  zip: string;
  geolat: string;
  geolong: string;
  isActive: boolean;
}
