// Self-check for Instagram account selection during OAuth.
// Run: node tests/instagram-page-selection.test.mjs
import assert from 'node:assert/strict';
import { selectInstagramPage } from '../connection-manager.js';

const aktan = { id: '100', name: 'Aktan Page', access_token: 'tok-aktan', instagram_business_account: { id: '17841001', username: 'akt4n.o' } };
const whiteGold = { id: '200', name: 'White Gold', access_token: 'tok-wg', instagram_business_account: { id: '17841002', username: 'white.gold.kg' } };
const noIg = { id: '300', name: 'Random Page', access_token: 'tok-x' };

// Single Instagram account: connect it.
assert.equal(selectInstagramPage([aktan]).instagram_business_account.username, 'akt4n.o');
assert.equal(selectInstagramPage([aktan, noIg]).instagram_business_account.username, 'akt4n.o');

// Two accounts and no choice: refuse rather than guess (the old data[0] bug).
assert.throws(() => selectInstagramPage([aktan, whiteGold]), /administers 2 Instagram accounts/);

// Explicit choice is honoured, and honoured over page order.
assert.equal(selectInstagramPage([aktan, whiteGold], '200').instagram_business_account.username, 'white.gold.kg');
assert.equal(selectInstagramPage([whiteGold, aktan], '100').instagram_business_account.username, 'akt4n.o');
assert.equal(selectInstagramPage([aktan, whiteGold], 200).instagram_business_account.username, 'white.gold.kg'); // number id

// A choice the user cannot actually administer is an error, not a fallback.
assert.throws(() => selectInstagramPage([aktan], '999'), /not available to this Facebook user/);

// Nothing usable.
assert.throws(() => selectInstagramPage([]), /No Facebook Pages found/);
assert.throws(() => selectInstagramPage(null), /No Facebook Pages found/);
assert.throws(() => selectInstagramPage([noIg]), /No Instagram Business Account linked/);

// A page whose token was withheld must fail loudly.
assert.throws(
  () => selectInstagramPage([{ ...whiteGold, access_token: undefined }]),
  /pages_show_list permission was not granted/
);

console.log('✓ instagram page selection: all assertions passed');
