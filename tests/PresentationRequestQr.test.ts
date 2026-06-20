import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PresentationRequestQr } from '../src';

vi.mock('qrcode.vue', () => ({
  default: { props: ['value', 'size'], template: '<div data-testid="qr-code">{{ value }}:{{ size }}</div>' },
}));

describe('PresentationRequestQr', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the wallet QR link, countdown, status, and action events', async () => {
    const wrapper = mount(PresentationRequestQr, {
      props: {
        pdUrl: 'https://api.example.test/pd?sessionId=qr-1',
        returnUrl: 'https://app.example.test/return?sessionId=qr-1',
        expiresAt: '2026-01-01T00:00:05.000Z',
        size: 180,
        linkLabel: 'Open wallet',
        statusLabel: 'Waiting',
        refreshLabel: 'Refresh',
        checkStatusLabel: 'Check',
        expiresInLabel: (seconds: number) => `${seconds} seconds`,
      },
    });

    const href = new URL(wrapper.get('a').attributes('href'));
    expect(href.searchParams.get('url')).toBe('https://api.example.test/pd?sessionId=qr-1');
    expect(href.searchParams.get('returnUrl')).toBe('https://app.example.test/return?sessionId=qr-1');
    expect(wrapper.get('[data-testid="qr-code"]').text()).toContain('https://iamhuman.link/presentation-request');
    expect(wrapper.text()).toContain('5 seconds');
    expect(wrapper.text()).toContain('Waiting');

    await wrapper.findAll('button')[0].trigger('click');
    await wrapper.findAll('button')[1].trigger('click');

    expect(wrapper.emitted('refresh')).toHaveLength(1);
    expect(wrapper.emitted('check-status')).toHaveLength(1);
  });

  it('can encode the raw PD URL in the QR code', () => {
    const wrapper = mount(PresentationRequestQr, {
      props: {
        pdUrl: 'https://api.example.test/pd',
        qrValueMode: 'pd',
      },
    });

    expect(wrapper.get('[data-testid="qr-code"]').text()).toContain('https://api.example.test/pd');
  });

  it('shows the expired label when the countdown reaches zero', async () => {
    const wrapper = mount(PresentationRequestQr, {
      props: {
        pdUrl: 'https://api.example.test/pd',
        expiresAt: '2026-01-01T00:00:01.000Z',
        expiredLabel: 'Expired now',
      },
    });

    expect(wrapper.text()).toContain('1s');
    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Expired now');
  });
});
