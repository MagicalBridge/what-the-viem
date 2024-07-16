import { createPublicClient, http, parseAbi } from 'viem';
import { mainnet } from 'viem/chains';
import manualERC191Sign from './ERC-191-sign';

const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

// 解析ipfs数据json内容
// async function getIPFSJson(ipfsUri: string): Promise<any> {
//   // 步骤 1: 将 IPFS URI 转换为 HTTP URL
//   const ipfsGateway = 'https://ipfs.io/ipfs/';
//   const cid = ipfsUri.replace('ipfs://', '');
//   const url = `${ipfsGateway}${cid}`;

//   try {
//     // 步骤 2: 使用 fetch API 获取数据
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     // 步骤 3: 解析 JSON 数据
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching IPFS data:', error);
//     throw error;
//   }
// }

// 获取主网的区块高度
async function getBlockNumber() {
  const blockNumber = await client.getBlockNumber();
  console.log('blockNumber: ' + blockNumber);
}

// 读取NFT合约最大的供应量
async function readNFTTotalSupply() {
  const totalSupply = await client.readContract({
    address: '0x0483B0DFc6c78062B9E999A82ffb795925381415',
    abi: [
      {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    functionName: 'totalSupply'
  });

  console.log('totalSupply', totalSupply);
}

// 通过tokenId查询NFT的所有者
async function readNFTOwner() {
  // 通过传递tokenId查询所属账户
  const owner = await client.readContract({
    address: '0x0483B0DFc6c78062B9E999A82ffb795925381415',
    abi: [
      {
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'ownerOf',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    functionName: 'ownerOf',
    args: [BigInt(2)] // 注意：这里需要传入 tokenId bigInt 类型
  });

  console.log('owner', owner); // 0xd05601FDF4A950Bc791B2f3bF3D36883d56EDE1F
}

async function readNFTMetadata() {
  // 读取指定NFT的元数据
  const tokenURI = await client.readContract({
    address: '0x0483B0DFc6c78062B9E999A82ffb795925381415',
    abi: [
      {
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'tokenURI',
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    functionName: 'tokenURI',
    args: [BigInt(2)] // 注意：这里需要传入 tokenId bigInt 类型
  });

  console.log('tokenUri', tokenURI); // ipfs://QmY9wa5FssaBBhLyyC2r649rwfS7CcvH7NG5AJWepeDkGj/2.json
}

async function main() {
  // await getBlockNumber(); // 获取区块高度
  // await readNFTTotalSupply(); // 读取NFT的最大供应量
  // await readNFTOwner(); // 通过tokenId查询NFT的所有者
  // await readNFTMetadata(); // 读取指定NFT的元数据
  // console.log('tokenUri', tokenURI); // ipfs://QmY9wa5FssaBBhLyyC2r649rwfS7CcvH7NG5AJWepeDkGj/2.json
  // 解析出来具体的数据（需要打开ipfs网关）
  // try {
  //   const jsonData = await getIPFSJson(tokenURI);
  //   console.log('Parsed JSON data:', jsonData);
  // } catch (error) {
  //   console.error('Failed to get IPFS JSON:', error);
  // }
  await manualERC191Sign();
}

main();
