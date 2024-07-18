import { getBlockNumber } from './utils/index';

/**
 * main function
 */
async function main() {
  const blockNumber = await getBlockNumber(); // 获取区块高度
  console.log('blockNumber:', blockNumber);
}

main();
