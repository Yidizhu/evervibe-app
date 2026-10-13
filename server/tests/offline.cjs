'use strict';
// Every provider used by this suite must be explicitly injected as a fixture.
// An accidental default fetch fails locally instead of spending API credits.
globalThis.fetch=async()=>{throw new Error('OFFLINE_TEST_NETWORK_BLOCKED');};
