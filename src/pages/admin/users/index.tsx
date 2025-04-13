"use client";

import { useState, useEffect } from "react";
import { Check, Clock, Filter, MoreHorizontal, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useDocumentContractContext } from "@/contexts/document-contract-context";
import { formatWalletAddress } from "@/utils/formatWalletAddress";
import Loading from "@/components/loading";
import { TContractUser } from "@/types";
import { TRegisterRequest } from "@/types/register_request";

// Types for our user registration data
type UserStatus = "pending" | "approved" | "rejected";

export default function AdminUsersPage() {
  const { getEthereumContract, sendTransaction } = useDocumentContractContext();

  const [users, setUsers] = useState<TRegisterRequest[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<TRegisterRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<TRegisterRequest | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<UserStatus | null>(null);

  // Fetch users data (mock data for demonstration)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real application, this would be an API call
        // For demo purposes, we'll use mock data
        const firebaseQuery = query(collection(db, "register_requests"));
        const res = await getDocs(firebaseQuery);
        const mockUsers = res.docs.map((doc) => {
          const data = doc.data();
          return {
            address: doc.id,
            email: data.email,
            role: data.role,
            fullName: data.fullName,
            status: data.status,
          };
        }) as TRegisterRequest[];
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast("Error", {
          description: "Failed to load user registration data",
        });
        setIsLoading(false);
      }
    };

    fetchUsers();
    // const fetchUserV2 = async () => {
    //   const contract = await getEthereumContract();

    //   await contract.getUsers().then((tx: any) => {
    //     console.log("User data:", tx);
    //     const data = tx.map(
    //       (res: {
    //         _address: string;
    //         userInfo: Omit<TContractUser, "_address">;
    //       }) => {
           
    //         return {
    //           _address: res._address,
    //           fullName: res.userInfo.fullName,
    //           role: res.userInfo.role,
    //           email: res.userInfo.email,
    //           status: res.userInfo.status,
    //         } as TContractUser;
    //       }
    //     );

    //     console.log("Transaction hash:", data);
    //   });
    // };
    // fetchUserV2();
  }, [toast]);

  // Filter users based on search query and status filter
  useEffect(() => {
    let result = users;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter);
    }

    // Apply search filter (case insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.address.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(result);
  }, [users, searchQuery, statusFilter]);

  // Handle status change
  const handleStatusChange = async (
    user: TRegisterRequest,
    newStatus: UserStatus
  ) => {
    setSelectedUser(user);
    setActionType(newStatus);
    setConfirmDialogOpen(true);
  };

  const getUser = async () => {
    const contract = await getEthereumContract();

    await contract
      .getUser(selectedUser?.address)
      .then((tx: any) => {
        console.log("Transaction hash:", tx.hash);
        console.log("User data:", tx);
        return tx;
      })
      .catch((e) => {
        console.error(e);
      });
  };
  // Confirm status change
  const confirmStatusChange = async () => {
    if (!selectedUser || !actionType) return;

    const contract = await getEthereumContract();

    await contract
      .approveRegister(
        selectedUser?.address,
        selectedUser?.fullName,
        selectedUser?.role,
        selectedUser?.email
      )
      .then(async (tx: any) => {
        console.log("Transaction hash:", tx.hash);
        updateUserStatus();
        await sendTransaction(selectedUser?.address);
        return tx;
      })
      .catch((e) => {
        console.error(e);
      });

    async function updateUserStatus() {
      if (!selectedUser || !actionType) return;

      try {
        // In a real application, this would be an API call
        // For demo purposes, we'll update the local state

        // Simulate API delay
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        updateDoc(doc(db, "register_requests", selectedUser.address), {
          status: actionType,
        });
        // Update user status
        const updatedUsers = users.map((user) =>
          user.address === selectedUser.address
            ? { ...user, status: actionType }
            : user
        );

        setUsers(updatedUsers);

        // Show success message
        let actionText = "";
        if (actionType === "approved") {
          actionText = "approved";
        } else if (actionType === "rejected") {
          actionText = "rejected";
        } else {
          actionText = "marked as pending";
        }

        toast("Status updated", {
          description: `${selectedUser.address}'s registration has been ${actionText}`,
        });
      } catch (error) {
        console.error("Error updating status:", error);
        toast("Error", {
          description: "Failed to update user status",
        });
      } finally {
        setConfirmDialogOpen(false);
        setSelectedUser(null);
        setActionType(null);
        setIsLoading(false);
      }
    }
  };

  // Format wallet address for display

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
        );
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className=" mx-auto py-6">
      {/* <Loading isLoading={isLoading} className="bg-black/50 fixed w-full h-full z-10 justify-center" /> */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            User Registration Management
          </CardTitle>
          <CardDescription>
            Approve or reject user registration requests from blockchain wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and search */}
          <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as UserStatus | "all")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Users table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading user data...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No user registration requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.address}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>{formatWalletAddress(user.address)}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === "3" ? "Hiệu trưởng" : "Nhân viên"}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-green-600 focus:text-green-600"
                              onClick={() =>
                                handleStatusChange(user, "approved")
                              }
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() =>
                                handleStatusChange(user, "rejected")
                              }
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-yellow-600 focus:text-yellow-600"
                              onClick={() =>
                                handleStatusChange(user, "pending")
                              }
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Mark as Pending
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              {actionType === "approved" &&
                "Are you sure you want to approve this user registration?"}
              {actionType === "rejected" &&
                "Are you sure you want to reject this user registration?"}
              {actionType === "pending" &&
                "Are you sure you want to mark this registration as pending?"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Full Name:</span>
                  <span>{selectedUser.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Wallet Address:</span>
                  <span>{formatWalletAddress(selectedUser.address)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Current Status:</span>
                  <span>{getStatusBadge(selectedUser.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">New Status:</span>
                  <span>
                    {actionType === "approved" && (
                      <Badge className="bg-green-500">Approved</Badge>
                    )}
                    {actionType === "rejected" && (
                      <Badge className="bg-red-500">Rejected</Badge>
                    )}
                    {actionType === "pending" && (
                      <Badge className="bg-yellow-500">Pending</Badge>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            {(() => {
              let buttonVariant: "default" | "destructive" | "outline" =
                "outline";
              if (actionType === "approved") {
                buttonVariant = "default";
              } else if (actionType === "rejected") {
                buttonVariant = "destructive";
              }
              return (
                <Button onClick={confirmStatusChange} variant={buttonVariant}>
                  Confirm
                </Button>
              );
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
