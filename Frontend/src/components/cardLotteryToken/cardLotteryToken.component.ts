import { Component } from '@angular/core';
import { Contract, ethers } from 'ethers';
import lotteryTokenJson from '../../assets/LotteryToken.json';

const TOKEN_CONTRACT_ADDRESS = '0x730369d165aBb8F72f01933Cfa858b5f269590cB';

@Component({
  selector: 'card-lottery-token',
  templateUrl: './cardLotteryToken.component.html',
  providers: [],
})
export class CardLotteryToken {
  walletSigner: ethers.providers.JsonRpcSigner | undefined;
  provider: ethers.providers.Web3Provider | undefined;
  tokenContract: Contract | undefined;
  tokenAddress: string | undefined;
  tokenBalance: number | undefined;

  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  }

  async ngOnInit() {
    this.tokenAddress = TOKEN_CONTRACT_ADDRESS;
    this.tokenContract = new Contract(
      this.tokenAddress,
      lotteryTokenJson.abi,
      this.walletSigner ?? this.provider
    );
    // Get Token Balance
    this.tokenContract['balanceOf']().then((balanceNumber: number) => {
      const tokenBalanceStr = ethers.utils.formatEther(balanceNumber);
      this.tokenBalance = parseFloat(tokenBalanceStr);
    });
  }
}
