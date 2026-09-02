let media: MediaStream | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export const broadcast = {
  set(stream: MediaStream | null) {
    if (media && media !== stream) {
      for (const track of media.getTracks()) track.stop();
    }
    media = stream;
    notify();
  },
  get() {
    return media;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
