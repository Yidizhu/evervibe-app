# Recommendation repair — 15 October 2026

## Reproduced failure

In Try, the visitor selected Knives Out (2019), the fictional Anya selected Lost
in Translation (2003), and the city was entered as `New York, United States`.
The shared question asked for a cultural place with time to talk. Qloo returned
NYC venues, but its text locality resolved near the centre of New York State.
The application's 15 km validation then rejected the city venues.

## Repair

Explicit NYC aliases now use the existing public NYC centre, country US and
15 km radius for both the insights query and the candidate distance check.
Other cities still use provider locality lookup; device coordinates retain
priority. Closed venues, invalid coordinates, wrong countries and out-of-range
candidates remain excluded. This is a fix for NYC aliases, not a new worldwide
geocoding service.

If a Try planning request has no suitable result or a transient service failure,
the interface offers **Find cultural places** and **Find a film**. Choosing one
expresses the visitor's intent directly and avoids repeating model routing.
The request still needs both Vibes, sharing and EVE participation, a location,
Qloo retrieval and candidate validation. An existing plan cannot be replaced
through this recovery shortcut. The existing final-explanation fallback uses
only verified Qloo candidates when the explanation provider is temporarily
unavailable; it does not invent a venue or an explanation.

## Verification boundaries

The offline suite passes 168 tests. Five added regressions cover the geography
bug and explicit recovery, including failure and participation boundaries.
TypeScript checking and the production build also passed.

A real-provider service rerun with the original films, city and question returned
New Museum and Washington Square Park. The insights request used
`POINT(-74.006 40.7128)`, country US and a 15 km radius. This establishes that
the reproduced filtering failure is repaired for that input; it is not a
recommendation-quality study or a guarantee of external service availability.

The small shared-tag comparison remains documented in `QLOO_COMPARISON.md`.
Do not combine its earlier results with this regression as if they were a
larger controlled experiment.
