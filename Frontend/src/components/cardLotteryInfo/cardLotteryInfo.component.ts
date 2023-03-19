import { Component } from '@angular/core';
import { BigNumber, Contract, ethers } from 'ethers';
import lotteryJson from '../../assets/Lottery.json';

const LOTTERY_CONTRACT_ADDRESS = '0x6354dA7FbCc203D49cEC938727A9A97a4c80bDE7';

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
  betsOpen: boolean | undefined;
  betsClosingTime: number | undefined;

  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  }
  async ngOnInit() {
    // Connects to Lottery Contract
    this.lotteryAddress = LOTTERY_CONTRACT_ADDRESS;
    this.lotteryContract = new Contract(
      this.lotteryAddress,
      lotteryJson.abi,
      this.walletSigner ?? this.provider
    );

    // Purchase Ratio Method
    this.lotteryContract['purchaseRatio']().then((purchaseRatioNum: number) => {
      this.purchaseRatio = purchaseRatioNum;
    });

    // Bet Price Method
    this.lotteryContract['betPrice']().then((betPriceNum: number) => {
      const betPriceStr = ethers.utils.formatEther(betPriceNum);
      this.betPrice = parseFloat(betPriceStr);
    });

    // Bet Fee Method
    this.lotteryContract['betFee']().then((betFeeNum: number) => {
      const betFeeStr = ethers.utils.formatEther(betFeeNum);
      this.betFee = parseFloat(betFeeStr);
    });

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
}
