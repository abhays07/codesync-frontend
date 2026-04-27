import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const SOCKET_URL = import.meta.env.VITE_WS_URL ?? 'http://65.1.129.94:9000/ws-collab';

let stompClient = null;
let connectPromise = null;
const subscriptionsByKey = new Map();

const ensureConnected = () => {
    if (stompClient?.connected) return Promise.resolve();
    if (connectPromise) return connectPromise;

    stompClient = Stomp.over(() => new SockJS(SOCKET_URL));
    stompClient.debug = () => {};

    connectPromise = new Promise((resolve, reject) => {
        stompClient.connect(
            {},
            () => resolve(),
            (err) => reject(err),
        );
    }).finally(() => {
        // Allow a later reconnect attempt if this one fails/disconnects.
        connectPromise = null;
    });

    return connectPromise;
};

// Backwards-compatible helper: connect + subscribe for a single session id.
export const connectWebSocket = (sessionId, onMessageReceived) => (
    subscribeToSession(sessionId, onMessageReceived)
);

export const subscribeToSession = async (sessionId, onMessageReceived, key) => {
    if (!sessionId) return () => {};

    const subKey = key || `session:${sessionId}`;

    await ensureConnected();

    // Replace any existing subscription under the same key.
    const existing = subscriptionsByKey.get(subKey);
    if (existing) {
        try { existing.unsubscribe(); } catch {}
        subscriptionsByKey.delete(subKey);
    }

    const subscription = stompClient.subscribe(`/topic/session/${sessionId}`, (message) => {
        try {
            onMessageReceived(JSON.parse(message.body));
        } catch {
            // Ignore malformed payloads.
        }
    });

    subscriptionsByKey.set(subKey, subscription);

    return () => {
        const current = subscriptionsByKey.get(subKey);
        if (current) {
            try { current.unsubscribe(); } catch {}
            subscriptionsByKey.delete(subKey);
        }
    };
};

export const sendSessionMessage = (sessionId, payload) => {
    if (!stompClient?.connected || !sessionId) return false;

    stompClient.send(
        `/app/session/${sessionId}`,
        {},
        JSON.stringify(payload),
    );

    return true;
};

export const sendCodeChange = (sessionId, payload) => (
    sendSessionMessage(sessionId, {
        type: 'CODE_UPDATE',
        ...payload,
    })
);

export const disconnectWebSocket = () => {
    subscriptionsByKey.forEach((sub) => {
        try { sub.unsubscribe(); } catch {}
    });
    subscriptionsByKey.clear();

    if (stompClient) {
        stompClient.disconnect();
        stompClient = null;
    }
};
