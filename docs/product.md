# GameShelf Product Context

## Product

GameShelf is a game collection management application focused on personal game ownership and progress tracking.

The supplied codebase contains functionality for:

- Game collection management.
- DLC management.
- Game status tracking.
- Playthrough tracking.
- Play-session/time tracking.
- Completion tracking.
- Custom lists.
- Wishlist.
- User profile and settings.
- PSN account integration.
- Steam account integration.
- IGDB game search/metadata.
- SteamGridDB artwork.
- Statistics.
- Authentication.

## Core domain

### Collection

A collection record represents an owned game.

Important concepts include:

- name
- edition
- purchase date
- amount
- artwork
- ownership type
- status
- platform
- provider
- PlayStation versions
- completion count
- DLC count
- archived state
- external IDs

### DLC

DLC is represented as its own record and belongs to a parent collection/game.

DLC has its own:

- name
- purchase information
- artwork
- ownership type
- status
- completion count
- external IDs
- archived state

### Playthrough

A playthrough records a period of playing a game or DLC.

It contains:

- start/end time
- status
- total seconds
- notes
- target Game or DLC
- optional completion association

Play sessions provide granular time records for a playthrough.

### Completion

A completion records a completed Game or DLC.

It contains:

- Game/DLC type
- total playtime
- completion date
- notes
- completion style
- platform
- optional PlayStation version
- target Game or DLC

### Lists

Users can create lists and add collection games to them.

The database prevents adding the same collection game twice to the same list.

## Platforms

Supported platforms:

- PC
- XBOX
- PS

## Providers

Supported providers:

- PSN
- XBOX
- Physical
- Steam
- Epic

## Ownership types

Supported ownership types:

- Bought
- Gift
- Free
- Included
- Rented
- PS+
- Steam Family
- Game Pass

## Collection statuses

Supported statuses:

- Online
- Backlog
- Playing
- On Hold
- Dropped
- Story Completed
- Platinum
- Platinum+
- 100% Completed

## Playthrough statuses

- Active
- On Hold
- Archived
- Completed

## Completion styles

- Speed Run
- Story
- Story + Some Extras
- Story + Lots of Extras
- Completionated
- NG+ Run
- Challenge Run
- Achievement Run

## Product principle

GameShelf should preserve the user's ownership/progress model instead of flattening games, DLCs, playthroughs, and completions into one generic concept.
