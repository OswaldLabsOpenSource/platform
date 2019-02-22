# Oswald Labs Platform

[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m781065098-7bb8bda769f96da5183584a5.svg)](https://status.oswaldlabs.com)

Oswald Labs Platform is a set of open, extensible APIs and SDKs to build apps. This repository contains (some) code that runs on our servers, primarily serving as a wrapper around various APIs and to prevent API key exposion. Most APIs available here are free for public use with rate limits.

## Endpoints

### Platform APIs

| Endpoint | Details | Params |
| - | - | - |
| `GET /screenshot` | Screenshot image | `url` (webpage URL) |
| `GET /reader` | JSON with website content | `url` (webpage URL) |
| `POST /reader` | JSON with website content | `url` (webpage URL) |
| `POST /describe` | JSON with AutoALT | `dataUri` (base 64-encoded image) |

### GDPR

🇪🇺 **Note:** The GDPR export/delete APIs are served through a brute force prevention middleware, so more than a few requests in a short time will slow down the response (resets in 15 minutes).

| Endpoint | Details |
| - | - |
| `GET /agastya/gdpr/export.csv` | Data export CSV file |
| `GET /agastya/gdpr/export/:format` | Data export in JSON/CSV |
| `GET /agastya/gdpr/delete` | JSON number of deleted items |

### Agastya API keys

**Note:** APIs with the 🔒 (lock) emoji require Bearer token-based authentication. You can generate a token by using Oswald Labs Account APIs.

| Endpoint | Details
| - | - |
| `GET /agastya/api-keys` | 🔒 List of your API keys |
| `GET /agastya/api-keys/:apiKey` | 🔒 Configuration of an API key |
| `PATCH /agastya/api-keys/:apiKey` | 🔒 Update configuration of API key |
| `DELETE /agastya/api-keys/:apiKey` | 🔒 Delete an API key |
| `PUT /agastya/api-keys` | 🔒 Create a new API key |

### Oswald Labs Account

| Endpoint | Details
| - | - |
| `GET /auth/details` | 🔒 Returns account details |
| `PATCH /auth/details` | 🔒 Updates account details |
| `POST /auth/login` | Generates a login token |
| `POST /auth/register` | Create a new account |
| `POST /auth/forgot` | Emails a forgot password link |
| `POST /auth/reset` | 🔒 Requests a password reset |

### Subscription management

| Endpoint | Details
| - | - |
| `GET /billing/customer` | 🔒 Returns customer details |
| `GET /billing/plans` | 🔒 Returns list of plans |
| `GET /billing/cards` | 🔒 Returns credit card(s) |
| `PATCH /billing/cards/:cardId` | 🔒 Updates card details |
| `DELETE /billing/cards/:cardId` | 🔒 Deletes credit catd |
| `GET /billing/invoices` | 🔒 Returns customer invoices |
| `GET /billing/subscriptions` | 🔒 Returns customer subscriptions |
| `PUT /billing/subscriptions` | 🔒 Creates new subscription |

## API limits

These APIs are free for public usage with the following rate limits (requests slow down after 500 requests/15 minutes):

| Usage type      | Rate limit          | Total limit             |
|-----------------|---------------------|-------------------------|
| Without API key | 200 requests/minute | No daily/monthly limits |
| GDPR export/delete    | Increasing delay      | Renews in 15 minutes |

When you're using authenticated endpoints, use `/secure/*` instead of `/v1/*` to avoid all rate limits and send your API key as `x-api-key` in the header. API keys are available for free to [Oswald Labs Accelerator](https://oswaldlabs.com/accelerator) startups and our partners. Custom-priced API keys are available for everyone else; [get in touch](https://oswaldlabs.com/contact) to request one.
