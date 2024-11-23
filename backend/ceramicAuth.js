// backend/ceramicAuth.js

import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';
import { randomBytes } from '@stablelib/random';

async function createDID() {
  // Generate a random seed
  const seed = randomBytes(32);

  // Create a provider using the seed
  const provider = new Ed25519Provider(seed);

  // Create a DID instance
  const did = new DID({
    provider,
    resolver: getResolver(),
  });

  // Authenticate the DID
  await did.authenticate();

  return did;
}

export { createDID };
