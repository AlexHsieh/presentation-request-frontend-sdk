import { mount } from '@vue/test-utils';
import { expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { IssuerBanner } from '../src';
const issuer = { did:'did:example:issuer', name:'I Am Human', description:'<script>bad()</script>', iconUrl:'https://example.com/icon.png?token=public', websiteUrl:'https://iamhuman.link', defaultLocale:'en' as const, localizations:{'zh-Hant':{name:'I Am Human', description:'中文說明'}} };
it('renders safe localized content, links and failed-image fallback', async () => {
 const wrapper=mount(IssuerBanner,{props:{issuer,locale:'zh-Hant'}});
 expect(wrapper.text()).toContain('中文說明');
 expect(wrapper.get('img').attributes('src')).toBe(issuer.iconUrl);
 expect(wrapper.get('a').attributes('rel')).toBe('noopener noreferrer');
 await wrapper.get('img').trigger('error'); expect(wrapper.find('img').exists()).toBe(false);
 await wrapper.setProps({locale:'fr'}); expect(wrapper.text()).toContain(issuer.description); expect(wrapper.find('script').exists()).toBe(false);
 await wrapper.setProps({issuer:{...issuer,websiteUrl:'javascript:bad()'}}); expect(wrapper.find('aside').exists()).toBe(false);
});
it('matches text height, caps the icon at 256px, and disconnects on unmount', async () => {
 let resize!: ResizeObserverCallback;
 const disconnect = vi.fn();
 vi.stubGlobal('ResizeObserver', class {
  constructor(callback: ResizeObserverCallback) { resize = callback; }
  observe = vi.fn();
  disconnect = disconnect;
 });
 const bounds = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
 bounds.mockReturnValue({ height: 90 } as DOMRect);
 const wrapper = mount(IssuerBanner, { props: { issuer } });
 try {
  await nextTick();
  expect(wrapper.get('img').element.style.height).toBe('90px');
  bounds.mockReturnValue({ height: 320 } as DOMRect);
  resize([], {} as ResizeObserver);
  await nextTick();
  expect(wrapper.get('img').element.style.height).toBe('256px');
  bounds.mockReturnValue({ height: 72 } as DOMRect);
  resize([], {} as ResizeObserver);
  await nextTick();
  await wrapper.get('img').trigger('error');
  expect(wrapper.get('.issuer-banner__fallback').attributes('style')).toContain('height: 72px');
 } finally {
  wrapper.unmount();
  bounds.mockRestore();
  vi.unstubAllGlobals();
 }
 expect(disconnect).toHaveBeenCalled();
});
