# Sound-independent access and reading controls

This implementation concerns access to VIANORAE itself. Venue noise levels remain descriptive environmental information; they are not a substitute for making the website understandable without hearing.

The current site contains no audio/video media and no essential audio-only instructions or notifications. Guide instructions, step counts, navigation, sensory levels, confirmation and error messages are written on screen. Messages do not disappear on an automatic timer. The public/demo guide additionally offers a complete text view containing every step, useful note, next instruction, sensory label, arrival information and provenance without images, playback or time limits. Switching back retains the current step. Saved local drafts feed both guide views; this is not a new dataset or translation.

A shared native dialog replaces the footer-only reading settings. Buttons sit at the left edge of the hero/guide image, with header access on other pages. It opens on user request, keeps the background inert and cycles Tab focus within the panel, closes with Escape/close/backdrop, and returns focus to its opener. Text size, spacing and appearance use the existing local preference key; no disability profile is collected. The panel stays within the viewport after resizing and scrolls at enlarged text sizes.

## Requirements for future media

- Prerecorded audio must have an adjacent, complete text transcript.
- Video containing audio must have accurate synchronized captions, including spoken content, meaningful sounds and speaker identification. A transcript alone does not replace captions for video.
- Provide a readable transcript alongside the player and accessible keyboard playback controls. No autoplay or required audio.
- Auto-generated captions require review before publication. Do not label captions as available until they are present and usable.
- Status/error messages must remain visible as text. An optional sound may supplement a visual message but never be its only form.

References: WCAG 2.2 [1.2.1 Audio-only and Video-only](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html) and [1.2.2 Captions](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html). No captioning service or media pipeline is activated by this change.

Automated tests cover EN/RO/DE dialog keyboard focus, Escape and return focus, axe WCAG A/AA rules, viewport resize at 320px with 200% text, complete guide content without media/images, saved-draft use and retained step position. User testing with deaf/hard-of-hearing people and manual assistive-technology review remain part of pilot readiness; the controls do not establish full WCAG conformance.
