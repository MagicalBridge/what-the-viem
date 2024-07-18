import { parseAbi } from 'viem';
import { publicClient } from '../client';

/**
 * Get the current block number.
 * @return {Promise<number>} The current block number.
 */
export async function getBlockNumber() {
  const blockNumber = await publicClient.getBlockNumber();
  return blockNumber;
}

/**
 * Read the total supply of NFTs.
 * @return {Promise<void>}
 */
export async function readNFTTotalSupply() {
  const abi = parseAbi(['function totalSupply() view returns (uint256)']);
  const result = await publicClient.readContract({
    address: '0x0483B0DFc6c78062B9E999A82ffb795925381415',
    abi,
    functionName: 'totalSupply'
  });

  return result;
}

/**
 * Read the owner of a specific NFT.
 * @return {Promise<void>}
 */
export async function readNFTOwner() {
  const abi = parseAbi([
    'function ownerOf(uint256 tokenId) view returns (address)'
  ]);

  const result = await publicClient.readContract({
    address: '0x0483B0DFc6c78062B9E999A82ffb795925381415',
    abi,
    functionName: 'ownerOf',
    args: [BigInt(2)]
  });

  return result;
}

/**
 * Read the metadata of a specific NFT.
 * @return {Promise<void>}
 */
export async function readNFTMetadata() {
  const abi = parseAbi([
    'function tokenURI(uint256 tokenId) view returns (string)'
  ]);

  const result = await publicClient.readContract({
    address: '0x0483B0DFc6c78062B9E999A82ffb795925381415',
    abi,
    functionName: 'tokenURI',
    args: [BigInt(2)]
  });

  return result;
}

export async function getIPFSJson(ipfsUri: string): Promise<any> {
  // 步骤 1: 将 IPFS URI 转换为 HTTP URL
  const ipfsGateway = 'https://ipfs.io/ipfs/';
  const cid = ipfsUri.replace('ipfs://', '');
  const url = `${ipfsGateway}${cid}`;

  try {
    // 步骤 2: 使用 fetch API 获取数据
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 步骤 3: 解析 JSON 数据
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching IPFS data:', error);
    throw error;
  }
}
