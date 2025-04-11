import React from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TRegisterRequest, TRegisterRequestStatus } from '@/types/register_request';
import { formatWalletAddress } from '@/utils/formatWalletAddress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


interface UserInfoDialogProps {
  trigger: React.ReactNode;
  userInfo: TRegisterRequest | null;
}


const UserInfoDialog = ({trigger, userInfo}: UserInfoDialogProps) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

  const getStatusBadge = (status: TRegisterRequestStatus) => {
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
    <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>\
    <DialogTrigger className='flex-1 w-full'>
      {trigger}
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogDescription>
          
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        {userInfo && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Full Name:</span>
              <span>{userInfo.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Wallet Address:</span>
              <span>{formatWalletAddress(userInfo.address)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Current Status:</span>
              <span>{getStatusBadge(userInfo.status)}</span>
            </div>
    
          </div>
        )}
      </div>
      <DialogFooter>
       
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )
}

export default UserInfoDialog