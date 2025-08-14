const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { ethers } = require('ethers');
const ipfsClient = require('ipfs-http-client');

dotenv.config();

const ABI = [
  "function storeMemory(string _cid) returns (uint256)",
  "function getMemory(uint256 index) view returns (address provider, string cid, uint256 timestamp)",
  "function totalMemories() view returns (uint256)",
  "function getMemoriesBatch(uint256 start, uint256 limit) view returns (tuple(address provider, string cid, uint256 timestamp)[])",
  "event MemoryStored(uint256 indexed id, address indexed provider, string cid)"
];

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const PORT = Number(process.env.PORT || 3000);

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;
const contract = CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet ?? provider) : null;

let ipfs = null;
if (process.env.IPFS_PROJECT_ID && process.env.IPFS_PROJECT_SECRET) {
  const auth = 'Basic ' + Buffer.from(process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_SECRET).toString('base64');
  ipfs = ipfsClient.create({ url: 'https://ipfs.infura.io:5001', headers: { authorization: auth } });
} else {
  try { ipfs = ipfsClient.create(); } catch (e) { ipfs = null; }
}

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));

app.get('/', (_req, res) => res.json({ ok: true, network: RPC_URL }));

app.get('/memories/count', async (_req, res) => {
  if (!contract) return res.status(400).json({ error: 'CONTRACT_ADDRESS not set' });
  try { const total = await contract.totalMemories(); res.json({ total: Number(total) }); }
  catch (e) { console.error(e); res.status(500).json({ error: 'failed' }); }
});

app.get('/memories/:index', async (req, res) => {
  if (!contract) return res.status(400).json({ error: 'CONTRACT_ADDRESS not set' });
  try { const idx = Number(req.params.index); const mem = await contract.getMemory(idx);
    res.json({ provider: mem.provider, cid: mem.cid, timestamp: Number(mem.timestamp) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'failed' }); }
});

app.post('/memories', async (req, res) => {
  if (!contract) return res.status(400).json({ error: 'CONTRACT_ADDRESS not set' });
  try {
    let cid = req.body.cid;
    if (!cid && req.body.content) {
      if (!ipfs) return res.status(500).json({ error: 'IPFS client not configured' });
      const added = await ipfs.add(req.body.content);
      cid = added.path || added.cid.toString();
      if (!cid) return res.status(500).json({ error: 'ipfs add failed' });
      cid = cid.startsWith('ipfs://') ? cid : `ipfs://${cid}`;
    }
    if (!cid) return res.status(400).json({ error: 'cid or content required' });

    const tx = await contract.storeMemory(cid);
    const receipt = await tx.wait();
    res.json({ ok: true, txHash: receipt.transactionHash });
  } catch (e) { console.error(e); res.status(500).json({ error: 'failed', details: String(e) }); }
});

app.listen(PORT, () => console.log(`MemoryChain backend running on http://localhost:${PORT}`));
