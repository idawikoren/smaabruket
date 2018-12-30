# Nettside for Småbruket studenthytte

https://foreningenbs.no/smaabruket

## Installasjonsinstrukser

```bash
npm install
npm run build
(cd public && python3 -m http.server 3000)

# for dev
npm run dev
```

Data til kalender hentes fra applikasjonen https://github.com/blindern/smaabruket-availability-api

## Endring av bilder

* Thumbs og komprimerte bilder kan genereres med `gen.sh`-scriptet i bilder-mappa.

## Annen nyttig info

* Bildene ligger ikke i Git-repoet pga. størrelsen på dem. Må hentes fra serveren.
