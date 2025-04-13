export type TRegisterRequest = {
  address: string;
  fullName: string;
  role: "1" | "2" | "3" | "0";
  // 1: admin, 2: nhan vien, 3: hieu truong, 0: none
  status: TRegisterRequestStatus;
  email: string;
};


export type TRegisterRequestStatus = "pending" | "approved" | "rejected";