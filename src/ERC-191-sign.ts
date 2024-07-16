import { ethers } from 'ethers';

async function manualERC191Sign() {
  console.log('ethers version:', ethers.version);
  console.log('-------------------------------------------------------------');

  // 1. 创建一个随机钱包（在实际应用中，你会使用真实的私钥）
  const wallet = ethers.Wallet.createRandom();
  // 2. 定义要签名的消息
  const message = 'helloWorld';

  // 3. 构造ERC191消息
  // 3.1 计算消息长度
  const messageLength = ethers.toUtf8Bytes(message).length;

  // 3.2 构造前缀
  const prefix = '\x19Ethereum Signed Message:\n' + messageLength;

  // 3.3 将前缀和消息拼接
  const prefixedMessage = prefix + message;

  console.log('前缀化消息:', prefixedMessage);

  // 4. 对拼接后的消息进行Keccak-256哈希
  const messageHash = ethers.keccak256(ethers.toUtf8Bytes(prefixedMessage));

  console.log('消息哈希:', messageHash);

  // 5. 使用私钥对哈希进行签名
  const signature = await wallet.signMessage(message);

  console.log('ERC191签名:', signature);

  // 6. 验证签名
  const recoveredAddress = ethers.verifyMessage(message, signature);

  console.log('签名地址:', wallet.address);
  console.log('恢复的地址:', recoveredAddress);
  console.log('签名验证:', recoveredAddress === wallet.address);

  // 7. 手动签名
  const msgHash = ethers.hashMessage(message);
  const signingKey = new ethers.SigningKey(wallet.privateKey);
  const signatureObject = signingKey.sign(msgHash);
  const manualSignature = ethers.Signature.from(signatureObject).serialized;

  console.log('手动生成的签名:', manualSignature);
  console.log('签名匹配:', manualSignature === signature);

  // 创建一个 Signature 对象
  const sig = ethers.Signature.from(signature);

  console.log('r:', sig.r);
  console.log('s:', sig.s);
  console.log('v:', sig.v);

  // 如果需要十六进制字符串形式，可以这样转换：
  console.log('r (hex):', ethers.hexlify(sig.r));
  console.log('s (hex):', ethers.hexlify(sig.s));
  console.log('v (hex):', `0x${sig.v.toString(16)}`); // 直接转换为十六进制字符串
}

export default manualERC191Sign;
