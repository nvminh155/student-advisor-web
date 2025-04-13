


export enum EContractUserStatus {
  NONE,
  ADMIN,
  NHANVIEN,
  HIEUTRUONG,
}
export type TContractUser = {
  _address: string;
  fullName: string;
  role: 1n | 2n | 3n | 0n;
  email: string;
  status: EContractUserStatus;
};
