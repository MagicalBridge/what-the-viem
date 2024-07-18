import {
  getBlockNumber,
  readNFTTotalSupply,
  readNFTOwner,
  readNFTMetadata
} from './utils/index';

/**
 * main function
 */
async function main() {
  const blockNumber = await getBlockNumber(); // 获取区块高度
  console.log('blockNumber:', blockNumber);

  const totalSupply = await readNFTTotalSupply();
  console.log('totalSupply:', totalSupply);

  const owner = await readNFTOwner();
  console.log('owner:', owner);

  const metadata = await readNFTMetadata();
  console.log('metadata:', metadata);
}

main();
