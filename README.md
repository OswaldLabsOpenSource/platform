# Oswald Labs Platform

[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m781065098-7bb8bda769f96da5183584a5.svg)](https://status.oswaldlabs.com)

Oswald Labs Platform is a set of open, extensible APIs and SDKs to build apps. This repository contains (some) code that runs on our servers, primarily serving as a wrapper around various APIs and to prevent API key exposion. Most APIs available here are free for public use with rate limits.

## API limits

These APIs are free for public usage with the following rate limits (requests slow down after 500 requests/15 minutes):

| Usage type      | Rate limit          | Total limit             |
|-----------------|---------------------|-------------------------|
| Without API key | 100 requests/minute | No daily/monthly limits |
| With API key    | No rate limits      | 1,000,000 monthly limit |

When you're using authenticated endpoints, use `/secure/*` instead of `/v1/*` to avoid all rate limits and send your API key as `x-api-key` in the header. API keys are available for free to [Oswald Labs Accelerator](https://oswaldlabs.com/accelerator) startups and our partners. Custom-priced API keys are available for everyone else; [get in touch](https://oswaldlabs.com/contact) to request one.
