import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Lottery, Lottery__factory } from "../typechain-types";
dotenv.config();

let contract: Lottery;

const LOTTO_CONTRACT = "0x478c4CF98Ac9932F4F09c1582133696d8Aaa4D90";

async function main() {
  const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY);
  const privateKey = process.env.GROUP_PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0) throw new Error("Missing environment private key");
  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();
  console.log(`The account ${signer.address} has a balance of ${balance} wei`);

  console.log("Connecting to Lottery contract...");
  const contractFactory = new Lottery__factory(signer);
  contract = await contractFactory.attach(LOTTO_CONTRACT);

  console.log(`Connected to Lottery Contract ${contract.address}`);

  console.log(`Payment Token: ${await contract.paymentToken()}`);
  console.log(`Purchase Ratio: ${await contract.purchaseRatio()}`);
  console.log(`Bet price: ${await contract.betPrice()}`);
  console.log(`Bet fee: ${await contract.betFee()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
