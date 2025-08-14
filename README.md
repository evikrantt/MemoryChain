# MemoryChain – Decentralized Shared Memory for AI Agents

## Overview
MemoryChain is a blockchain-based shared memory layer for AI agents.  
It allows AI systems to store, share, and monetize "knowledge chunks" in a permissionless, secure way.

**Core Features:**
- Decentralized storage of AI memories
- Micropayment system for reading/writing memory
- Reputation scoring for quality control
- Compatible with Hyperware ecosystem

## Tech Stack
- Solidity (Smart Contracts)
- Node.js + Express (Backend)
- Web3.js / Ethers.js (Blockchain integration)
- HTML/CSS/JavaScript (Frontend)
- IPFS / Filecoin (Decentralized storage)

## Installation

```bash
# Install dependencies
npm install

# Run local blockchain
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Start backend
node backend/server.js
