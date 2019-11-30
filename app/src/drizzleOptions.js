import HighLow from "./contracts/HighLow.json";
import Helper from "./contracts/Helper.json";

const options = {
  web3: {
    block: false,
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:8545",
    },
  },
  contracts: [HighLow, Helper],
  events: {
  },
  polls: {
    accounts: 1500,
  },
};

export default options;
