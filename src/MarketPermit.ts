import { ethers } from 'ethers';
// 假设你已经有了 ABI 和合约地址
const NFT_MARKET_ABI = [
  // Main functions
  'function list(uint256 _tokenId, uint256 _price)',
  'function permitBuyNFT((uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s) permitData, bytes _permit)',

  // View functions
  'function listings(uint256) view returns (address seller, uint256 price)',
  'function nftContract() view returns (address)',
  'function tokenContract() view returns (address)',
  'function tokenContractPermit() view returns (address)',

  // Ownable functions
  'function owner() view returns (address)',
  'function renounceOwnership()',
  'function transferOwnership(address newOwner)',

  // Events
  'event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price)',
  'event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)'
];

const NFT_MARKET_ADDRESS = '0xF5a1Dfe907BA9414E24E078bd7Df7Bf489ce47fF'; // 替换为你的合约地址
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

const TOKEN_ADDRESS = '0x3c510705cdbb9c2d8c6A68A44256fb331D1EDB56'; // 替换为你的 ERC20 代币地址

export default async function testPermitBuyNFT() {
  // 连接到以太坊网络
  // const provider = new ethers.BrowserProvider((window as any).ethereum);
  // const signer = await provider.getSigner();

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

  // 创建合约实例
  const nftMarket = new ethers.Contract(
    NFT_MARKET_ADDRESS,
    NFT_MARKET_ABI,
    signer
  );

  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

  // 设置参数
  const tokenId = 1; // 替换为实际的 tokenId
  const price = ethers.parseEther('10'); // 替换为实际的价格
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期

  try {
    // 获取当前账户
    const address = await signer.getAddress();

    console.log('address', address);

    // 创建 permit 消息
    const domain = {
      name: 'NFTMarketPermit',
      version: '1',
      chainId: (await provider.getNetwork()).chainId,
      verifyingContract: NFT_MARKET_ADDRESS
    };

    const types = {
      PermitBuyNFT: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    };

    const value = {
      tokenId: tokenId,
      price: price,
      deadline: deadline
    };

    // 签名 permit 消息
    const signature = await signer.signTypedData(domain, types, value);
    const { v, r, s } = ethers.Signature.from(signature);

    // 创建 ERC20 permit 数据
    const nonce = await tokenContract.nonces(address);
    const tokenName = await tokenContract.name();

    const tokenDomain = {
      name: tokenName,
      version: '1',
      chainId: (await provider.getNetwork()).chainId,
      verifyingContract: TOKEN_ADDRESS
    };

    const tokenTypes = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    };

    const tokenValue = {
      owner: address,
      spender: NFT_MARKET_ADDRESS,
      value: price,
      nonce: nonce,
      deadline: deadline
    };

    // 签名 ERC20 permit 消息
    const tokenSignature = await signer.signTypedData(
      tokenDomain,
      tokenTypes,
      tokenValue
    );
    const {
      v: tokenV,
      r: tokenR,
      s: tokenS
    } = ethers.Signature.from(tokenSignature);

    // 编码 ERC20 permit 数据
    const tokenPermit = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint8', 'bytes32', 'bytes32'],
      [tokenV, tokenR, tokenS]
    );

    // 调用 permitBuyNFT 函数
    const tx = await nftMarket.permitBuyNFT(
      {
        tokenId: tokenId,
        deadline: deadline,
        v: v,
        r: r,
        s: s
      },
      tokenPermit
    );

    // 等待交易确认
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);
  } catch (error) {
    console.error('Error:', error);
  }
}
