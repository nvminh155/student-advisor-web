"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import { toast } from "sonner";

import { useDocumentContractContext } from "@/contexts/document-contract-context";

import { doc, getDoc } from "firebase/firestore";

import { db } from "@/config/firebase";
import { TRegisterRequest } from "@/types/register_request";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  const { connectWallet, currentAccount, getEthereumContract } = useDocumentContractContext();
  const navigate = useNavigate();

  const [isConnecting, setIsConnecting] = useState(false);

  const checkUser = async () => {
    const contract = await getEthereumContract();

    await contract.handleLogin().then(user => {
      
      if(!user) return;
      
      console.log("User:", typeof user.role);
      if(user.role == 1) {
        navigate("/admin1")
      }

      if(user.role == 3) {
        navigate("/master-user")
      }

      //add login as nhan vien
      
    }).catch(err => {
      console.error("Error checking user:", err);
      toast("Login failed")
    })

  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    await connectWallet()
      .then(async () => {
        await checkUser();
      })
      .catch((err) => {
        console.error("Error connecting wallet:", err);
        toast("Connection failed", {
          description: "Failed to connect to MetaMask",
        });
      })
      .finally(async () => {
        setIsConnecting(false);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Student Advisor Dashboard
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* {error && (
            <div className="bg-red-50 p-4 rounded-md text-sm text-red-500">
              {error}
            </div>
          )} */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleConnectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Connecting...
              </span>
            ) : (
              <span className="flex items-center">
                <Wallet className="mr-2 h-4 w-4" />
                Connect MetaMask
              </span>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
