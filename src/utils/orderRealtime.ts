const ORDER_CHANGE_EVENT = "coffeesys:order-changed";
const ORDER_CHANGE_CHANNEL = "coffeesys-order-realtime";
const ORDER_CHANGE_STORAGE_KEY = "coffeesys:last-order-change";

interface OrderChangeMessage {
  type: typeof ORDER_CHANGE_EVENT;
  orderId?: number;
  orderNo?: string;
  changedAt: number;
}

const createMessage = (
  payload: Omit<OrderChangeMessage, "type" | "changedAt"> = {}
): OrderChangeMessage => ({
  type: ORDER_CHANGE_EVENT,
  changedAt: Date.now(),
  ...payload,
});

const getBroadcastChannel = () => {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }

  return new BroadcastChannel(ORDER_CHANGE_CHANNEL);
};

export const publishOrderChange = (
  payload: Omit<OrderChangeMessage, "type" | "changedAt"> = {}
) => {
  if (typeof window === "undefined") return;

  const message = createMessage(payload);
  window.dispatchEvent(new CustomEvent<OrderChangeMessage>(ORDER_CHANGE_EVENT, { detail: message }));

  const channel = getBroadcastChannel();
  channel?.postMessage(message);
  channel?.close();

  localStorage.setItem(ORDER_CHANGE_STORAGE_KEY, JSON.stringify(message));
};

export const subscribeOrderChange = (onChange: (message: OrderChangeMessage) => void) => {
  if (typeof window === "undefined") return () => {};

  const handleMessage = (message: OrderChangeMessage) => {
    if (message?.type === ORDER_CHANGE_EVENT) {
      onChange(message);
    }
  };

  const handleWindowEvent = (event: Event) => {
    handleMessage((event as CustomEvent<OrderChangeMessage>).detail);
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== ORDER_CHANGE_STORAGE_KEY || !event.newValue) return;

    try {
      handleMessage(JSON.parse(event.newValue) as OrderChangeMessage);
    } catch {
      // Ignore malformed cross-tab payloads.
    }
  };

  const channel = getBroadcastChannel();
  channel?.addEventListener("message", (event) => handleMessage(event.data));
  window.addEventListener(ORDER_CHANGE_EVENT, handleWindowEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    channel?.close();
    window.removeEventListener(ORDER_CHANGE_EVENT, handleWindowEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
};
