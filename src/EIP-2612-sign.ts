import { ethers } from 'ethers';

// 假设你已经有了 TOKEN_ABI 和 BANK_ABI
const TOKEN_ABI = [
  // ERC20 标准函数
  'function name() public view returns (string)',
  'function symbol() public view returns (string)',
  'function decimals() public view returns (uint8)',
  'function totalSupply() public view returns (uint256)',
  'function balanceOf(address account) public view returns (uint256)',
  'function transfer(address recipient, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)',

  // EIP2612 特定函数
  'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public',
  'function nonces(address owner) public view returns (uint256)',
  'function DOMAIN_SEPARATOR() public view returns (bytes32)'
];

const BANK_ABI = [
  'function deposit(address token, uint256 amount) public',
  'function depositWithPermit(address token, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public',
  'function withdraw(address token, uint256 amount) public',
  'function balanceOf(address token, address account) public view returns (uint256)'
];

async function depositWithPermit(
  tokenAddress: string,
  bankAddress: string,
  amount: bigint,
  signer: ethers.JsonRpcSigner
) {
  try {
    // 创建 token 合约实例
    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

    // 创建 bank 合约实例
    const bankContract = new ethers.Contract(bankAddress, BANK_ABI, signer);

    // 获取当前用户地址
    const userAddress = await signer.getAddress();

    // 获取 nonce
    const nonce = await tokenContract.nonces(userAddress);

    // 设置 deadline（例如，1小时后）
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;

    // 获取链 ID
    const chainId = await signer.provider
      .getNetwork()
      .then((network: ethers.Network) => network.chainId);

    // 准备签名数据
    const domain = {
      name: await tokenContract.name(),
      version: '1',
      chainId: chainId,
      verifyingContract: tokenAddress
    };

    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    };

    const value = {
      owner: userAddress,
      spender: bankAddress,
      value: amount,
      nonce: nonce,
      deadline: deadline
    };

    // 请求用户签名
    const signature = await signer.signTypedData(domain, types, value);

    // 分割签名
    const sig = ethers.Signature.from(signature);

    // 调用 bank 合约的 depositWithPermit 函数
    const tx = await bankContract.depositWithPermit(
      tokenAddress,
      amount,
      deadline,
      sig.v,
      sig.r,
      sig.s
    );

    // 等待交易被确认
    await tx.wait();

    console.log('Deposit successful!');
    return tx.hash;
  } catch (error) {
    console.error('Error in depositWithPermit:', error);
    throw error;
  }
}

export async function main() {
  // 连接到以太坊提供者（例如 MetaMask）
  let provider, signer;

  if (typeof (window as any).ethereum !== 'undefined') {
    // 使用 MetaMask 或类似的浏览器钱包
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider((window as any).ethereum);
    signer = await provider.getSigner();
  } else {
    // 如果没有浏览器钱包，使用 JsonRpcProvider
    provider = new ethers.JsonRpcProvider('');
    signer = await provider.getSigner();
  }

  const tokenAddress = '0x3c510705cdbb9c2d8c6A68A44256fb331D1EDB56'; // 你的 EIP2612 token 地址
  const bankAddress = '0xBc1B2EdE79abCD81571724446389FAb29E3d6ACc'; // 你的 bank 合约地址
  const amount = ethers.parseUnits('10', 18); // 假设 token 有 18 位小数

  try {
    const txHash = await depositWithPermit(
      tokenAddress,
      bankAddress,
      amount,
      signer
    );
    console.log('Transaction hash:', txHash);
  } catch (error) {
    console.error('Deposit failed:', error);
  }
}
