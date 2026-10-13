# Third-party notices and asset provenance

Updated 14 October 2026. Project-authored source code and documentation are licensed under the release's **MIT LICENSE**. Generated-asset permission is stated separately in **ASSETS.md**. This inventory does not grant rights the project does not hold or automatically relicense provider data, models, trademarks or music.

## Release framework

The release candidate uses Vinext on Cloudflare Workers. Installed package metadata identifies Vinext 1.0.0-beta.5, Vite 8.0.13, React/React DOM 19.2.6, Next 16.3.4 and the Cloudflare Vite plugin 1.37.1 as MIT-licensed. Wrangler 4.92.0 declares `MIT OR Apache-2.0`. The lockfile records the dependency versions; packages and generated bundles retain their own license notices. This short inventory is not a replacement for individual dependency licenses and does not claim every transitive package has the same license.

## Three.js

The app uses **three 0.180.0**, including its renderer, GLTFLoader, OrbitControls and BufferGeometryUtils. Version and license were checked in the installed package and lockfile. Preserve this notice with redistributed copies:

```text
The MIT License

Copyright © 2010-2025 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

Project: [Three.js](https://threejs.org/). The native Node.js runtime and browser are separately installed tools, not copied provider models.

## Fictional people and photographs

The four couples' images and profile photographs were created with the image-generation tool in Codex from project-authored fictional-adult prompts. They are not photographs of research participants. The local prompt manifest identifies `couple-meet-v2.png`, `couple-date-v2.png`, `couple-repair-v2.png`, `couple-lifetime-v2.png`, `kenji-v2.png`, `anya-v2.png` and `anya-shadow-v1.png`. Other portrait crops are derived from the corresponding generated couple image. No specific image-model version is asserted because the manifest does not record one.

OpenAI's current terms assign its rights, if any, in output to the user to the extent permitted by law, while retaining the user's responsibility for input rights and appropriate use. This is not a guarantee of exclusivity, copyrightability or freedom from third-party claims. [OpenAI Terms of Use, Content](https://openai.com/policies/row-terms-of-use/) (checked 14 October 2026).

The release's `ASSETS.md` grants permission, to the extent the creator holds rights, to copy, display and redistribute the generated assets as part of running, evaluating or adapting EverVibe, with the provenance notice. The images are not labeled CC0, exclusive or necessarily copyrightable. Do not represent the fictional people as real endorsers. The original prompt manifests contain workstation paths and are not included unchanged in the public package.

## Tripo-generated 3D assets

The release's `public/assets/tree.glb` is the generated mature tree used in the fourth story stage. Earlier tree stages, the animated story black box and the rose garden are project-authored procedural graphics. Generated box experiments from development do not replace the animated story box and are not required by the release. Raw task receipts contain temporary download URLs and are excluded.

Generation receipts were checked, and an authenticated billing check verified a successful purchase of API credits before these model generations. The paid-credit basis is therefore confirmed. Billing images, transaction details and account information remain private and are not part of the distributed evidence.

Tripo's developer terms distinguish free and paid users; section 5.2.2 provides output use and distribution rights for paid users, subject to its conditions. The creator's permission for use with EverVibe is stated in `ASSETS.md`. These assets are not CC0 and no third-party rights guarantee is asserted. [Tripo Developer Terms, 5.2](https://developers.tripo3d.ai/en/terms) (checked 14 October 2026; page dated 11 July 2025).

## Qloo and Gemini

Qloo is an external cultural-recommendation service. Gemini is an external language-model service. Neither provider's models, service, catalog or brand is relicensed by the application's source license. API credentials are not included. Cultural titles and entity IDs in the evidence file identify the actual request/result; no bulk provider catalog or media artwork is bundled.

Provider response facts and EVE's generated explanations are distinct. No endorsement by Qloo, Google, OpenAI, Tripo, or a named venue, artist or film is implied. Use of each service remains subject to its applicable account terms.

## Audio: optional video only

There is no BGM or sound-effects package installed in the app. The nine user-provided music files in the private working folder have no verified public-video license in the release evidence and must not be copied into the public package or final video on that basis.

The optional local review film uses user-supplied recordings of First Love, Your Song, A Thousand Years and Perfect. A public-video license for these recordings has not been verified; the film and its music are excluded from this source release. Any externally published film needs an appropriate basis for its actual audio and accurate credits. Unused audio research and editing instructions are not part of the release.

## Release exclusions

Exclude secrets and their screenshots, personal notebooks, billing/account images, raw generation task receipts, internal browser logs, private QA captures with account data, and unlicensed music. Publish only the minimal fictional runtime profiles and sanitized cultural evidence required to understand and run this project.
