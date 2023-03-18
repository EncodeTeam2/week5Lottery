import { OwnerInteractions } from './../components/ownerInteractions/ownerInteractions.component';
import { LotteryInteractions } from './../components/lotteryInteractions/lotteryInteractions.component';
import { ConnectedWalletInfo } from './../components/connectedWalletInfo/connectedWalletInfo.component';
import { CardLotteryInfoComponent } from './../components/cardLotteryInfo/cardLotteryInfo.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CardLotteryToken } from 'src/components/cardLotteryToken/cardLotteryToken.component';

@NgModule({
  declarations: [
    AppComponent,
    CardLotteryInfoComponent,
    CardLotteryToken,
    ConnectedWalletInfo,
    LotteryInteractions,
    OwnerInteractions
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
