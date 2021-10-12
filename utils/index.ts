import AggregatorV3InterfaceABI from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";
import Erc20ABI from "../abi/erc20.json";
import BigNumber from "bignumber.js";
import { ethers } from "hardhat";
import moment from "moment";
import config from "../config";

/**
 * Get the ticket price, based on current network, as $Cake.
 * Used by 'start-lottery' Hardhat script, only.
 */
export const getTicketPrice = async (
  networkName: "testnet" | "mainnet",
  usd: number,
  precision: number
): Promise<string> => {
  const tokenContract = await ethers.getContractAt(Erc20ABI, config.Chainlink.token[networkName])
  const baseTokenContract = await ethers.getContractAt(Erc20ABI, config.Chainlink.baseToken[networkName])

  const tokenBalance = await tokenContract.balanceOf(config.Chainlink.lpToken[networkName])
  const baseTokenBalance = await baseTokenContract.balanceOf(config.Chainlink.lpToken[networkName])

  // // Bind the smart contract address to the Chainlink AggregatorV3Interface ABI, for the given network.
  // const contract = await ethers.getContractAt(AggregatorV3InterfaceABI, config.Chainlink.Oracle[networkName]);

  // // Get the answer from the latest round data.
  // const [, answer] = await contract.latestRoundData();

  // // Format the answer to a fixed point number, as per Oracle's decimals.
  // // Note: We output answer BN.js to string to avoid playing with multiple types/implementations.
  const price: BigNumber = new BigNumber(baseTokenBalance._hex).div(new BigNumber(tokenBalance._hex));

  // Compute the ticket price (denominated in $Cake), to the required USD eq. value.
  const ticketPrice: BigNumber = new BigNumber(usd).div(price);

  // Return the ticket price, up to `n` decimals.
  return ticketPrice.toFixed(precision);
};

/**
 * Get the next lottery 'endTime', based on current date, as UTC.
 * Used by 'start-lottery' Hardhat script, only.
 */
export const getEndTime = (): number => {
  // Get current date, as UTC.
  const now = moment().utc();

  // Get meridiem (AM/PM), based on current UTC Date.
  const meridiem = now.format("A");
  if (meridiem === "AM") {
   // We are in the afternoon (post-meridiem), next lottery is at 12:00 AM (midnight).
    return moment(`${now.format("MM DD YYYY")} 00:00:00 +0000`, "MM DD YYYY HH:mm:ss Z", true)
      .add(24, "hours")
      .startOf("hour")
      .utc()
      .unix();
  } else if (meridiem === "PM") {
    // We are in the afternoon (post-meridiem), next lottery is at 12:00 AM (midnight).
    return moment(`${now.format("MM DD YYYY")} 00:00:00 +0000`, "MM DD YYYY HH:mm:ss Z", true)
      .add(24, "hours")
      .startOf("hour")
      .utc()
      .unix();
  }

  throw new Error("Could not determine next Lottery end time.");
};
