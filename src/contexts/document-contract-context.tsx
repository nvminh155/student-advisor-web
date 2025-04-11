import { createContext, useContext, useState, type ReactNode } from "react";

import { ethers } from "ethers";
import documentContract from "@/utils/DocumentContract.json";

const contractAddress = "0x7463db48d50ff0d286c0f48b6e0fa9c5439770d0"; // Replace with your contract address
const abi = documentContract.abi;

declare global {
  interface Window {
    ethereum?: any; // Define the type for ethereum if needed
  }
}

const { ethereum } = window;

console.log(ethereum, "Ethereum object");
interface DocumentContractContextType {
  currentAccount: string | null;
  connectWallet: () => Promise<void>;
  getEthereumContract: () => Promise<ethers.Contract>;
  checkIfWalletIsConnected: () => Promise<void>;
}

const DocumentContractContext = createContext<DocumentContractContextType>({
  currentAccount: null,
  connectWallet: async () => {
    throw new Error("connectWallet function not implemented.");
  },
  getEthereumContract: () => {
    throw new Error("getEthereumContract function not implemented.");
  },
  checkIfWalletIsConnected: async () => {
    throw new Error("checkIfWalletIsConnected function not implemented.");
  },
});

export const useDocumentContractContext = () => {
  const context = useContext(DocumentContractContext);
  if (!context) {
    throw new Error(
      "useDocumentContractContext must be used within an DocumentContractProvider"
    );
  }
  return context;
};

export const DocumentContractProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  // const [loading, setLoading] = useState(true);

  const checkIfWalletIsConnected = async () => {
    if (!ethereum) return alert("Please install MetaMask!");

    const accounts = await ethereum.request({ method: "eth_accounts" });

    console.log("Accounts:", accounts);
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected account:", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw new Error("No Ethereum object found. Please install MetaMask.");
    }
  };

  const getEthereumContract = async () => {
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    console.log({
      provider,
      signer,
      contract,
    });

    return contract;
  };  


  const approveUserRegister = async () => {
    const contract = await getEthereumContract();
    const tx = await contract.approveRegister();
  }
  // gas: 0x5208 = 21000 Gwei

  return (
    <DocumentContractContext.Provider
      value={{
        currentAccount,
        connectWallet,
        checkIfWalletIsConnected,
        getEthereumContract,
      }}
    >
      {children}
    </DocumentContractContext.Provider>
  );
};
