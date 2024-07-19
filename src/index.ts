// import {
//   getBlockNumber,
//   readNFTTotalSupply,
//   readNFTOwner,
//   readNFTMetadata
// } from './utils/index';
// import { getSignVerifyEvents } from './queryEvent';
import { queryUSDCtransferLog } from './queryUSDCtransferLog';
/**
 * main function
 */
async function main() {
  // const blockNumber = await getBlockNumber(); // 获取区块高度
  // console.log('blockNumber:', blockNumber);
  // const totalSupply = await readNFTTotalSupply();
  // console.log('totalSupply:', totalSupply);
  // const owner = await readNFTOwner();
  // console.log('owner:', owner);
  // const metadata = await readNFTMetadata();
  // console.log('metadata:', metadata);
  // await getSignVerifyEvents();
  await queryUSDCtransferLog();
}

main();
