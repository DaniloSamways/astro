from __future__ import annotations


DEFAULT_LOCATION = {
    "city": "São Paulo",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "height_m": 760.0,
}

OPEN_METEO_TIMEOUT_SECONDS = 10
IP_GEOLOCATION_TIMEOUT_SECONDS = 10
GEOCODING_TIMEOUT_SECONDS = 10
CELESTRAK_TIMEOUT_SECONDS = 20

PLANET_ALIASES = {
    "mercurio": "mercury",
    "mercúrio": "mercury",
    "venus": "venus",
    "vênus": "venus",
    "terra": "earth",
    "marte": "mars",
    "jupiter": "jupiter",
    "júpiter": "jupiter",
    "saturno": "saturn",
    "urano": "uranus",
    "urânio": "uranus",
    "netuno": "neptune",
    "lua": "moon",
    "sol": "sun",
}

SOLAR_SYSTEM_OBJECTS = [
    "Mercúrio",
    "Vênus",
    "Lua",
    "Marte",
    "Júpiter",
    "Saturno",
    "Urano",
    "Netuno",
]

CATALOG_OBJECTS = [
    "Sirius",
    "Canopus",
    "Arcturus",
    "Vega",
    "Capella",
    "Rigel",
    "Betelgeuse",
    "Aldebaran",
    "Antares",
    "Spica",
    "Procyon",
    "Pollux",
    "Fomalhaut",
    "Achernar",
]
