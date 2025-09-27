import { ObjectId } from 'mongodb';

export interface StaffMember {
  _id?: ObjectId | string;
  id: string;
  apiKey: string;
  role: 'Trainer' | 'Examiner' | 'Admin';
  name?: string;
  addedDate: string;
  lastActive?: string;
  permissions?: string[];
  status: 'active' | 'inactive' | 'suspended';
}

export interface CreateStaffMemberRequest {
  apiKey: string;
  role: 'Trainer' | 'Examiner' | 'Admin';
  name?: string;
}

export interface UpdateStaffMemberRequest {
  role?: 'Trainer' | 'Examiner' | 'Admin';
  name?: string;
  status?: 'active' | 'inactive' | 'suspended';
  permissions?: string[];
}

export interface StaffRolePermissions {
  Trainer: string[];
  Examiner: string[];
  Admin: string[];
}
