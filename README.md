# Oswald Labs Platform

Oswald Labs Platform is a set of open, extensible APIs and SDKs to build apps. This repository contains (some) code that runs on our servers, primarily serving as a wrapper around various APIs and to prevent API key exposion. Most APIs available here are free for public use with rate limits.

## Endpoints

### `GET https://platform.oswaldlabs.com/ip/8.8.8.8`

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

### `GET https://platform.oswaldlabs.com/geocode/52.2090558/6.8687985`

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

### `POST https://platform.oswaldlabs.com/objects`

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

## API limits

These APIs are free for public usage with the following rate limits:

| Usage type      | Rate limit          | Total limit             |
|-----------------|---------------------|-------------------------|
| Without API key | 100 requests/minute | No daily/monthly limits |
| With API key    | 100 requests/second | 1,000,000 monthly limit |

## Privacy

Usage of these APIs is free, and we don't collect any personally identifyable information. We do, however, track metrics using Google Analytics. This helps us scale and understand where/how often the platform is being used. The cookie `_ga` or `oswald_labs_platform` is used by Google Analytics. We also use Cloudflare to cache requests as our CDN, primarily for static resources. Cloudflare uses the `__cfduid` cookie for security; again, no personal information is collected.
