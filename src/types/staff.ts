export interface StaffMember {
  _id?: string;
  id: string;
  apiKey: string;
  role: string;
  name?: string;
  email?: string;
  addedDate: string;
}

export interface CreateStaffMemberRequest {
  apiKey: string;
  role: string;
  name?: string;
  email?: string;
}
