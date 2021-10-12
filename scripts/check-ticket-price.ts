import { getTicketPrice } from "../utils";

/**
 * Fetch ticket price.
 */
const main = async () => {
  // Get network data from Hardhat config (see hardhat.config.ts).
  try {
    const ticketPrice = await getTicketPrice('mainnet', 100, 8)
    console.log("Ticket price: ", ticketPrice)
  } catch(e) {
    console.log(e)
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
