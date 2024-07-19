import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

/**
 * This is a public client that can be used to interact with the Ethereum mainnet.
 * It uses an Alchemy API key for convenience.
 */
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(
    'https://eth-mainnet.g.alchemy.com/v2/wetra8HLzo_m-UswS8UJCnwdzS40X2wN'
  )
  // transport: http('https://1rpc.io/sepolia')
});
