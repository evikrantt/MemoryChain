// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MemoryChain - Minimal shared memory registry for AI agents
/// @notice Stores references (IPFS CIDs) to encrypted memory chunks and supports tipping providers.
contract MemoryChain {
    struct Memory { address provider; string cid; uint256 timestamp; }
    event MemoryStored(uint256 indexed id, address indexed provider, string cid, uint256 timestamp);
    event TipSent(address indexed from, address indexed to, uint256 amount);

    Memory[] private memories;
    mapping(address => uint256) public tipsBalance;
    address public immutable owner;

    modifier onlyOwner() { require(msg.sender == owner, "only owner"); _; }

    constructor() { owner = msg.sender; }

    function storeMemory(string calldata _cid) external returns (uint256 id) {
        require(bytes(_cid).length > 0, "cid required");
        id = memories.length;
        memories.push(Memory({ provider: msg.sender, cid: _cid, timestamp: block.timestamp }));
        emit MemoryStored(id, msg.sender, _cid, block.timestamp);
    }

    function getMemory(uint256 index) external view returns (address provider, string memory cid, uint256 timestamp) {
        require(index < memories.length, "index OOB");
        Memory storage m = memories[index];
        return (m.provider, m.cid, m.timestamp);
    }

    function totalMemories() external view returns (uint256) { return memories.length; }

    function getMemoriesBatch(uint256 start, uint256 limit) external view returns (Memory[] memory batch) {
        uint256 total = memories.length; if (start >= total) return new Memory;
        uint256 end = start + limit; if (end > total) end = total;
        uint256 outLen = end - start; batch = new Memory[](outLen);
        for (uint256 i = 0; i < outLen; i++) batch[i] = memories[start + i];
    }

    function tip(address to) external payable {
        require(msg.value > 0, "no value");
        tipsBalance[to] += msg.value;
        (bool ok, ) = payable(to).call{value: msg.value}(""); require(ok, "transfer failed");
        emit TipSent(msg.sender, to, msg.value);
    }

    function withdraw(address payable to) external onlyOwner {
        uint256 bal = address(this).balance; require(bal > 0, "no funds");
        (bool ok, ) = to.call{value: bal}(""); require(ok, "withdraw failed");
    }
}
