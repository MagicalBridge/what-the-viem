import { publicClient } from './client/client';

// 合约地址和 ABI（包含事件定义）
const contractAddress = '0x5c33DE2919cdD86ADF525eEd934ba1C54bfd767c'; // 替换为您的合约地址

export async function getSignVerifyEvents() {
  const latestBlock = await publicClient.getBlockNumber();

  console.log('latestBlock', latestBlock);

  const batchSize = BigInt(100); // 每次查询的区块数
  let fromBlock = latestBlock - BigInt(99); // 从最近100个区块开始查询
  const allEvents = [];

  while (fromBlock <= latestBlock) {
    const toBlock = BigInt(
      Math.min(Number(fromBlock) + Number(batchSize) - 1, Number(latestBlock))
    );

    const events = await publicClient.getLogs({
      address: contractAddress,
      event: {
        type: 'event',
        name: 'SignVerify',
        inputs: [
          { indexed: true, name: 'signer', type: 'address' },
          { indexed: true, name: 'owner', type: 'address' },
          { indexed: true, name: 'buyer', type: 'address' }
        ]
      },
      fromBlock,
      toBlock
    });

    allEvents.push(...events);
    fromBlock = toBlock + BigInt(1);

    if (fromBlock > latestBlock) break;
  }

  console.log('SignVerify Events:');

  allEvents.forEach((event, index) => {
    console.log(`Event ${index + 1}:`);
    console.log(`  Signer: ${event.args.signer}`);
    console.log(`  Owner: ${event.args.owner}`);
    console.log(`  Buyer: ${event.args.buyer}`);
    console.log(`  Block Number: ${event.blockNumber}`);
    console.log(`  Transaction Hash: ${event.transactionHash}`);
    console.log('---');
  });
}

// getSignVerifyEvents().catch(console.error);
