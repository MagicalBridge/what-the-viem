// 安装依赖：npm install ethers
import { ethers } from "ethers";

// Arbitrum One RPC，可以用 Alchemy/Infura 或公开节点
const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

// USDC Proxy 合约地址（Arbitrum）
const proxyAddress = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";

// EIP-1967 定义的 implementation 槽位置
// bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
// const IMPLEMENTATION_SLOT =
//   "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const proxyAbi = [
  "function admin() public view returns (address)",
  "function implementation() public view returns (address)"
];

async function getImplementation() {
  // 读取 Proxy 存储槽
  // const storage = await provider.getStorage(proxyAddress, IMPLEMENTATION_SLOT);
  // 截取最后 20 字节（合约地址）
  // const implAddress = ethers.getAddress("0x" + storage.slice(26));
  // console.log("USDC Implementation Address on Arbitrum:", implAddress);
  const proxy = new ethers.Contract(proxyAddress, proxyAbi, provider);
  const implAddress = await proxy.implementation();
  console.log("USDC Implementation Address on Arbitrum:", implAddress);

  const admin = await proxy.admin();
  console.log("USDC Admin Address on Arbitrum:", admin);
  // 0x86E721b43d4ECFa71119Dd38c0f938A75Fdb57B3
}

export default getImplementation;
