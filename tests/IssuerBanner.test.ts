import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
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
