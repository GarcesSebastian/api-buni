// Shared, typed socket.io contract. The naming and payload shapes match the current events exactly
// (design §6.1). The frontend consumes a types-only MIRROR of this file
// (Buni/src/types/contract.generated.ts), emitted by scripts/export-contract.ts.

/** The `user`-shaped object the client emits with UPDATE_DATA (and the full payload authenticated
 * recipients receive). Arbitrary extra fields flow through (.passthrough() on the server). */
export interface UpdateDataPayload {
  events?: unknown;
  forms?: unknown;
  scenery?: unknown;
  programs?: unknown;
  [key: string]: unknown;
}

/** The subset unauthenticated recipients receive. */
export interface UpdateDataSubset {
  events?: unknown;
  forms?: unknown;
  scenery?: unknown;
  programs?: unknown;
}

export interface UpdateUserPayload {
  email: string;
  [key: string]: unknown;
}

export interface UpdateEventFormsPayload {
  idEvent: string;
  typeForm: 'inscriptions' | 'assists';
  data: Record<string, string | number>;
}

export interface ClientConnectedPayload {
  // token is optional once the token_hs handshake cookie works; the body token stays the fallback.
  token?: string;
}

export interface ClientToServerEvents {
  client_connected: (payload: ClientConnectedPayload) => void;
  UPDATE_DATA: (payload: UpdateDataPayload) => void;
  UPDATE_USER: (payload: UpdateUserPayload) => void;
  UPDATE_EVENT_FORMS: (payload: UpdateEventFormsPayload) => void;
}

export interface ServerToClientEvents {
  UPDATE_DATA: (payload: UpdateDataPayload | UpdateDataSubset) => void;
  UPDATE_USER: (payload: UpdateUserPayload) => void;
  UPDATE_EVENT_FORMS: (payload: UpdateEventFormsPayload) => void;
}
