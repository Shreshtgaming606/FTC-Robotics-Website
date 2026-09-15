# FTC Robotics Website

The official static website for The Viltrumites, FTC Team #36082, and its robot, Satoru Gojo. The site is built with plain HTML, CSS, and JavaScript so it can run on Nginx without a framework, dependency installation, or build step.

## Site pages

- `index.html` — homepage, team statistics, mission, and season tracker
- `about.html` — team story, mission, work, and values
- `members.html` — member cards generated from the shared team data file
- `roles.html` — Coding and Build team responsibilities
- `robot.html` — robot specifications and development timeline
- `gallery.html` — filterable gallery with an accessible lightbox

## Project structure

```text
.
├── assets/
│   └── images/
│       ├── gallery/        # Competition and team gallery photos
│       ├── members/        # Team member portraits
│       └── robot/          # Robot photos
├── css/
│   └── style.css           # Shared design system and responsive styles
├── js/
│   ├── main.js             # Navigation, animation, member, and gallery behavior
│   └── team-data-v3.js     # Team roster and gallery content
├── about.html
├── gallery.html
├── index.html
├── members.html
├── robot.html
├── roles.html
└── robots.txt
```

## Updating content

1. Edit member profiles or gallery entries in `js/team-data-v3.js`.
2. Store new images in the matching folder under `assets/images/`.
3. Use relative image paths, such as `assets/images/members/example.jpg`.
4. Keep useful alternative text on every real image.

The `team-data-v3.js` filename is versioned intentionally so browsers do not reuse an older cached roster. When the filename changes, update its reference in every HTML page and in `js/main.js`.

## Local preview

From the project folder, start any static file server. For example:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

## Formatting and code style

The repository includes a Prettier configuration for consistent HTML, CSS, JavaScript, and Markdown formatting:

```sh
npx --yes prettier@3.6.2 --write "*.html" "css/*.css" "js/*.js" "README.md"
```

Section comments explain the purpose of each major block. Keep comments focused on intent and behavior rather than restating individual lines.

## Deployment

Copy the complete project into the configured Nginx document root. Because the site uses only static files, content changes do not require restarting Nginx.

The homepage hero currently uses generic concept artwork and labels it accordingly. Replace it with a real robot image when one becomes available.
