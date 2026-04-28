# Bear Hill Studios — Copy Deck

> **How this works**
> Every field maps to a specific HTML element via a CSS selector shown in `[brackets]`.
> Edit any value, then tell Claude "apply the copy deck" — it will locate the exact
> element using the selector and update the text.
>
> **Selector format:**
> - `[#sec-intro p.eyebrow]` → the `<p class="eyebrow">` inside `<section id="sec-intro">`
> - For repeating items (projects, reels etc.) the `####` header gives the container;
>   each field selector is relative to that container
> - `attr:` prefix means an HTML attribute, e.g. `attr:data-label`
> - `[page-title]` means the `<title>` tag in `<head>`
>
> **Rules for editing:**
> - Change only the text after the colon on `key [selector]: value` lines
> - Multi-line body copy: keep it on the same line (wrap in your editor is fine)
> - Lists: add, remove or reorder `- ` items freely
> - Don't rename keys, selectors, or section headers — Claude uses these as anchors
> - Mark uncertain copy `[DRAFT]` or questions `[TODO: ...]` — Claude will flag these

---

## GLOBAL — shared across all pages

### Nav
```
nav .nav-cta                → Get in touch  (link text, all pages)
```
cta_label [nav .nav-cta]: Get in touch
cta_href [nav .nav-cta attr:href]: contact.html

### Footer
```
footer .footer-note (first) → studio name + location chip
footer .footer-note (last)  → copyright line
```
location_chip [footer .footer-logo .footer-note]: Bear Hill Studios · Bath, UK
copyright [footer p.footer-note]: © 2026 Bear Hill Studios. All rights reserved.

---

## PAGE: Home — index.html

### Hero  [section.hero]
eyebrow [.hero-est]: Bear Hill Studios — Est. 2026
quote [h1.hero-quote]: "Some chord in unison with what we hear is touch'd within us, and the heart replies."
quote_attr [p.hero-attr]: — William Cowper
strapline [p.hero-strapline]: Immersive audiobooks and production.
player_label [[data-player="hero-sample"] attr:data-label]: HEAR THE WORK
player_note [span.hero-player-note]: An immersive sample — hear what Bear Hill sounds like

