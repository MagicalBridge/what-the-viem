import { parseAbiItem, formatUnits } from 'viem';
import { publicClient } from './client/client';
import { getBlockNumber } from './utils';

// USDC 合约地址
const USDC_CONTRACT_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

// Transfer 事件的 ABI
const TRANSFER_EVENT_ABI = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)'
);

// 封装为一个查询函数
export async function queryUSDCtransferLog() {
  // 获取最新的区块高度
  const latestBlock = await getBlockNumber();

  // 开始区块是最近区块减去100
  const startBlock = BigInt(latestBlock) - BigInt(100);

  console.log('latestBlock', latestBlock);

  // 创建事件过滤器
  const filter = await publicClient.createEventFilter({
    address: USDC_CONTRACT_ADDRESS,
    event: TRANSFER_EVENT_ABI,
    fromBlock: startBlock, // 开始区块
    toBlock: 'latest' // 最近区块
  });

  const logs = await publicClient.getFilterLogs({ filter });

  // 将logs转换为数组，以便遍历
  const logsArray = Array.isArray(logs) ? logs : [logs];

  // 只取数据的前100条
  logsArray.splice(100);

  for (const log of logsArray) {
    const { from, to, value } = log.args || {};
    if (from && to && value) {
      const formattedValue = Number(formatUnits(value, 6)).toFixed(5);
      console.log(
        `从 ${from} 转账给 ${to} ${formattedValue} USDC, 交易ID：${log.transactionHash}`
      );
    } else {
      console.log('日志解析错误：', log);
    }
  }
}
