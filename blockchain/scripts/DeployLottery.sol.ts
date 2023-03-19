import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Lottery, Lottery__factory } from "../typechain-types";
dotenv.config();

let contract: Lottery;

const BET_PRICE = 1;
const BET_FEE = 0.2;
const TOKEN_RATIO = 1;

async function main() {
  const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY);
  const privateKey = process.env.GROUP_PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0) throw new Error("Missing environment private key");
  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();
  console.log(`The account ${signer.address} has a balance of ${balance} wei`);

  console.log("Deploying Lottery contract");
  const contractFactory = new Lottery__factory(signer);
  contract = await contractFactory.deploy(
    "LotteryToken",
    "LT0",
    TOKEN_RATIO,
    ethers.utils.parseEther(BET_PRICE.toFixed(18)),
    ethers.utils.parseEther(BET_FEE.toFixed(18))
  );
  const contractTx = await contract.deployTransaction.wait();
  console.log(
    `The Lottery contract was deployed at address ${contract.address} in the block ${contractTx.blockNumber}`
  );
  const tokenAddress = await contract.paymentToken();
  console.log(`The Lottery Token contract was deployed at address ${tokenAddress} `);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
