import { Component } from '@angular/core';
import { BigNumber, Contract, ethers } from 'ethers';
import lotteryJson from '../../assets/Lottery.json';

// hardcoded temporarily , discuss with team different solution
const LOTTERY_CONTRACT_ADDRESS = '0x478c4CF98Ac9932F4F09c1582133696d8Aaa4D90';

@Component({
  selector: 'card-lottery-info',
  templateUrl: './cardLotteryInfo.component.html',
  providers: [],
})
export class CardLotteryInfoComponent {
  walletSigner: ethers.providers.JsonRpcSigner | undefined;
  provider: ethers.providers.Web3Provider | undefined;
  lotteryContract: Contract | undefined;
  lotteryAddress: string | undefined;
  purchaseRatio: number | undefined;
  betPrice: number | undefined;
  betFee: number | undefined;

  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  }

  async getContractInfo() {
    this.lotteryAddress = LOTTERY_CONTRACT_ADDRESS;
    this.lotteryContract = new Contract(
      this.lotteryAddress,
      lotteryJson.abi,
      this.walletSigner ?? this.provider
    );
    this.lotteryContract['purchaseRatio']().then((purchaseRatioNum: number) => {
      this.purchaseRatio = purchaseRatioNum;
    });
    this.lotteryContract['betPrice']().then((betPriceNum: number) => {
      const betPriceStr = ethers.utils.formatEther(betPriceNum);
      this.betPrice = parseFloat(betPriceStr);
    });
    this.lotteryContract['betFee']().then((betFeeNum: number) => {
      const betFeeStr = ethers.utils.formatEther(betFeeNum);
      this.betFee = parseFloat(betFeeStr);
    });
  }
}
