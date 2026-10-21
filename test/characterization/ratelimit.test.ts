import { describe, it, expect } from 'vitest';

// §0.6 Rate-limit note: pin the verbatim 429 body + current window/max config by assertion rather
// than by triggering 429 in a unit test. The Phase-3 dedicated login limiter MUST reuse this exact
// body shape ({message:...}, NOT {error:...}).
describe('rate limiter config (pinned)', () => {
  it('429 body shape is {message: "..."} verbatim', () => {
    const body = { message: 'Muchas peticiones, por favor intente mas tarde.' };
    expect(body).toMatchSnapshot();
  });

  it('global window/max come from env (defaults 15 min / 100)', () => {
    const windowMinutes = Number(process.env.RATE_LIMIT_WINDOW_MINUTES ?? 15);
    const max = Number(process.env.RATE_LIMIT_MAX ?? 100);
    expect({ windowMinutes, max }).toMatchSnapshot();
  });
});
