"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useNavigate } from "react-router-dom";
import { useDocumentContractContext } from "@/contexts/document-contract-context";

import { setDoc, doc } from "firebase/firestore";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/config/firebase";

export default function RegisterPage() {
  const { connectWallet, currentAccount } = useDocumentContractContext();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Connect to MetaMask wallet

  // Register user with wallet signature

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    await connectWallet()
      .then(() => {
        toast("Wallet connected", {
          description: `Connected to ${currentAccount?.substring(
            0,
            6
          )}...${currentAccount?.substring(currentAccount.length - 4)}`,
        });
      })
      .catch((err) => {
        console.error("Error connecting wallet:", err);
        toast("Connection failed", {
          description: "Failed to connect to MetaMask",
        });
      })
      .finally(() => {
        setIsConnecting(false);
      });
  };

  const registerUser = async () => {
    if (!currentAccount) {
      toast("Wallet not connected", {
        description: "Please connect your wallet first",
      });
      return;
    }

    try {
      setIsRegistering(true);

      // Create a provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Sign the message
      // const signature = await signer.signMessage("Registering for Document Management System");


      console.log({
        provider,
        signer
      })

      // Upload registration data to Firebase
      await setDoc(doc(db, "register_requests", currentAccount), {
        fullName,
        role,
        email,
        status: "pending",
      });

      console.log("Registration data uploaded to Firebase");

      // Simulate API call
 

      toast("Registration successful", {
        description: "Your account has been created successfully",
      });

      // Redirect to dashboard or home page
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Error registering:", error);
      toast("Registration failed", {
        description: "Failed to register your account. Please try again.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>Register using your MetaMask wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter your fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={setRole}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder="Select your role"
                  defaultValue={role}
                />
              </SelectTrigger>
              <SelectContent className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <SelectItem value="3">Hiệu trưởng</SelectItem>
                <SelectItem value="2">Nhân viên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Your Address</Label>
            {currentAccount ? (
              <div className="flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {`${currentAccount.substring(
                    0,
                    6
                  )}...${currentAccount.substring(currentAccount.length - 4)}`}
                </span>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <span className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                    >
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
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={registerUser}
            disabled={isRegistering || !currentAccount}
          >
            {isRegistering ? (
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
                Registering...
              </span>
            ) : (
              "Register Account"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
