const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const MemoryChain = await hre.ethers.getContractFactory("MemoryChain");
  const memoryChain = await MemoryChain.deploy();
  await memoryChain.waitForDeployment();
  const addr = await memoryChain.getAddress();
  console.log("MemoryChain deployed to:", addr);

  const out = { address: addr, network: hre.network.name, timestamp: Date.now() };
  fs.writeFileSync(path.join(__dirname, "../.deployed.json"), JSON.stringify(out, null, 2));
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
