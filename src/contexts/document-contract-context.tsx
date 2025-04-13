import { createContext, useContext, useState, type ReactNode } from "react";

import { ethers, isAddress, parseEther, toBeHex } from "ethers";
import documentContract from "@/utils/DocumentContract.json";

const contractAddress = "0x49bbe2226bf8120091cf20518f2f21178d744664"; // Replace with your contract address
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
  connectWallet: () => Promise<any>;
  getEthereumContract: () => Promise<ethers.Contract>;
  checkIfWalletIsConnected: () => Promise<void>;
  sendTransaction: (to: string) => Promise<void>;
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
  sendTransaction: async () => {
    throw new Error("sendTransaction function not implemented.");
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

      return {
        message: "Login successfully",
        status: 200
      }
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

  const sendTransaction = async (to: string) => {
    try {
      console.log("Ethereum object:", ethereum, to, currentAccount);
      if (!ethereum) return alert("Please install MetaMask!");
      if (!isAddress(to)) return alert("Địa chỉ người nhận không hợp lệ!");
      if (!isAddress(currentAccount))
        return alert("Tài khoản hiện tại không hợp lệ!");

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: to,
            gas: "0x5208", // 21000 Gwei
            value: toBeHex(parseEther("100")),
          },
        ],
      });

      console.log("Gửi thành công!");
    } catch {
      console.error("Error sending transaction:");
      throw new Error("No Ethereum object found. Please install MetaMask.");
    }
  };
  const approveUserRegister = async () => {
    const contract = await getEthereumContract();
    const tx = await contract.approveRegister();
  };
  // gas: 0x5208 = 21000 Gwei

  return (
    <DocumentContractContext.Provider
      value={{
        currentAccount,
        connectWallet,
        checkIfWalletIsConnected,
        getEthereumContract,
        sendTransaction,
      }}
    >
      {children}
    </DocumentContractContext.Provider>
  );
};
