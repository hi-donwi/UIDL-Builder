import { useBuilderStore, type BuilderPage } from "./builderStore";
import type { ThemeCustomizationConfig } from "./themeTokens";
import { validateDocument } from "./schemaValidator";

export interface SyncMessage {
  type: "PEER_JOIN" | "PEER_LEAVE" | "HEARTBEAT" | "SYNC_STATE" | "NODE_SELECT";
  tabId: string;
  timestamp: number;
  payload?: {
    pages?: BuilderPage[];
    activePageId?: string;
    themeMode?: "dark" | "light";
    themeConfig?: ThemeCustomizationConfig;
    selectedNodeId?: string | null;
  };
}

export const CURRENT_TAB_ID = `tab_${Math.random().toString(36).substring(2, 9)}`;

let channel: BroadcastChannel | null = null;
let isIncomingSync = false;
const activePeers = new Map<string, number>();
const peerCountListeners = new Set<(count: number) => void>();

function notifyPeerCount(): void {
  const count = activePeers.size;
  for (const listener of peerCountListeners) {
    listener(count);
  }
}

/**
 * Register a listener for changes in connected peer tabs count.
 */
export function subscribePeerCount(listener: (count: number) => void): () => void {
  peerCountListeners.add(listener);
  listener(activePeers.size);
  return () => {
    peerCountListeners.delete(listener);
  };
}

/**
 * Get the current number of active remote peer tabs.
 */
export function getActivePeerCount(): number {
  return activePeers.size;
}

/**
 * Check if the store is currently processing an incoming remote sync.
 */
export function isRemoteSyncing(): boolean {
  return isIncomingSync;
}

/**
 * Broadcast local store state to all other open tabs.
 */
export function broadcastStateChange(
  pages: BuilderPage[],
  activePageId: string,
  themeMode: "dark" | "light",
  themeConfig?: ThemeCustomizationConfig
): void {
  if (!channel || isIncomingSync) return;

  try {
    const msg: SyncMessage = {
      type: "SYNC_STATE",
      tabId: CURRENT_TAB_ID,
      timestamp: Date.now(),
      payload: {
        pages,
        activePageId,
        themeMode,
        themeConfig,
      },
    };
    channel.postMessage(msg);
  } catch (err) {
    console.warn("[UIDL Broadcast] Failed to broadcast state:", err);
  }
}

/**
 * Initialize cross-tab BroadcastChannel collaboration.
 */
export function initBroadcastSync(): () => void {
  if (typeof BroadcastChannel === "undefined") {
    return () => {};
  }

  if (channel) {
    return () => {};
  }

  try {
    channel = new BroadcastChannel("uidl_builder_sync_v1");

    channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object" || msg.tabId === CURRENT_TAB_ID) {
        return;
      }

      const now = Date.now();

      switch (msg.type) {
        case "PEER_JOIN":
        case "HEARTBEAT": {
          const isNew = !activePeers.has(msg.tabId);
          activePeers.set(msg.tabId, now);
          if (isNew) {
            notifyPeerCount();
            // Respond with heartbeat so newcomer knows about us
            if (msg.type === "PEER_JOIN") {
              channel?.postMessage({
                type: "HEARTBEAT",
                tabId: CURRENT_TAB_ID,
                timestamp: now,
              });
            }
          }
          break;
        }

        case "PEER_LEAVE": {
          if (activePeers.delete(msg.tabId)) {
            notifyPeerCount();
          }
          break;
        }

        case "SYNC_STATE": {
          activePeers.set(msg.tabId, now);
          notifyPeerCount();

          if (!msg.payload?.pages || !Array.isArray(msg.payload.pages)) return;

          // Validate that the remote document is structurally sound
          const incomingPages = msg.payload.pages;
          const incomingActiveId = msg.payload.activePageId;
          const activePage = incomingPages.find((p) => p.id === incomingActiveId) || incomingPages[0];

          if (!activePage || !activePage.document) return;

          const val = validateDocument(activePage.document);
          if (!val.isValid) return;

          isIncomingSync = true;
          try {
            useBuilderStore.setState({
              pages: incomingPages,
              activePageId: activePage.id,
              document: activePage.document,
              themeMode: msg.payload.themeMode || "dark",
              themeConfig: msg.payload.themeConfig || useBuilderStore.getState().themeConfig,
              validationErrors: val.errors,
              saveStatus: "saved",
              lastSavedAt: `Synced from tab ${msg.tabId.slice(-4)}`,
            });
          } finally {
            // Allow next event tick to reset flag
            setTimeout(() => {
              isIncomingSync = false;
            }, 50);
          }
          break;
        }
      }
    };

    // Announce presence
    channel.postMessage({
      type: "PEER_JOIN",
      tabId: CURRENT_TAB_ID,
      timestamp: Date.now(),
    });

    // Heartbeat interval and dead-peer pruning
    const heartbeatTimer = setInterval(() => {
      if (!channel) return;
      channel.postMessage({
        type: "HEARTBEAT",
        tabId: CURRENT_TAB_ID,
        timestamp: Date.now(),
      });

      // Prune peers that missed heartbeats for > 15s
      const cutoff = Date.now() - 15000;
      let changed = false;
      for (const [peerId, lastSeen] of activePeers.entries()) {
        if (lastSeen < cutoff) {
          activePeers.delete(peerId);
          changed = true;
        }
      }
      if (changed) {
        notifyPeerCount();
      }
    }, 5000);

    // Announce departure on page unload
    const handleUnload = () => {
      if (channel) {
        channel.postMessage({
          type: "PEER_LEAVE",
          tabId: CURRENT_TAB_ID,
          timestamp: Date.now(),
        });
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleUnload);
    }

    return () => {
      clearInterval(heartbeatTimer);
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", handleUnload);
      }
      handleUnload();
      channel?.close();
      channel = null;
    };
  } catch (err) {
    console.warn("[UIDL Broadcast] Error creating BroadcastChannel:", err);
    return () => {};
  }
}
