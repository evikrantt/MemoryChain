const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MemoryChain", function () {
  it("stores and reads CIDs, batch read, and tipping", async function () {
    const [prov, other] = await ethers.getSigners();
    const MemoryChain = await ethers.getContractFactory("MemoryChain");
    const mc = await MemoryChain.deploy();
    await mc.waitForDeployment();

    const cid1 = "ipfs://bafybeicid1";
    await (await mc.connect(prov).storeMemory(cid1)).wait();

    const cid2 = "ipfs://bafybeicid2";
    await (await mc.connect(other).storeMemory(cid2)).wait();

    const total = await mc.totalMemories();
    expect(total).to.equal(2n);

    const mem0 = await mc.getMemory(0);
    expect(mem0[1]).to.equal(cid1);

    const batch = await mc.getMemoriesBatch(0, 10);
    expect(batch.length).to.equal(2);

    const tx = await mc.connect(other).tip(prov.address, { value: ethers.parseEther("0.01") });
    await tx.wait();
    const bal = await mc.tipsBalance(prov.address);
    expect(bal).to.be.gt(0n);
  });
});
