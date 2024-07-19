import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV;
// 根据不同环境使用不同的网络节点
console.log(`current environment: ${env}`);

/**
 * This is a public client that can be used to interact with the Ethereum mainnet.
 * It uses an Alchemy API key for convenience.
 */
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(
    env === 'test'
      ? process.env.EVM_MAINNET_SEPOLIA
      : process.env.EVM_MAINNET_NETWORK
  )
});
