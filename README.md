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
