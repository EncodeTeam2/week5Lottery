import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BigNumber, Contract, ethers } from 'ethers';

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
  userBalance: string | undefined;
  userTokenBalance: string | undefined;
  tokenContractAddress: string | undefined;
  tokenSupply: string | undefined;
  tokenContract: Contract | undefined;
  chainId: number | undefined;
  connectedAccount: any;
  walletAddress: string | undefined;

  // Creates the Web3 Provider to send / sign transactions interacting with the blockchain
  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  }

  getWalletInfo() {
    this.walletSigner!.getBalance()
      .then((balance) => {
        const balanceStr = ethers.utils.formatEther(balance);
        this.userBalance = balanceStr;
      })
      .catch((error: any) => {
        console.log(error);
      });

    // this.tokenContract!['balanceOf'](this.walletSigner?._address).then((balance: BigNumber) => {
    //   const tokenBalanceStr = ethers.utils.formatEther(balance)
    //   this.userTokenBalance = tokenBalanceStr
    // }).catch((error: any) => {
    //   console.log(error);
    // });
  }

  async connectWallet(): Promise<void> {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access to at least 1 account
        await window.ethereum
          .request({ method: 'eth_requestAccounts' })
          .then((address: any) => {
            this.walletAddress = address[0];
            this.walletSigner = this.provider!.getSigner(this.walletAddress);
            // this.tokenContract = new Contract(this.tokenContractAddress!, tokenJson.abi, this.walletSigner)
            //this.userWallet = accounts[0] // Account address that you had imported
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
      })

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
      // this.tokenContract = new Contract(this.tokenContractAddress!, tokenJson.abi, this.walletSigner)
      // alert(`You're connected to: ${accounts[0]}`);
      this.getWalletInfo();
    } else {
      this.connectWallet();
    }
  }

  // requestTokens(value: string) {
  //   const body = { address: this.walletSigner?._address, amount: Number(value) }
  //   this.http.post<any>(REQUEST_TOKENS_URL, body).subscribe((txReceipt) => {
  //     console.log(txReceipt)
  //   })
  // }
}
