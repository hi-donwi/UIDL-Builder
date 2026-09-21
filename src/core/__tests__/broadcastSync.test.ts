import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  initBroadcastSync,
  subscribePeerCount,
  broadcastStateChange,
  getActivePeerCount,
  CURRENT_TAB_ID,
  type SyncMessage,
} from "../broadcastSync";
import type { BuilderPage } from "../builderStore";

describe("broadcastSync", () => {
  let channelListeners: Array<(event: MessageEvent<SyncMessage>) => void> = [];
  let postedMessages: SyncMessage[] = [];

  class MockBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent<SyncMessage>) => void) | null = null;

    constructor(name: string) {
      this.name = name;
      channelListeners.push((e) => {
        if (this.onmessage) this.onmessage(e);
      });
    }

    postMessage(data: SyncMessage) {
      postedMessages.push(data);
    }

    close() {
      // noop
    }
  }

  beforeEach(() => {
    channelListeners = [];
    postedMessages = [];
    Object.defineProperty(globalThis, "BroadcastChannel", {
      value: MockBroadcastChannel,
      writable: true,
      configurable: true,
    });
  });

  it("subscribes to peer count and returns initial count", () => {
    let observedCount = -1;
    const unsub = subscribePeerCount((count) => {
      observedCount = count;
    });
    expect(observedCount).toBeGreaterThanOrEqual(0);
    unsub();
  });

  it("broadcasts state change message with current tab ID", () => {
    initBroadcastSync();

    const samplePages: BuilderPage[] = [];
    broadcastStateChange(samplePages, "page-1", "dark");

    const stateMsg = postedMessages.find((m) => m.type === "SYNC_STATE");
    expect(stateMsg).toBeDefined();
    expect(stateMsg?.tabId).toBe(CURRENT_TAB_ID);
    expect(stateMsg?.payload?.activePageId).toBe("page-1");
  });
});
