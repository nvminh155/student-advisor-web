export type TRegisterRequest = {
  address: string;
  fullName: string;
  role: "1" | "2";
  status: TRegisterRequestStatus;
  email: string;
};


export type TRegisterRequestStatus = "pending" | "approved" | "rejected";