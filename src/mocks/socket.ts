import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';
import type { NftUpdatedEvent, OrderUpdatedEvent } from '../types';

export const socketLink = ws.link('wss://api.kurio.marketplace');

// Store active client connections
const activeClients = new Set<{ emit: (event: string, ...args: unknown[]) => void }>();

socketLink.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection);
  const client = io.client;

  activeClients.add(client);

  client.on('disconnect', () => {
    activeClients.delete(client);
  });

  // Handle client subscriptions if any
  client.on('subscribe:nft', (nftId: any) => {
    client.emit('subscribed', { nftId, status: 'ok' });
  });
});

/**
 * Broadcast an NFT update event to all connected Socket.IO clients.
 */
export function broadcastNftUpdate(event: NftUpdatedEvent) {
  for (const client of activeClients) {
    try {
      client.emit('nft.updated', event);
    } catch (err) {
      console.warn('Failed to emit to client', err);
    }
  }
}

/**
 * Simulate random market fluctuations every 45 seconds if enabled.
 */
export function broadcastOrderUpdate(event: OrderUpdatedEvent) {
  for (const client of activeClients) {
    try {
      client.emit('order.updated', event);
    } catch (error) {
      console.warn('Failed to emit order update', error);
    }
  }
}
let simulationInterval: number | null = null;

export function startPriceFluctuationSimulation(
  getNfts: () => Array<{ id: string; priceEth: string; available: number; version: number }>,
  onUpdate: (event: NftUpdatedEvent) => void
) {
  if (simulationInterval !== null) return;

  simulationInterval = window.setInterval(() => {
    const nfts = getNfts();
    if (!nfts.length) return;

    // Pick random NFT to fluctuate
    const target = nfts[Math.floor(Math.random() * nfts.length)];
    const priceNum = parseFloat(target.priceEth);
    const delta = (Math.random() * 0.1 - 0.04).toFixed(3); // -0.04 to +0.06 ETH
    const newPrice = Math.max(0.1, Number((priceNum + parseFloat(delta)).toFixed(3))).toString();

    const updateEvent: NftUpdatedEvent = {
      event: 'nft.updated',
      nftId: target.id,
      priceEth: newPrice,
      available: target.available,
      version: (target.version || 1) + 1,
      timestamp: new Date().toISOString(),
    };

    onUpdate(updateEvent);
    broadcastNftUpdate(updateEvent);
  }, 45000);
}

export function stopPriceFluctuationSimulation() {
  if (simulationInterval !== null) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}


