// https://hardhat.org/tutorial/deploying-to-a-live-network 

const MIN_BUY_ETH = ethers.utils.parseEther('1').div(10); // 0.1 ETH
// Tester 2
const ADMIN_ADDRESS = "0x67E7E4Bc1962470B70B5B6C9E95AE858B8Ab55E5";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const FundMgt = await ethers.getContractFactory("FundManagement");
  const fundMgt = await FundMgt.deploy(ADMIN_ADDRESS, MIN_BUY_ETH);

  console.log("Token address:", fundMgt.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });