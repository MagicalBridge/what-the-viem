import { ethers } from 'ethers';

// 假设你已经有了 TOKEN_ABI 和 BANK_ABI
const TOKEN_ABI = [
  /* Your token ABI here */
];
const BANK_ABI = [
  /* Your bank ABI here */
];

async function depositWithPermit(tokenAddress, bankAddress, amount, signer) {
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
      .then(network => network.chainId);

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

// 使用示例
async function main() {
  // 连接到以太坊提供者（例如 MetaMask）
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();

  const tokenAddress = '0x...'; // 你的 EIP2612 token 地址
  const bankAddress = '0x...'; // 你的 bank 合约地址
  const amount = ethers.parseUnits('100', 18); // 假设 token 有 18 位小数

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

// 调用主函数
main();
