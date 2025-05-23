// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');

// const app = express();
// const port = 5000;

// // Enable CORS for your frontend
// app.use(cors({
//   origin: 'http://localhost:5173', // Adjust if your frontend runs on a different port
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// // Middleware to parse JSON requests
// app.use(express.json());

// // Test endpoint
// app.get('/api/test', (req, res) => {
//   res.json({ message: 'Node.js backend is working!' });
// });

// // Endpoint to fetch an object from the Sui blockchain using the RPC endpoint
// app.get('/api/object/:id', async (req, res) => {
//   try {
//     const objectId = req.params.id;
//     const response = await axios.post('https://fullnode.devnet.sui.io:443', {
//       jsonrpc: '2.0',
//       id: 1,
//       method: 'sui_getObject',
//       params: [objectId, { showContent: true }],
//     }, {
//       headers: { 'Content-Type': 'application/json' },
//     });

//     if (response.data.error) {
//       throw new Error(response.data.error.message);
//     }

//     res.json(response.data.result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 5000;

// Enable CORS for your frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware to parse JSON requests
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Node.js backend is working!' });
});

// Endpoint to fetch an object from the Sui blockchain
app.get('/api/object/:id', async (req, res) => {
  try {
    const objectId = req.params.id;
    const response = await axios.post('https://fullnode.devnet.sui.io:443', {
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getObject',
      params: [objectId, { showContent: true }],
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    res.json(response.data.result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch an expense group
app.get('/api/expense-group/:groupId', async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const response = await axios.post('https://fullnode.devnet.sui.io:443', {
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_dryRunTransactionBlock',
      params: [
        {
          kind: 'TransactionKind',
          transactions: [
            {
              kind: 'MoveCall',
              target: '0x123...::sui_split::get_expense_group', // Replace with your package ID and function
              arguments: [groupId],
              typeArguments: [],
            },
          ],
        },
      ],
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    res.json(response.data.result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to create an expense group
app.post('/api/create-expense-group', async (req, res) => {
  try {
    const { creator, participants } = req.body;
    if (!creator || !participants || !Array.isArray(participants)) {
      throw new Error('Invalid input: creator and participants are required');
    }

    const response = await axios.post('https://fullnode.devnet.sui.io:443', {
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_dryRunTransactionBlock',
      params: [
        {
          kind: 'TransactionKind',
          transactions: [
            {
              kind: 'MoveCall',
              target: '0x123...::sui_split::create_expense_group', // Replace with your package ID and function
              arguments: [creator, participants],
              typeArguments: [],
            },
          ],
        },
      ],
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    res.json({ success: true, result: response.data.result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});