# BitBazaar

Online-Marktplatz mit Casino-Element. Nutzer handeln Artikel gegen Credits und
können diese in Slots und Roulette vermehren oder verlieren.

Studienarbeit im Modul Web Engineering, DHBW Stuttgart.

> Alle Credits sind reines Spielgeld. Sie können nicht gekauft, ausgezahlt oder
> in echtes Geld umgetauscht werden.

## Funktionen

- **Konten**: Registrierung und Login, jedes neue Konto startet mit 1000 Credits
- **Marktplatz**: Artikel mit Bild, Beschreibung und Preis einstellen, durchsuchen und kaufen
- **Preisverhandlung**: Käufer schlagen einen eigenen Preis mit Nachricht vor, Verkäufer nehmen an oder lehnen ab
- **Inventar**: gekaufte Artikel ansehen und wieder zum Verkauf anbieten
- **Glücksspiele**: Slots und europäisches Roulette, beide serverseitig berechnet
- **Profil**: Kontostand, Inventar, eigene Anzeigen, gesendete Angebote, Spielhistorie, vollständige Kontobewegungen, Bestenliste
- **Helles und dunkles Theme**

## Technologie

| Teil | Technologie |
|---|---|
| Frontend | Angular 21 |
| Backend | Node.js mit Express (REST API) |
| Datenbank | SQLite über `better-sqlite3` |

## Voraussetzungen

- Node.js 22 oder neuer (`node -v` zum Prüfen)
- npm (kommt mit Node.js)
- Angular CLI: `npm install -g @angular/cli`

## Installation

Repository herunterladen bzw. klonen:

```bash
git clone <repository-url>
cd bitbazaar
```

### 1. Backend

```bash
cd backend
npm install
npm start
```

Das Backend läuft auf **http://localhost:3000**.

Die Datenbank muss nicht eingerichtet werden. Beim ersten Start legt `db.js` die
Datei `casino.db` sowie alle Tabellen automatisch an.

### 2. Frontend

In einem **zweiten** Terminal:

```bash
cd frontend
npm install
ng serve
```

Das Frontend läuft auf **http://localhost:4200**.

Beide Terminals müssen geöffnet bleiben. Ohne laufendes Backend zeigt die
Anwendung keine Daten an.

## Benutzung

1. http://localhost:4200 im Browser öffnen
2. Über "Registrieren" ein Konto anlegen, es startet mit 1000 Credits
3. Unter "Verkaufen" einen Artikel einstellen
4. Für die Handelsfunktionen ein zweites Konto anlegen, zum Beispiel in einem
   privaten Fenster, damit beide Konten gleichzeitig eingeloggt sind

## Datenbank zurücksetzen

Backend stoppen (`Strg + C`), im Ordner `backend` die Datei `casino.db` löschen
und das Backend neu starten. Die Tabellen werden dann neu angelegt.

Wichtig: `CREATE TABLE IF NOT EXISTS` verändert bestehende Tabellen nicht. Nach
einer Änderung am Datenbankschema muss `casino.db` gelöscht werden.

## Projektstruktur

```
backend/
  db.js           Tabellen und die zentrale Funktion changeBalance
  server.js       alle REST-Endpunkte
frontend/
  src/app/services/    api.ts (HTTP), auth.ts (Login), theme.ts (Theme)
  src/app/components/  header, login, register, marketplace, listing-detail,
                       create-listing, profile, slots, roulette
DESIGN.md         Entwurfsentscheidungen und bekannte Schwächen
```

## API-Überblick

```
POST   /api/users                    Registrierung
POST   /api/sessions                 Login
GET    /api/users/:id                Konto
GET    /api/users/:id/inventory      Besitz
GET    /api/users/:id/transactions   Kontobewegungen
GET    /api/users/:id/rounds         Spielhistorie
GET    /api/users/:id/offers         gesendete Angebote

GET    /api/listings                 Marktplatz, optional ?search=
GET    /api/listings/:id             einzelne Anzeige
POST   /api/listings                 Anzeige erstellen
DELETE /api/listings/:id             Anzeige löschen
POST   /api/listings/:id/purchase    Sofortkauf
POST   /api/listings/:id/relist      Besitz wieder anbieten

GET    /api/listings/:id/offers      Angebote auf eine Anzeige
POST   /api/listings/:id/offers      Preis vorschlagen
POST   /api/offers/:id/accept        Angebot annehmen
POST   /api/offers/:id/reject        Angebot ablehnen

POST   /api/rounds                   eine Spielrunde (slots oder roulette)
```

Antwortformat: Erfolg `{ "data": ... }`, Fehler
`{ "error": { "status": 400, "message": "..." } }`.

Ausführliche Begründung der Entwurfsentscheidungen in [DESIGN.md](DESIGN.md).
