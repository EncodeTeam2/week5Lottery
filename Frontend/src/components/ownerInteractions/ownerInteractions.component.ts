import { Component } from '@angular/core';
import { BigNumber, Contract, ethers } from 'ethers';
import lotteryJson from '../../assets/Lottery.json';

const LOTTERY_CONTRACT_ADDRESS = '0x6354dA7FbCc203D49cEC938727A9A97a4c80bDE7';

@Component({
  selector: 'owner-interactions',
  templateUrl: './ownerInteractions.component.html',
  providers: [],
})
export class OwnerInteractions {
  walletSigner: ethers.providers.JsonRpcSigner | undefined;
  provider: ethers.providers.Web3Provider | undefined;
  lotteryContract: Contract | undefined;
  lotteryAddress: string | undefined;
  betsOpen: boolean | undefined;
  betsClosingTime: number | undefined;
  contractOwner: string | undefined;
  walletAddress: string | undefined;
  isOwner: boolean | undefined;

  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  }

  async ngOnInit() {
    this.lotteryAddress = LOTTERY_CONTRACT_ADDRESS;
    this.lotteryContract = new Contract(
      this.lotteryAddress,
      lotteryJson.abi,
      this.walletSigner ?? this.provider
    );

    this.connectWallet();
    this.checkOwner();
    // Are bets open?
    this.lotteryContract['betsOpen']().then((isOpen: boolean) => {
      this.betsOpen = isOpen;
    });

    // Bets closing time
    this.lotteryContract['betsClosingTime']().then((closingTime: number) => {
      const betsClosingTimeStr = ethers.utils.formatEther(closingTime);
      this.betsClosingTime = parseFloat(betsClosingTimeStr);
    });
  }

  async connectWallet(): Promise<void> {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum
          .request({ method: 'eth_requestAccounts' })
          .then((address: any) => {
            this.walletAddress = address[0];
            this.walletSigner = this.provider!.getSigner(this.walletAddress);
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

  async isConnected() {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) {
      this.walletAddress = accounts[0];
      this.walletSigner = this.provider!.getSigner(accounts[0]);
    } else {
      this.connectWallet();
    }
  }

  async openBets(value: string): Promise<void> {
    if (this.lotteryContract) {
      const currentBlock = this.provider?.getBlock('latest');
      if (currentBlock) {
        this.lotteryContract['openBets']().then(
          (await currentBlock).timestamp + Number(value)
        );
      }
    }
  }

  checkOwner() {
    if (this.lotteryContract) {
      this.lotteryContract['owner']().then((ownerAddres: string) => {
        this.contractOwner = ownerAddres;
      });
      if (this.walletAddress === this.contractOwner) {
        this.isOwner = true;
      } else {
        this.isOwner = false;
      }
    }
  }
}