### Intro  [#sec-intro]
eyebrow [#sec-intro p.eyebrow]: The studio
body_1 [#sec-intro p.intro-text:first-of-type]: Laura Cox and Dave Cox are a husband-and-wife creative studio based in Bath. Laura is a voice artist and audiobook narrator. Dave is a sound and interaction designer.
body_2 [#sec-intro p.intro-text:last-of-type]: We work end-to-end on immersive productions, or we step in at any point. Every project is owned by the two of us.

### Featured Work  [#sec-featured]
eyebrow [#sec-featured p.eyebrow]: Featured work
heading [#sec-featured h2.heading]: Immersive audiobooks.
link_label [#sec-featured a.team-link]: See all work →
link_href [#sec-featured a.team-link attr:href]: work.html

#### Featured Item 1  [#sec-featured .feat-card:nth-child(1)]
tag [.pill]: Immersive Audiobook
title [.feat-title]: The Velveteen Rabbit
meta [.feat-year]: Margery Williams · Audible, 2023
image_src [img attr:src]: assets/VR Cover 3000x3000.png
image_alt [img attr:alt]: The Velveteen Rabbit

#### Featured Item 2  [#sec-featured .feat-card:nth-child(2)]
tag [.pill]: Immersive Audiobook
title [.feat-title]: Millions of Cats and Stars
meta [.feat-year]: Audible, 2024
image_src [img attr:src]: assets/TTNBC Cover 3000x3000.jpg
image_alt [img attr:alt]: Millions of Cats and Stars

### Team  [#sec-team]
eyebrow [#sec-team p.eyebrow]: The team
heading [#sec-team h2.heading]: Two people. One studio.

#### Team Member 1 — Laura  [#sec-team .team-card:nth-child(1)]
name [.team-name]: Laura Cox
role [.team-role]: Voice Artist & Narrator
bio [.team-bio]: Trained at the Bristol Old Vic Theatre School. Additional voices on Chicken Run (Aardman). BBC Studios Natural History, BBC Radio 4. Speech and language therapist specialising in voice.
link_label [a.team-link]: Laura's page →
link_href [a.team-link attr:href]: laura.html

#### Team Member 2 — Dave  [#sec-team .team-card:nth-child(2)]
name [.team-name]: Dave Cox
role [.team-role]: Sound & Interaction Designer
bio [.team-bio]: Co-founded Lean Mean Fighting Machine (sold to M&C Saatchi). Product Director at Melody VR. Nearly 30 years as a creative, technologist and interactive designer.
link_label [a.team-link]: Our work →
link_href [a.team-link attr:href]: work.html

### Testimonial  [#sec-testimonial]
quote [#sec-testimonial blockquote]: "Laura and Dave bring a rare combination of voice craft and sonic world-building. The result is genuinely immersive — you don't just hear the story, you're inside it."
cite [#sec-testimonial cite]: Kevin Moss — Important Small Things

### CTA Band  [#sec-cta]
title [#sec-cta h2.cta-title]: Ready to make something?
body [#sec-cta p.cta-body]: Whether you need an end-to-end immersive production, narration and production, or Laura's voice for your own project — we'd like to hear from you.
button_label [#sec-cta a.btn]: Get in touch
button_href [#sec-cta a.btn attr:href]: contact.html

---

## PAGE: Work — work.html

### Page Header  [#page-head]
page_title [page-title]: Work — Bear Hill Studios
eyebrow [#page-head p.eyebrow]: What we've made
h1 [#page-head h1]: The work.
sub [#page-head p.sub]: Immersive audiobooks, ambient sound design, interactive audio. Everything listed here is something we're proud of.

### Immersive Audiobooks  [#sec-audiobooks]
eyebrow [#sec-audiobooks p.eyebrow]: Immersive Audiobooks
heading [#sec-audiobooks h2.heading]: Stories with a world inside them.

#### Project 1 — Millions of Cats and Stars  [#sec-audiobooks .project-row:nth-child(1)]
tag [.proj-tag]: Immersive audiobook · 2024
title [.proj-title]: Millions of Cats and Stars
desc [.proj-desc]: An immersive retelling of Wanda Gág's classic — spatial sound design, original score elements and full narration.
credits:
  - [.pill:nth-child(1)] Laura Cox — narrator
  - [.pill:nth-child(2)] Dave Cox — sound design
  - [.pill:nth-child(3)] Audible · 2024
youtube_id [[data-yt] attr:data-yt]: -mW5If3EqFQ
youtube_label [.yt-link]: Watch on YouTube ↗

#### Project 2 — The Velveteen Rabbit  [#sec-audiobooks .project-row:nth-child(2)]
tag [.proj-tag]: Immersive audiobook · 2023
title [.proj-title]: The Velveteen Rabbit
desc [.proj-desc]: Margery Williams' beloved story, brought to life with intimate narration and layered environmental audio.
credits:
  - [.pill:nth-child(1)] Laura Cox — narrator
  - [.pill:nth-child(2)] Dave Cox — sound design
  - [.pill:nth-child(3)] Audible · 2023
player_label [.player-unit-label]: Immersive sample

#### Project 3 — 'Twas the Night Before Christmas  [#sec-audiobooks .project-row:nth-child(3)]
tag [.proj-tag]: Immersive audiobook · 2023
title [.proj-title]: 'Twas the Night Before Christmas
desc [.proj-desc]: Clement Clarke Moore's classic poem — every creak, sleigh bell and crunching snowstep placed in space.
credits:
  - [.pill:nth-child(1)] Laura Cox — narrator
  - [.pill:nth-child(2)] Dave Cox — sound design
  - [.pill:nth-child(3)] Audible · 2023
player_label [.player-unit-label]: Immersive sample

#### Project 4 — Untitled Thriller  [#sec-audiobooks .project-row:nth-child(4)]
tag [.proj-tag]: Narration · in progress
title [.proj-title]: Untitled thriller
desc [.proj-desc]: Straight narration for ACX. Laura performing, Dave producing. No sample available until published.
credits:
  - [.pill:nth-child(1)] Laura Cox — narrator
  - [.pill:nth-child(2)] Dave Cox — producer
  - [.pill:nth-child(3)] ACX

### Beyond the Book  [#sec-beyond]
eyebrow [#sec-beyond p.eyebrow]: Beyond the Book
heading [#sec-beyond h2.heading]: Audio that goes elsewhere.
intro [#sec-beyond p.body-text]: Not everything we make is an audiobook. These pieces show range — listed here honestly, without overstatement.

#### Project 5 — Sleep Soundscape  [#sec-beyond .project-row:nth-child(1)]
tag [.proj-tag]: Ambient · YouTube
title [.proj-title]: Sleep Soundscape — Forest at Night
desc [.proj-desc]: An hour-long immersive ambient piece with original sound design and visual accompaniment. Designed as craft, not content.
credits:
  - [.pill:nth-child(1)] Dave Cox — sound design
  - [.pill:nth-child(2)] YouTube
player_label [.player-unit-label]: Excerpt

#### Project 6 — Catmasonic  [#sec-beyond .project-row:nth-child(2)]
tag [.proj-tag]: Voice · Interactive · Wellbeing
title [.proj-title]: Catmasonic — Important Small Things
desc [.proj-desc]: Voice production for an interactive wellbeing app. An ongoing relationship with the team behind Melody VR.
credits:
  - [.pill:nth-child(1)] Laura Cox — voice
  - [.pill:nth-child(2)] Bear Hill Studios — production
  - [.pill:nth-child(3)] Important Small Things
player_label [.player-unit-label]: Excerpt

### CTA Band  [#sec-cta]
title [#sec-cta h2.cta-title]: Want to make something together?
body [#sec-cta p.cta-body]: We're open to projects at every point of the spectrum — from full immersive production to narration only.
button_label [#sec-cta a.btn]: Get in touch
button_href [#sec-cta a.btn attr:href]: contact.html

---

## PAGE: Laura — laura.html

### Page Header  [#page-head]
page_title [page-title]: Laura — Bear Hill Studios
eyebrow [#page-head p.eyebrow]: Voice artist & narrator
h1 [#page-head h1]: Laura Cox.
sub [#page-head p.sub]: Bristol Old Vic trained. Aardman. BBC. A voice that carries precision, warmth and decades of craft.

### Intro  [#sec-intro]
name [#sec-intro h1]: Laura Cox
tagline [#sec-intro p:nth-of-type(1)]: Voice artist · audiobook narrator · Bath, UK
bio [#sec-intro p:nth-of-type(2)]: A warm, natural British voice for audiobooks, narration, characters and commercials. Trained at the Bristol Old Vic Theatre School, with credits ranging from Aardman to the BBC.
studio_note [#sec-intro .studio-note]: Part of Bear Hill Studios — also available as voice talent for independent productions.

### Voice Reels  [#sec-reels]
eyebrow [#sec-reels p.eyebrow]: Voice Reels
heading [#sec-reels h2.heading]: Hear what Laura does.
intro [#sec-reels p.body-text]: Four clean reels — no effects underneath, no production covering anything up. What you hear is the voice.

#### Reel 1 — Narration  [#sec-reels .reel-item:nth-child(1)]
label [.player-unit-label]: Narration — warm, natural, friendly
note [.reel-item-note]: Wildlife, documentary, reality — clean, no effects

#### Reel 2 — Audiobook  [#sec-reels .reel-item:nth-child(2)]
label [.player-unit-label]: Audiobook — fiction excerpt
note [.reel-item-note]: Character range, pacing, tone variety

#### Reel 3 — Technical  [#sec-reels .reel-item:nth-child(3)]
label [.player-unit-label]: Technical — medical, precise, authoritative

#### Reel 4 — Commercial  [#sec-reels .reel-item:nth-child(4)]
label [.player-unit-label]: Commercial — upbeat, relatable

### Credits  [#sec-credits]
eyebrow [#sec-credits p.eyebrow]: Credits
heading [#sec-credits h2.heading]: Where the work has taken her.

#### Credit 1 — Chicken Run  [#sec-credits .credit-v2:nth-child(1)]
title [.credit-v2-title]: Chicken Run
sub [.credit-v2-sub]: Additional voices · guide tracks for Julia Sawalha & Jane Horrocks
badge [.credit-v2-badge]: Aardman · Nick Park & Peter Lord
cat [.credit-v2-cat]: Film

#### Credit 2 — Wildlife Docs  [#sec-credits .credit-v2:nth-child(2)]
title [.credit-v2-title]: Wildlife documentaries
sub [.credit-v2-sub]: Narration
badge [.credit-v2-badge]: BBC Studios Natural History
cat [.credit-v2-cat]: TV · BBC

#### Credit 3 — BBC Radio 4  [#sec-credits .credit-v2:nth-child(3)]
title [.credit-v2-title]: BBC Radio 4 plays
sub [.credit-v2-sub]: Various
cat [.credit-v2-cat]: Radio · BBC

#### Credit 4 — London 2012  [#sec-credits .credit-v2:nth-child(4)]
title [.credit-v2-title]: London 2012 Olympic cable car
sub [.credit-v2-sub]: Announcement voice
cat [.credit-v2-cat]: Live event

#### Credit 5 — Bear Hill Audiobooks  [#sec-credits .credit-v2:nth-child(5)]
title [.credit-v2-title]: Bear Hill Studios audiobooks
sub [.credit-v2-sub]: Narrator · The Velveteen Rabbit (2023), 'Twas the Night Before Christmas (2023), Millions of Cats and Stars (2024)
cat [.credit-v2-cat]: Bear Hill

### About Laura  [#sec-about]
eyebrow [#sec-about p.eyebrow]: About Laura
heading [#sec-about h2.heading]: Voice is a discipline.
body_1 [#sec-about p.body-text:first-of-type]: Laura trained at the Bristol Old Vic Theatre School — one of the most rigorous actor training programmes in the UK. That foundation shows in every recording: the voice is not performed over, it's inhabited.
body_2 [#sec-about p.body-text:last-of-type]: Alongside her voice work, Laura is a speech and language therapist specialising in voice therapy. She understands the instrument — technically, physically, clinically. It's a differentiating detail that explains her precision and longevity.

### Testimonial  [#sec-testimonial]
quote [#sec-testimonial blockquote]: "Having worked with Laura before we knew her voice would elevate the whole app, and it did — it made it so much better. Delivered on time and on budget."
cite [#sec-testimonial cite]: — Kevin Moss, Important Small Things

### Work with Laura  [#sec-booking]
eyebrow [#sec-booking p.eyebrow]: Work with Laura
heading [#sec-booking h2.heading]: Two ways to book.
intro [#sec-booking p.body-text]: Available as voice talent for independent productions. Or as part of Bear Hill Studios with Dave producing.

#### Booking Option 1  [#sec-booking .booking-card:nth-child(1)]
num [.booking-num]: 01
title [.booking-title]: With Bear Hill Studios
desc [.booking-desc]: Laura narrating, Dave producing. You get both of us — the voice and the world around it. End-to-end immersive production, or narration and production together.
button_label [a.btn]: Get in touch
button_href [a.btn attr:href]: contact.html

#### Booking Option 2  [#sec-booking .booking-card:nth-child(2)]
num [.booking-num]: 02
title [.booking-title]: Voice talent only
desc [.booking-desc]: Laura available for your production — publishers or producers with their own setup who want her voice. Clean recording, professionally delivered, on your timeline.
button_label [a.btn]: Book Laura
button_href [a.btn attr:href]: contact.html

---

## PAGE: About — about.html

### Page Header  [#page-head]
page_title [page-title]: About — Bear Hill Studios
eyebrow [#page-head p.eyebrow]: The studio
h1 [#page-head h1]: About.
sub [#page-head p.sub]: A husband-and-wife creative studio based in Bath. Voice, sound and story — owned end-to-end.

### Pull Quote  [#sec-pull-quote]
quote [#sec-pull-quote blockquote]: "A common theme in our work has been immersion — whether it's animation, VR or telling stories, it all comes from the same sense of suspending reality."
attr [#sec-pull-quote p.pull-attr]: Dave Cox — Bear Hill Studios

### People  [#sec-people]
eyebrow [#sec-people p.eyebrow]: The people
heading [#sec-people h2.heading]: Laura & Dave.

#### Bio — Laura  [#sec-people .bio-card:nth-child(1)]
name [.bio-name]: Laura Cox
role [.bio-role]: Voice Artist & Narrator
bio [.bio-text]: Trained at the Bristol Old Vic Theatre School. A voice career spanning feature film, documentary, radio drama and audiobook narration. Also a practising speech and language therapist specialising in voice — bringing clinical precision to every performance.
credits:
  - [.cred-item:nth-child(1)] Chicken Run — Aardman (Nick Park, Peter Lord)
  - [.cred-item:nth-child(2)] BBC Studios Natural History — wildlife documentary
  - [.cred-item:nth-child(3)] BBC Radio 4 — plays and drama
  - [.cred-item:nth-child(4)] London 2012 Olympics — cable car announcement voice
  - [.cred-item:nth-child(5)] Bristol Old Vic Theatre School — trained

#### Bio — Dave  [#sec-people .bio-card:nth-child(2)]
name [.bio-name]: Dave Cox
role [.bio-role]: Sound & Interaction Designer
bio [.bio-text]: Nearly 30 years as a creative, technologist, producer and interactive designer. Co-founded Lean Mean Fighting Machine digital agency (sold to M&C Saatchi). Product Director at Melody VR — a clinical wellbeing application using music in VR to reduce anxiety, with a completed Cardiff University trial.
credits:
  - [.cred-item:nth-child(1)] Co-founder, Lean Mean Fighting Machine (M&C Saatchi)
  - [.cred-item:nth-child(2)] Product Director, Melody VR (Cardiff University / Universal Music)
  - [.cred-item:nth-child(3)] VR Specialist, Rescape Innovation
  - [.cred-item:nth-child(4)] XR, UX, brand identity, interactive design, illustration

### Studio  [#sec-studio]
eyebrow [#sec-studio p.eyebrow]: The studio
heading [#sec-studio h2.heading]: Small enough to care. Skilled enough to deliver.
body_1 [#sec-studio p.body-text:first-of-type]: Bear Hill Studios is Laura Cox and Dave Cox — a husband-and-wife creative studio based in Bath, UK. Between them: a career in voice performance spanning Aardman to the BBC, and 30 years designing interactive experiences, VR and sound.
body_2 [#sec-studio p.body-text:last-of-type]: The boutique structure is a feature, not a limitation. Every project is owned by us — from brief to delivery. No account handlers, no junior teams. The people you talk to are the people doing the work.

### Kit  [#sec-kit]
eyebrow [#sec-kit p.eyebrow]: Studio & Kit
heading [#sec-kit h2.heading]: Built for the work.

#### Kit Card 1 — Recording  [#sec-kit .kit-card:nth-child(1)]
category [.kit-cat]: Recording
items:
  - [.kit-item:nth-child(1)] Dedicated acoustically treated studio
  - [.kit-item:nth-child(2)] Neumann U87 / TLM 102
  - [.kit-item:nth-child(3)] SSL 2+ interface
  - [.kit-item:nth-child(4)] Remote Source Connect sessions

#### Kit Card 2 — Production  [#sec-kit .kit-card:nth-child(2)]
category [.kit-cat]: Production
items:
  - [.kit-item:nth-child(1)] Pro Tools / Reaper
  - [.kit-item:nth-child(2)] iZotope RX suite
  - [.kit-item:nth-child(3)] Full noise reduction & restoration chain
  - [.kit-item:nth-child(4)] Custom spatial audio workflows

#### Kit Card 3 — Sound Design  [#sec-kit .kit-card:nth-child(3)]
category [.kit-cat]: Sound Design
items:
  - [.kit-item:nth-child(1)] Proprietary foley and field recordings
  - [.kit-item:nth-child(2)] Kontakt / Ableton Live
  - [.kit-item:nth-child(3)] Binaural & spatial audio processing
  - [.kit-item:nth-child(4)] Original composition and score elements

#### Kit Card 4 — Delivery  [#sec-kit .kit-card:nth-child(4)]
category [.kit-cat]: Delivery
items:
  - [.kit-item:nth-child(1)] ACX / Audible specification
  - [.kit-item:nth-child(2)] Broadcast standard (EBU R128)
  - [.kit-item:nth-child(3)] Stereo and binaural masters
  - [.kit-item:nth-child(4)] Chapter-split and continuous delivery

### Testimonial  [#sec-testimonial]
quote [#sec-testimonial blockquote]: "Having worked with Laura before we knew her voice would elevate the whole app, and it did — it made it so much better. Delivered on time and on budget."
cite [#sec-testimonial cite]: — Kevin Moss, Important Small Things

### CTA Band  [#sec-cta]
title [#sec-cta h2.cta-title]: Let's make something.
body [#sec-cta p.cta-body]: We respond to every enquiry within two working days.
button_label [#sec-cta a.btn]: Get in touch
button_href [#sec-cta a.btn attr:href]: contact.html

---

## PAGE: Contact — contact.html

### Page Header  [#page-head]
page_title [page-title]: Contact — Bear Hill Studios
eyebrow [#page-head p.eyebrow]: Bath, UK
h1 [#page-head h1]: Get in touch.
sub [#page-head p.sub]: Tell us a little about your project and we'll come back to you within two working days.

### Form  [#sec-contact form.form]
label_name [.form-group:nth-child(1) .form-label]: Your name
placeholder_name [.form-group:nth-child(1) .form-input attr:placeholder]: Jane Smith
label_email [.form-group:nth-child(2) .form-label]: Email address
placeholder_email [.form-group:nth-child(2) .form-input attr:placeholder]: jane@publisher.com
label_service [.form-group:nth-child(3) .form-label]: What are you looking for?
label_project [.form-group:nth-child(4) .form-label]: Tell us about your project
placeholder_project [.form-group:nth-child(4) .form-textarea attr:placeholder]: Genre, length, timeline, anything else useful…
label_how [.form-group:nth-child(5) .form-label]: How did you find us?
placeholder_how [.form-group:nth-child(5) .form-input attr:placeholder]: ACX, Google, referral…
button_label [button[type="submit"]]: Send message

#### Service Option 1  [#sec-contact .service-opt:nth-child(1)]
label [.service-opt-label]: Full immersive production
sub [.service-opt-sub]: End-to-end — voice, sound design, production

#### Service Option 2  [#sec-contact .service-opt:nth-child(2)]
label [.service-opt-label]: Narration + production
sub [.service-opt-sub]: Laura narrating, Dave producing

#### Service Option 3  [#sec-contact .service-opt:nth-child(3)]
label [.service-opt-label]: Voice talent only
sub [.service-opt-sub]: Laura for your own production

#### Service Option 4  [#sec-contact .service-opt:nth-child(4)]
label [.service-opt-label]: Not sure yet
sub [.service-opt-sub]: Happy to advise

### Direct Contact  [#sec-contact .contact-layout > div:last-child]
eyebrow [p.eyebrow]: Prefer a direct line?
email [.direct-item:nth-child(2) .direct-value]: hello@bearhillstudios.co.uk
email_href [.direct-item:nth-child(2) .direct-value a attr:href]: mailto:hello@bearhillstudios.co.uk
location [.direct-item:nth-child(3) .direct-value]: Bath, UK — working worldwide

### Separate Sites  [#sec-contact .contact-divider]
label_coaching [p:nth-child(2)]: Voice coaching →
name_coaching [p:nth-child(2) strong]: Laura Cox Voice Coaching
label_interactive [p:nth-child(3)]: Interactive & digital →
name_interactive [p:nth-child(3) strong]: Dave Cox Interactive
