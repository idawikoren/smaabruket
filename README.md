# Nettside for Småbruket studenthytte

## Installasjonsinstrukser
1. Hent fra git
2. Installer Node-avhengigheter (globale pakker): `$ sudo npm install -g bower grunt-cli`
3. Installer Node-avhengigheter (normale pakker): `$ npm install`

Opprett filen 'app/url.txt' som har lenke til JSON-data til regnearket. Kun lenken skal ligge i filen, og se ca. slik ut:
`https://spreadsheets.google.com/feeds/cells/xxxxx/xxxx/public/basic?alt=json&max-col=10`

## Oppdatere
1. Oppdater assets: `$ bower install`
2. Lag nye statiske filer: `$ grunt`

## Endring av bilder
* Thumbs og komprimerte bilder kan genereres med `gen.sh`-scriptet i bilder-mappa. Bilder legges i `info.txt`-filen for å komme opp i bildegalleriet.

## Annen nyttig info
* Foundation brukes som CSS-rammeverk. jQuery for JS.
* Bildene ligger ikke i Git-repoet pga. størrelsen på dem. Må hentes fra serveren.