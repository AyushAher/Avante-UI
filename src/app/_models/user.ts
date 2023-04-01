export class User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  contactid: string;
  contactId: string;
  token: string;
  email: string;
  userid: string;
  userId: string;
  userProfileId: string;
  roleId: string;
  distRegionsId: string
  custSites: string
  userType: string
  companyId: string
  brand: string
  bu: string
  company: string
  isAdmin:boolean
  isSuperAdmin:boolean
}

export class AuthenticateModel {
  username: string;
  password: string;
  companyId: string;
}

export class ChangePasswordModel {
  userId: string;
  nPass: string;
  oPass: string;
}
