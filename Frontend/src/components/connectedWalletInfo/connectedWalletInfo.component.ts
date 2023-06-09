import { Component } from '@angular/core';
import { BigNumber, Contract, ethers, Signer } from 'ethers';
import LotteryTokenJson from '../../assets/contracts/LotteryToken.json';
import Lottery from '../../assets/contracts/Lottery.json';

const lotteryTokenABI = LotteryTokenJson.abi;
const lotteryABI = Lottery.abi;

declare global {
  interface Window {
    ethereum: any;
  }
}

@Component({
  selector: 'connected-wallet-info',
  templateUrl: './connectedWalletInfo.component.html',
  providers: [],
})
export class ConnectedWalletComponent {
  walletSigner: ethers.providers.JsonRpcSigner | undefined;
  provider: ethers.providers.Web3Provider | undefined;
  userEthBalance: string | undefined;
  lotteryTokenContract: Contract | undefined;
  lotteryTokenBalance: string | undefined;
  lotteryTokenContractAddress: string;
  lotteryContract: Contract | undefined;
  lotteryContractAddress: string;
  lotteryTokenSupply: string | undefined;
  walletAddress: string | undefined;
  lotteryPrizeWinnings: BigNumber | string;

  // Creates the Web3 Provider to send / sign transactions interacting with the blockchain
  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    this.lotteryContractAddress = '0x6354dA7FbCc203D49cEC938727A9A97a4c80bDE7';
    this.lotteryTokenContractAddress = '0x730369d165aBb8F72f01933Cfa858b5f269590cB';
    this.lotteryPrizeWinnings = '0';
    this.lotteryTokenBalance = '0';
  }

  // Get the ETH balance of the connected wallet
  async getWalletInfo() {
    await this.walletSigner!.getBalance()
      .then((balance) => {
        const balanceStr = ethers.utils.formatEther(balance);
        this.userEthBalance = balanceStr;
      })
      .then(async () => {
        await this.getLotteryTokenBalance(this.walletSigner!);
        await this.getLotteryPrizeWinnings();
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  // Get the token balance of the ERC20 token for the Lottery with the connected wallet
  async getLotteryTokenBalance(walletSigner: Signer) {
    this.lotteryTokenContract = new Contract(this.lotteryTokenContractAddress, lotteryTokenABI, walletSigner);

    await this.lotteryTokenContract['balanceOf'](this.walletSigner?._address)
      .then((balance: BigNumber) => {
        console.log('Now getting lottery prize winnings');
        const tokenBalanceStr = ethers.utils.formatEther(balance);
        this.lotteryTokenBalance = tokenBalanceStr;
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  // Request account access to at least 1 account
  async connectWallet(): Promise<void> {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum
          .request({ method: 'eth_requestAccounts' })
          .then((address: any) => {
            this.walletAddress = address[0];
            this.walletSigner = this.provider!.getSigner(this.walletAddress);
            this.getWalletInfo();
          })
          .catch((error: any) => {
            if (error.code === 4001) {
              console.log('User rejected');
            }
            return console.log('we found our error', error);
          });
      } catch {}
    }
  }

  // Allow user to change the wallet connected in the app and update the UI
  async changeWallet() {
    await window.ethereum
      .request({
        method: 'eth_requestAccounts',
        params: [
          {
            eth_accounts: {},
          },
        ],
      })
      .then((oldAddress: string) => {
        console.log('the old address', oldAddress[0]);
      });

    // Take the new wallet and display this information to the user immediately
    await window.ethereum
      .request({
        method: 'wallet_requestPermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      })
      .then(async () => {
        await this.connectWallet();
        console.log('the new address is', this.walletAddress);
      });
  }

  async isConnected() {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) {
      this.walletAddress = accounts[0];
      this.walletSigner = this.provider!.getSigner(accounts[0]);
      this.getWalletInfo();
    } else {
      this.connectWallet();
    }
  }

  async requestTokens(value: string) {
    this.lotteryContract = new Contract(this.lotteryContractAddress, lotteryABI, this.walletSigner);
    await this.lotteryContract
      .connect(this.walletSigner!)
      ['purchaseTokens']({ value: ethers.utils.parseEther(value) })
      .then(async () => {
        console.log('Tokens purchased', value);
        console.log('Tokens purchased', ethers.utils.parseEther(value));
        await this.getWalletInfo();
      })
      .catch((error: any) => {
        if (error.code === 4001) {
          console.log('User rejected transaction');
        } else {
          return console.log(error);
        }
      });
  }

  async getLotteryPrizeWinnings() {
    this.lotteryContract = new Contract(this.lotteryContractAddress, lotteryABI, this.walletSigner);
    await this.lotteryContract['prize'](this.walletAddress)
      .then((result: BigNumber) => {
        this.lotteryPrizeWinnings = ethers.utils.formatEther(result);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  async placeBet() {
    this.lotteryContract = new Contract(this.lotteryContractAddress, lotteryABI, this.walletSigner);
    await this.lotteryContract['bet']()
      .then(async (result: any) => {
        console.log('we place a bet');
      })
      .catch((err: any) => {
        return console.log('Bets are closed');
      });
  }

  async openBets(duration: string) {
    this.lotteryContract = new Contract(this.lotteryContractAddress, lotteryABI, this.walletSigner);
    const currentBlock = await ethers.providers.getDefaultProvider().getBlock('latest');
    await this.lotteryContract['openBets'](currentBlock.timestamp + Number(duration)).then((result: any) => {
      console.log('Time of block closing', currentBlock.timestamp + Number(duration));
      console.log('Bets are open');
      console.log('result', result);
    }).catch((err: any) => {
      console.log(err);
    });
  }
}
