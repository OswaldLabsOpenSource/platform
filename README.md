# Oswald Labs Platform

[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m781065098-7bb8bda769f96da5183584a5.svg)](https://status.oswaldlabs.com)
![Travis (.org)](https://img.shields.io/travis/OswaldLabsOpenSource/platform.svg)
[![Codacy coverage](https://img.shields.io/codacy/coverage/e835f8f5b99d474cbf2e065806581b67.svg)](https://app.codacy.com/project/AnandChowdhary/platform/dashboard?branchId=9094438)

Oswald Labs Platform is a set of open, extensible APIs and SDKs to build apps. This repository contains (some) code that runs on our servers, primarily serving as a wrapper around various APIs and to prevent API key exposion. Most APIs available here are free for public use with rate limits.

## Endpoints

### `GET https://platform.oswaldlabs.com/v1/ip/8.8.8.8`

Send an IP address to get its location and organizational information:

```json
{
    "ip": "8.8.8.8",
    "hostname": "google-public-dns-a.google.com",
    "city": "Mountain View",
    "region": "California",
    "country": "US",
    "loc": "37.3860,-122.0840",
    "postal": "94035",
    "phone": "650",
    "org": "AS15169 Google LLC"
}
```

### `GET https://platform.oswaldlabs.com/v1/geocode/52.2090558/6.8687985`

Send GPS cordinates for reverse geocoding, i.e. name in words:

```json
{
    "results": [
        {
            "address_components": [],
            "formatted_address": "Wicher Nijkampstraat 81, 7545 XP Enschede, Netherlands",
            "place_id": "ChIJH8AwmZwTuEcR3kVAYbdSKW4",
            "plus_code": {
                "compound_code": "6V59+MF Enschede, Netherlands",
                "global_code": "9F486V59+MF"
            }
        }
    ]
}
```

### `POST https://platform.oswaldlabs.com/v1/objects`

Send an image (data URI as JSON body param `dataUri`) to get object detection tags with accuracy:

```json
{
    "labels": [
        {
            "Name": "Campus",
            "Confidence": 70.03408813476562
        },
        {
            "Name": "Architecture",
            "Confidence": 69.32366180419922
        },
        {
            "Name": "Building",
            "Confidence": 69.32366180419922
        }
    ]
}
```

### `GET https://platform.oswaldlabs.com/v1/translate/fr/Hello`

Send a string to translate it to another language.

```json
{
    "translatedText": "Bonjour",
    "detectedSourceLanguage": "en",
    "originalText": "Hello"
}
```

### `GET https://platform.oswaldlabs.com/v1/reader/https%3A%2F%2Fexample.com`

Send a webpage/article URL to get its main content/reader view

```json
{
    "title": "Example Domain",
    "author": null,
    "date_published": null,
    "dek": null,
    "lead_image_url": null,
    "content": "<div> <p>This domain is established....</p> </div>",
    "next_page_url": null,
    "url": "https://example.com",
    "domain": "example.com",
    "excerpt": "This domain is established to be used for...",
    "word_count": 28,
    "direction": "ltr",
    "total_pages": 1,
    "rendered_pages": 1
}
```

## API limits

These APIs are free for public usage with the following rate limits (requests slow down after 500 requests/15 minutes):

| Usage type      | Rate limit          | Total limit             |
|-----------------|---------------------|-------------------------|
| Without API key | 100 requests/minute | No daily/monthly limits |
| With API key    | No rate limits      | 1,000,000 monthly limit |

When you're using authenticated endpoints, use `/secure/*` instead of `/v1/*` to avoid all rate limits and send your API key as `x-api-key` in the header. API keys are available for free to [Oswald Labs Accelerator](https://oswaldlabs.com/accelerator) startups and our partners. Custom-priced API keys are available for everyone else; [get in touch](https://oswaldlabs.com/contact) to request one.

## Privacy

Usage of these APIs is free, and we don't collect any personally identifiable information. We do, however, track metrics using Google Analytics. This helps us scale and understand where/how often the platform is being used. The cookie `_ga` or `oswald_labs_platform` is used by Google Analytics. We also use Cloudflare to cache requests as our CDN, primarily for static resources. Cloudflare uses the `__cfduid` cookie for security; again, no personal information is collected.
