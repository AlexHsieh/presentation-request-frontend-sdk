<template>
  <section class="presentation-request-qr" :aria-busy="busy || undefined">
    <div v-if="pdUrl" class="presentation-request-qr__code">
      <QrcodeVue
        :value="qrValue"
        :size="size"
        :class="qrClass"
      />
    </div>
    <a
      v-if="pdUrl && linkLabel"
      :href="walletUrl"
      target="_blank"
      rel="noopener noreferrer"
      :class="linkClass"
    >
      {{ linkLabel }}
    </a>
    <p v-if="countdownLabel" :class="countdownClass">{{ countdownLabel }}</p>
    <p v-if="statusLabel" :class="statusClass">{{ statusLabel }}</p>
    <div v-if="refreshLabel || checkStatusLabel" :class="actionsClass">
      <button
        v-if="refreshLabel"
        type="button"
        :class="buttonClass"
        :disabled="busy"
        @click="$emit('refresh')"
      >
        {{ refreshLabel }}
      </button>
      <button
        v-if="checkStatusLabel"
        type="button"
        :class="buttonClass"
        :disabled="busy"
        @click="$emit('check-status')"
      >
        {{ checkStatusLabel }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { buildPresentationRequestUrl } from './helpers';

const props = withDefaults(
  defineProps<{
    pdUrl: string;
    returnUrl?: string | null;
    walletBaseUrl?: string;
    expiresAt?: string | null;
    size?: number;
    linkLabel?: string;
    expiredLabel?: string;
    expiresInLabel?: (seconds: number) => string;
    statusLabel?: string;
    refreshLabel?: string;
    checkStatusLabel?: string;
    busy?: boolean;
    qrClass?: string;
    linkClass?: string;
    countdownClass?: string;
    statusClass?: string;
    actionsClass?: string;
    buttonClass?: string;
    qrValueMode?: 'wallet' | 'pd';
  }>(),
  {
    returnUrl: null,
    walletBaseUrl: undefined,
    expiresAt: null,
    size: 200,
    linkLabel: '',
    expiredLabel: 'Expired',
    expiresInLabel: undefined,
    statusLabel: '',
    refreshLabel: '',
    checkStatusLabel: '',
    busy: false,
    qrClass: '',
    linkClass: '',
    countdownClass: '',
    statusClass: '',
    actionsClass: '',
    buttonClass: '',
    qrValueMode: 'wallet',
  },
);

defineEmits<{
  refresh: [];
  'check-status': [];
}>();

const remainingMs = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const walletUrl = computed(() =>
  buildPresentationRequestUrl({
    pdUrl: props.pdUrl,
    returnUrl: props.returnUrl,
    walletBaseUrl: props.walletBaseUrl,
  }),
);

const qrValue = computed(() => (props.qrValueMode === 'pd' ? props.pdUrl : walletUrl.value));
const linkLabel = computed(() => props.linkLabel.trim());
const refreshLabel = computed(() => props.refreshLabel.trim());
const checkStatusLabel = computed(() => props.checkStatusLabel.trim());

const countdownLabel = computed(() => {
  if (!props.expiresAt) return '';
  if (remainingMs.value <= 0) return props.expiredLabel;
  const seconds = Math.floor(remainingMs.value / 1000);
  return props.expiresInLabel ? props.expiresInLabel(seconds) : `${seconds}s`;
});

function updateCountdown() {
  if (!props.expiresAt) {
    remainingMs.value = 0;
    return;
  }
  const expiry = new Date(props.expiresAt).getTime();
  remainingMs.value = Number.isNaN(expiry) ? 0 : Math.max(0, expiry - Date.now());
  if (remainingMs.value <= 0) {
    stopCountdown();
  }
}

function startCountdown() {
  stopCountdown();
  updateCountdown();
  if (!props.expiresAt || remainingMs.value <= 0) return;
  countdownTimer = setInterval(updateCountdown, 1000);
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

watch(() => props.expiresAt, startCountdown, { immediate: true });
onBeforeUnmount(stopCountdown);
</script>
