# Bergwetter

Mountain weather, sun and avalanche danger for your own places, on one page. No account, no tracking, no ads.

**Open the app: https://steffiai.github.io/bergwetter/**

![Bergwetter banner](winter.jpg)

## What it does

- **Weather per place:** temperature, sun hours, wind and gusts, new snow, hour by hour and for the coming days
- **Avalanche danger:** danger level, affected aspects and altitudes and avalanche problems for Switzerland, Tyrol, South Tyrol, Trentino, the rest of Austria, Bavaria, northern Italy and Slovenia, whenever the regional service has a bulletin out. For Switzerland also how the danger changed over the last days
- **How reliable is the forecast:** compares several weather models and says how well they agree
- **The last 7 days:** past weather and snow depth, to judge conditions before a tour
- **Equipment tips** that fit the forecast
- **Search** by place, peak, postcode or coordinates, with suggestions while typing
- **Print and share** a compact report
- **Four languages** (German, French, Italian, English) and a choice of units
- **Sun finder** (for supporters): type a start place, pick a travel time, see where the sun shines

Works on phone and computer, and can be added to the home screen.

## Data sources

| Data | Source |
| --- | --- |
| Forecast | MeteoSwiss ICON-CH models via [Open-Meteo](https://open-meteo.com/); outside that area the best model Open-Meteo offers |
| Avalanche bulletin, Switzerland | [WSL Institute for Snow and Avalanche Research SLF](https://www.slf.ch/) |
| Avalanche bulletins, rest of the Alps | the regional warning services of the [EAWS](https://www.avalanches.org/), collected via [avalanche.report](https://avalanche.report/) |
| Place search | Open-Meteo Geocoding, Zippopotam.us, © OpenStreetMap contributors (Nominatim) |

The bulletin and the forecast do not replace your own assessment on site.

## Privacy

Favourites and settings stay in your browser. The app talks only to the data services above and, when a supporter code is entered, to the Bergwetter code server. Details: [privacy page](https://steffiai.github.io/bergwetter/#privacy).

## How it is built

One HTML file with plain JavaScript, no build step and no dependencies.

| Path | Purpose |
| --- | --- |
| `index.html` | the whole app |
| `sw.js`, `manifest.json` | offline use and home-screen install |
| `scripts/`, `.github/workflows/` | scheduled jobs that collect the avalanche bulletins |
| `verlauf/lawinen.json` | daily snapshots for Switzerland (avalanche danger over time) |
| `verlauf/alpen.json` | current bulletins for the rest of the Alps |
| `neu/` | test copy for new features |

Run it locally:

```bash
python -m http.server 8765
# then open http://localhost:8765
```

## Feedback and support

Ideas, bugs and wishes are welcome as [issues](https://github.com/steffiAI/bergwetter/issues). Security problems: see [SECURITY.md](SECURITY.md).

Bergwetter is built and paid for by one person. A crowdfunding campaign is in preparation.

## Licence

No licence has been chosen yet. The code is public to read; please ask before reusing it.

Built by [Stefanie Strasser](https://github.com/steffiAI), mountain rescuer.
