# Vidhi Mistry — portfolio site

A one-page static site. No framework, no server, nothing to install. `index.html`
carries its own content, so it opens anywhere — on a phone, from a USB stick, or
from GitHub Pages. The page and both résumés are generated from one data file, so
they cannot say different things.

## Publish it on GitHub Pages

1. Create a new repository on GitHub — `vidhimistry.github.io` if you want it at
   `https://vidhimistry.github.io`, or any name (e.g. `portfolio`) for
   `https://<username>.github.io/portfolio`.
2. Copy everything in this folder into the repository and push.
3. In the repository, go to **Settings → Pages**, set **Source** to
   *Deploy from a branch*, branch `main`, folder `/ (root)`, and save.
4. Wait a minute or two. The URL appears at the top of that same Settings page.

## Preview it on your own machine

Double-click `index.html`. It opens in any browser with no server needed, and the
same file works when emailed, put on a USB stick, or opened on a phone.

## Files

```
index.html                      the whole site — HTML, CSS and JS in one file
resume.pdf                      research-weighted résumé (linked from the page)
assets/resume-process.pdf       process-weighted résumé
tools/build-site.js             rebuilds index.html from the master
tools/build-resumes.js          regenerates both résumé .docx files from the master
resume-data.json                the master file — NOT published, see below
.gitignore                      keeps resume-data.json out of the repository
```

## About `resume-data.json`

This is the master file everything derives from. It also carries working notes —
which claims still need verifying, what was deliberately left out, where earlier
versions of the résumé disagreed with each other. **None of that should be on the
public internet.** It is listed in `.gitignore`, so git will not commit it, and
the content written into `index.html` contains only the fields the page displays.

Keep `resume-data.json` in this folder on your own computer. Just don't remove it
from `.gitignore`.

## Changing the content

Everything on the page comes from the master file. To change a bullet, a date, a
skill or a project, edit `resume-data.json` and then regenerate:

```
node tools/build-site.js        # updates the page
node tools/build-resumes.js     # updates both résumé .docx files
```

Then export the two `.docx` files in `tools/` to PDF, and save them over
`resume.pdf` and `assets/resume-process.pdf`. Commit and push.

Editing a bullet directly in `index.html` will work until the next regeneration
wipes it out — change the master file instead.

### What goes in the hero

The four measured quantities at the top of the page, and which projects appear
under *Selected work*, are set near the top of `tools/build-site.js` in
`HIGHLIGHTS` and `FEATURED`. Each highlight points at the bullet the number
came from.

## Changing the look

The palette and spacing are CSS custom properties in the `:root` block at the top
of `index.html`:

```css
--ink:    #0E1A1F   /* page background */
--raise:  #14252B   /* lifted surfaces on hover */
--line:   #243D45   /* rules and borders */
--text:   #E6EFEE   /* body text */
--muted:  #90A8A7   /* secondary text */
--copper: #C68B4C   /* measured values, and only those */
```

The copper is reserved for numbers that were actually measured. If it starts
appearing on ordinary text the page loses the thing that makes it legible at a
glance, so it's worth keeping that rule.

Type is IBM Plex — Sans for headings and interface, Serif for reading, Mono for
figures — loaded from Google Fonts in the `<head>`. Swapping families means
changing that one link and the `font-family` declarations.
