import { useEffect } from 'react';
import contract from '@/utils/DocumentContract.json';
import { connectWallet } from '@/utils/blockchain';

const contractAddress = "0xaED819499F4594dd56dd79abA07d0Dc51002a38F";
const abi = contract.abi;

function BlockChain() {

  const checkWalletIsConnected = () => { }

  const connectWalletHandler = () => { }

  const mintNftHandler = () => { }

  const connectWalletButton = () => {
    return (
      <button onClick={() => {
        connectWallet(window?.ethereum)
      }} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
        Mint NFT
      </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='main-app'>
      <h1>Scrappy Squirrels Tutorial</h1>
      <div>
        {connectWalletButton()}
      </div>
    </div>
  )
}

export default BlockChain;