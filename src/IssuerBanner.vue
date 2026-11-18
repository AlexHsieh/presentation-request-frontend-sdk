<template>
  <aside v-if="valid" class="issuer-banner" :aria-label="labels?.issuer || (locale === 'zh-Hant' ? '憑證簽發者' : 'Credential issuer')">
    <img v-if="!imageFailed" :src="issuer.iconUrl" :style="iconStyle" alt="" referrerpolicy="no-referrer" @error="imageFailed = true" />
    <span v-else class="issuer-banner__fallback" :style="iconStyle" aria-hidden="true">{{ issuer.name.charAt(0) }}</span>
    <div ref="content" class="issuer-banner__content">
      <strong>{{ text.name }}</strong>
      <p>{{ text.description }}</p>
      <a :href="issuer.websiteUrl" target="_blank" rel="noopener noreferrer">{{ labels?.website || (locale === 'zh-Hant' ? '造訪簽發者網站' : 'Visit issuer website') }}</a>
    </div>
  </aside>
</template>
<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { isIssuerMetadata, type IssuerMetadata } from './issuer-metadata';
const props = withDefaults(defineProps<{ issuer: IssuerMetadata; locale?: string; labels?: { issuer?: string; website?: string } }>(), { locale: 'en' });
const imageFailed = ref(false);
const content = ref<HTMLElement | null>(null);
const iconSize = ref(56);
const iconStyle = computed(() => ({ width: `${iconSize.value}px`, height: `${iconSize.value}px` }));
let contentObserver: ResizeObserver | undefined;
watch(content, (element) => {
  contentObserver?.disconnect();
  if (!element) return;
  const updateSize = () => { iconSize.value = Math.min(256, element.getBoundingClientRect().height); };
  updateSize();
  if (typeof ResizeObserver !== 'undefined') {
    contentObserver = new ResizeObserver(updateSize);
    contentObserver.observe(element);
  }
}, { flush: 'post' });
onBeforeUnmount(() => contentObserver?.disconnect());
const valid = computed(() => isIssuerMetadata(props.issuer));
const text = computed(() => props.locale === 'zh-Hant' ? props.issuer.localizations['zh-Hant'] : props.issuer);
watch(() => props.issuer.iconUrl, () => { imageFailed.value = false; });
</script>
<style scoped>
.issuer-banner{display:flex;align-items:flex-start;gap:1rem;padding:1rem;border:1px solid #cbd5e1;border-radius:.75rem;color:inherit;background:transparent;max-width:36rem;box-sizing:border-box;font:inherit}
.issuer-banner img,.issuer-banner__fallback{flex:none;max-height:256px;max-width:256px;border-radius:.5rem;object-fit:contain}
.issuer-banner__fallback{display:grid;place-items:center;width:56px;height:56px;background:#e2e8f0;color:#1e293b}
.issuer-banner__content{min-width:0;overflow-wrap:anywhere}.issuer-banner p{margin:.4rem 0;line-height:1.5}.issuer-banner a{color:inherit;text-decoration:underline}.issuer-banner a:focus-visible{outline:2px solid currentColor;outline-offset:3px}
@media(max-width:360px){.issuer-banner{flex-direction:column}}
</style>
