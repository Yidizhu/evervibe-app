# How shared taste changes a query

Checked on 14 October 2026 (New Zealand time). These are live API observations, separate from the release's 112 offline automated checks. No user-outcome study or LLM-only benchmark has been performed.

## Two inputs, then a shared signal

The visitor Try route resolves selections through Qloo `/search`, then sends separate groups to `GET /v2/analysis/compare`:

- `a.signal.interests.entities`: `E12149D8-3108-4019-8881-3F932AB67D38` — Knives Out (2019).
- `b.signal.interests.entities`: `B7A0731F-EC92-496A-9C40-47D9770489B6` — Amélie (2001).

The hackathon endpoint returned HTTP 200. Its `results.tags` contained these first three shared themes:

| Theme | Provider tag ID |
| --- | --- |
| Comedy | `urn:tag:genre:media:comedy` |
| Stylized | `urn:tag:style:qloo:stylized` |
| Eccentric | `urn:tag:character:qloo:eccentric` |

These describe selected cultural entities. They are not personality diagnoses, romantic compatibility scores or evidence of mutual feelings. The app displays at most three valid themes, discards scores, and sends no personal notes or transcript to Qloo.

## Controlled insights comparison

Two live `/v2/insights` requests used the same two movie IDs, New York coordinates `POINT(-74.006 40.7128)`, a 15 km radius, US country filter, `take=6`, and a union of museum, art-gallery, movie-theater and tourist-attraction tags. The second request added only the three compare tags as `signal.interests.tags`.

Both requests returned HTTP 200. These are raw provider candidates before the app's category/location validation and EVE selection:

| Position | Entity IDs only | Same IDs plus shared compare tags |
| --- | --- | --- |
| 1 | Little Italy | Comedy Cellar |
| 2 | Top of The Rock | Smallpox Memorial Hospital |
| 3 | Strawberry Fields | Museum of the Moving Image |
| 4 | Strawberry Fields (a different entity ID) | Sheep Meadow |
| 5 | Empire State Building | Ear Inn |
| 6 | Chrysler Building | Chrysler Building |

Five of six candidate IDs changed. This establishes that compare tags affected this query. It does not establish that every candidate is suitable, that results are stable over time, or that the new ordering is better. Venue availability and facilities still require checking. The same flow in the app retains the selected entities, validates candidates and constrains EVE to the returned records.

## Earlier control retained

An earlier New York story request used Knives Out, Amélie and Nina Simone. EVE selected Tenement Museum and Whitney Museum of American Art from Qloo's candidates. Removing Nina Simone returned the same first six candidates in the same order. That observation remains valid for that request; adding a signal does not guarantee a changed ranking. The new experiment tests shared compare tags, a different intervention.

## Scope and resilience

Compare is integrated into both visitor Try and authored-story planning. Each story film is attributed to its owner; additional verified artists retain their profile ownership. Shared themes are cached in the service instance for 15 minutes and identified as saved or recent comparisons when reused. Both entity groups form the cache key. Changed visitor Vibes require a new session start and comparison. Empty results remain empty; compare failures are explicit and briefly cached, with entity-based plans still available when insights works. Cancelling sharing clears the displayed comparison and stops pending requests.

The updated New York video records Chloe's Knives Out and Sarah's Amélie plus Nina Simone. The story card shows Comedy, Stylized and Eccentric from Qloo. Those tags enter the story's insights request; EVE offers Museum of the Moving Image and La MaMa Experimental Theatre Club from the returned candidates. Both people separately confirm the museum and later choose their own words for the shared memory. These are fictional participants operating the real application, not user-study evidence.

The final EVE explanation is instructed to name a selected cultural work or artist from each person and a returned shared theme. That prose is an interpretation, not an additional Qloo fact. In Try, a transient failure during this explanation stage returns verified Qloo choices without invented explanations; an initial routing failure still requires retrying.

The public repository is a clean product release history. Development notes, credentials, internal evaluation documents and preparation materials are excluded.

Reference: [Qloo's official compare documentation](https://github.com/qloo/docs-public/blob/main/reference/analysis-compare.md).
