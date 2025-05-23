import { SuiClient } from '@mysten/sui.js/client';

export const suiClient = new SuiClient({
  url: 'https://fullnode.devnet.sui.io:443', // Using Devnet since your backend uses it
});