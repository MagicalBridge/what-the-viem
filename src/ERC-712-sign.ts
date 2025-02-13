import { ethers } from 'ethers';

async function signMessage() {
  let provider, signer;

  if (typeof (window as any).ethereum !== 'undefined') {
    // 使用 MetaMask 或类似的浏览器钱包
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider((window as any).ethereum);
    signer = await provider.getSigner();
  } else {
    // 如果没有浏览器钱包，使用 JsonRpcProvider
    provider = new ethers.JsonRpcProvider('YOUR_INFURA_OR_ALCHEMY_URL');
    signer = await provider.getSigner();
  }

  const contractAddress = 'YOUR_CONTRACT_ADDRESS';

  const abi = [
    'function verify(address signer, tuple(string content, uint256 timestamp) message, uint8 v, bytes32 r, bytes32 s) public view returns (bool)'
  ];

  const contract = new ethers.Contract(contractAddress, abi, signer);

  try {
    const chainId = (await provider.getNetwork()).chainId;

    const domain = {
      name: 'EIP712Domain',
      version: '1',
      chainId: chainId,
      verifyingContract: contractAddress
    };

    const types = {
      Message: [
        { name: 'content', type: 'string' },
        { name: 'timestamp', type: 'uint256' }
      ]
    };

    const message = {
      content: 'Hello, Ethereum!',
      timestamp: Math.floor(Date.now() / 1000)
    };

    const signature = await signer.signTypedData(domain, types, message);

    const { v, r, s } = ethers.Signature.from(signature);

    const signerAddress = await signer.getAddress();

    const isValid = await contract.verify(signerAddress, message, v, r, s);

    console.log('Signature is valid:', isValid);
  } catch (error) {
    console.error('Error during signing process:', error);
  }
}

signMessage().catch(console.error);
