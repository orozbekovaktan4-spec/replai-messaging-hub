// Self-check for routing WhatsApp webhooks to the business that owns the number.
// Run: node tests/whatsapp-routing.test.mjs
import assert from 'node:assert/strict';
import { pickBusinessByWhatsAppPhoneId } from '../db.js';

const whiteGold = { id: 'wg', whatsapp: { connected: true, phoneNumberId: '111', accessToken: 't1' } };
const testShop = { id: 'ts', whatsapp: { connected: true, phoneNumberId: '222', accessToken: 't2' } };
const legacy = { id: 'lg', whatsapp: { connected: true, phoneId: '333' } };
const disconnected = { id: 'dc', whatsapp: { connected: false, phoneNumberId: '444' } };
const none = { id: 'no', whatsapp: null };
const all = [none, whiteGold, testShop, legacy, disconnected];

// Each number goes to its own business, regardless of order (the old businesses[0] bug).
assert.equal(pickBusinessByWhatsAppPhoneId(all, '111').id, 'wg');
assert.equal(pickBusinessByWhatsAppPhoneId(all, '222').id, 'ts');
assert.equal(pickBusinessByWhatsAppPhoneId([testShop, whiteGold], '111').id, 'wg');
assert.equal(pickBusinessByWhatsAppPhoneId(all, 111).id, 'wg'); // number id

// Older records that only have phoneId still route.
assert.equal(pickBusinessByWhatsAppPhoneId(all, '333').id, 'lg');

// Unknown, disconnected or missing id: nobody, never a fallback.
assert.equal(pickBusinessByWhatsAppPhoneId(all, '999'), null);
assert.equal(pickBusinessByWhatsAppPhoneId(all, '444'), null);
assert.equal(pickBusinessByWhatsAppPhoneId(all, null), null);
assert.equal(pickBusinessByWhatsAppPhoneId(null, '111'), null);

console.log('✓ whatsapp routing: all assertions passed');
