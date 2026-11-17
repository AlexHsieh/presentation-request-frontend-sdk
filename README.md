# Presentation Exchange Vue SDK

## Public issuer information and official card

Fetch public issuer display information without registration, cookies, or API tokens:

```http
GET /api/v1/issuers?did=<URL-encoded-issuer-DID>
```

Use the registry base URL `https://stage.developer.iamhuman.link/appregistry` for stage and `https://developer.iamhuman.link/appregistry` for production. Local PEP uses `http://localhost:8090`. PEP supports the configured I Am Human issuer DID for its deployment; development and stage return `https://stage.iamhuman.link` as the issuer website, and production returns `https://iamhuman.link`.

Success is `{ ok: true, issuer }`. The SDK issuer metadata contains `did`, `name`, `description`, `iconUrl`, `websiteUrl`, `defaultLocale: "en"`, and `localizations["zh-Hant"]` with translated name and description. Additional API fields, including `environment`, are not exposed by the helper. The complete HTTPS Firebase Storage `iconUrl` is authoritative: preserve its path and query parameters. No Firebase package or login is required. Metadata is cached for five minutes; versioned icons are cached for one year.

Missing, repeated, or malformed DID input returns HTTP 400 `INVALID_INPUT`. Unknown and other-environment DIDs return HTTP 404 `ISSUER_NOT_FOUND`. Errors use `{ ok: false, error: { code, message } }`.

### Fetch from either SDK

Both `@iamhuman.link/presentation-exchange-sdk` (server) and `@iamhuman.link/presentation-exchange-vue` (Vue browser) export the same helper and `IssuerMetadata` type:

```ts
import { fetchIssuerMetadata } from '@iamhuman.link/presentation-exchange-vue';

const issuer = await fetchIssuerMetadata({
  did: issuerDid, // the public credential issuer DID
  registryBaseUrl: 'https://stage.developer.iamhuman.link/appregistry',
});
```

Use the backend package import for server-side fetching. The helper returns `null` for `ISSUER_NOT_FOUND`. Catch `IssuerMetadataError` for `INVALID_INPUT`, `FETCH_FAILED` (including timeout or cancellation), and `INVALID_RESPONSE`. Requests time out after five seconds; pass an optional `signal` for cancellation. Apps own loading, retry, and error messages. The registry URL must come from trusted application configuration, not user input.

### Vue card

```ts
import { IssuerBanner } from '@iamhuman.link/presentation-exchange-vue';
import '@iamhuman.link/presentation-exchange-vue/style.css';
```

```vue
<IssuerBanner v-if="issuer" :issuer="issuer" locale="zh-Hant" />
```

Use `locale="en"` for English. Unsupported locales fall back to English. Override interface text through `labels`, with `issuer` and `website` keys. Metadata comes from PEP; the component does not fetch it or make verification decisions.

### Other frameworks and plain HTML

Call the HTTP API directly or render metadata fetched by your server. For example, given validated `issuer` metadata and existing `icon`, `name`, `description`, and `link` DOM elements:

```js
icon.src = issuer.iconUrl;
icon.alt = '';
name.textContent = issuer.name;
description.textContent = issuer.description;
link.href = issuer.websiteUrl;
link.textContent = 'Visit issuer website';
link.target = '_blank';
link.rel = 'noopener noreferrer';
```

Validate HTTPS image/link URLs before using raw HTTP responses. Render text through `textContent`, never `innerHTML`. Hide failed icons and keep the issuer name visible. For Traditional Chinese, use `issuer.localizations['zh-Hant']` with the English values as fallback.

Allow your configured PEP origin in `connect-src` and `https://firebasestorage.googleapis.com` in `img-src`. Also allow the storage origin in `connect-src` if downloading image bytes with `fetch`; this requires Storage CORS. Displaying the URL in an image element lets the browser retrieve it directly.

Issuer metadata and the banner are public display information. They do not prove that an app or person has been verified. Keep credential signatures, trusted issuer policy, status checks, and authorization on the backend. Direct requests expose ordinary network information to PEP and Storage; use backend fetching where appropriate. Never send signing secrets or credential JWTs to this API.
