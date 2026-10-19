# GameShelf Domain Rules

This document is intentionally explicit. These rules should not be changed accidentally during implementation.

## Platform/provider

Allowed platforms:

```text
PC
XBOX
PS
```

Allowed providers:

```text
PSN
XBOX
Physical
Steam
Epic
```

Allowed combinations:

```text
PS   → PSN | Physical
PC   → Steam | Epic
XBOX → XBOX | Physical
```

## PlayStation versions

Allowed versions:

```text
PS5
PS4
PS3
PS2
PS1
```

A PS collection requires at least one PS version.

A non-PS collection must have an empty PS version array.

For completions:

```text
PS → PSVersion required
non-PS → PSVersion null
```

## NP communication IDs

Collection trophy IDs are represented as a JSON object.

Allowed keys:

```text
PS3
PS4
PS5
```

The keys must correspond to versions actually owned by the collection.

Non-PS collections cannot have these IDs.

Values must follow the enforced NPWR format.

## Game vs DLC

`GameType` is:

```text
Game
DLC
```

A completion targets exactly one:

```text
Game → collectionId
DLC  → dlcId
```

A playthrough follows the same rule.

Do not make both foreign keys populated.

## Collection vs DLC

A DLC belongs to one collection.

Deleting the parent collection cascades to its DLC.

## Playthrough

Allowed statuses:

```text
Active
On Hold
Archived
Completed
```

A playthrough can reference a completion.

If the completion is deleted, the playthrough keeps its record and its completion reference becomes null.

## Completion

Completion styles:

```text
Speed Run
Story
Story + Some Extras
Story + Lots of Extras
Completionated
NG+ Run
Challenge Run
Achievement Run
```

## Collection status

```text
Online
Backlog
Playing
On Hold
Dropped
Story Completed
Platinum
Platinum+
100% Completed
```

## Ownership

```text
Bought
Gift
Free
Included
Rented
PS+
Steam Family
Game Pass
```

## Lists

A list belongs to a user.

A list item connects:

```text
list → collection
```

The same collection game cannot occur twice in one list.

## User ownership

Collection, DLC, completion, playthrough, list, and play-session records are user-scoped.

When implementing resource access, preserve the user ownership model.

## Archived

Collection and DLC records have an `archived` flag.

Archiving is a state operation, not deletion.

Do not silently treat archive and delete as interchangeable.

## Time

Playthrough total time is stored as `totalSeconds`.

Individual play sessions store `secondsPlayed`.

Completion stores `totalPlaytime` as an integer.

Do not change units without checking all consumers.
