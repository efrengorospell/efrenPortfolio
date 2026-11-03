/*
  EASY PROJECT UPDATES
  --------------------
  Add a new item by copying one object below and changing its values.
  Available themes: "cafe" and "budget".
  Set liveUrl or codeUrl to a real link when you have one; leave blank otherwise.
*/
const portfolioInfo = {
  displayName: "Efren Gorospe ll",
  role: "Freelance Web Developer",
  school: "FEU Tech",
  location: "Manila, Philippines",
  heroIntro: "I’m a computer science student at FEU Tech building clean, responsive websites for small businesses and people with something of their own to share.",
  bio: "I’m a computer science student at FEU Tech and freelance web developer in Manila. I enjoy turning ideas into clear, mobile-friendly websites that are easy to use.",
  contactEmail: "efrengorospe28@gmail.com",
  githubUrl: "https://github.com/efrengorospell",
  linkedinUrl: "https://www.linkedin.com/in/efren-gorospe-13636b36a/",
  services: [
    "Small business websites",
    "Landing pages",
    "Personal portfolios",
    "Website updates"
  ],
  skills: [
    "HTML",
    "CSS",
    "JavaScript · foundational",
    "Responsive layouts",
    "C++ / Java fundamentals"
  ]
};

const projects = [
  {
    title: "Student Budget Tracker",
    category: "Personal project / Student tool",
    description: "A practical dashboard for tracking allowance, expenses, and monthly spending.",
    details: "Built for student life, this tracker lets you add, edit, and remove income or expenses, filter transactions, adjust a monthly budget, review spending by category, and export a CSV. Data stays in the browser with localStorage; no account or database is needed.",
    tags: ["HTML", "CSS", "JavaScript", "localStorage"],
    theme: "budget",
    badge: "PERSONAL PROJECT",
    liveUrl: "budget-tracker/index.html",
    codeUrl: ""
  },
  {
    title: "Sinta Café",
    category: "Fictional café website / Concept",
    description: "A mobile-friendly café website with a filterable menu and reservation demo.",
    details: "A fictional Makati neighborhood café brought to life with a responsive menu, PHP prices, opening hours, location details, and a reservation form with a sample confirmation. The reservation flow is a front-end demo and does not send real bookings.",
    tags: ["HTML", "CSS", "JavaScript", "Responsive design"],
    theme: "cafe",
    badge: "CONCEPT PROJECT",
    liveUrl: "cafe-site/index.html",
    codeUrl: ""
  },
];

const projectGrid = document.querySelector("#project-grid");
const safeUrl = (value) => {
  if (/^https?:\/\//i.test(value || "")) return value;
  if (/^(?:\.\/)?[a-z0-9_-]+\/[a-z0-9_-]+\.html$/i.test(value || "")) return value;
  return "";
};
const escapeHTML = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
}[char]));

projectGrid.innerHTML = projects.map((project) => {
  const theme = ["cafe", "budget"].includes(project.theme) ? project.theme : "budget";
  const title = escapeHTML(project.title);
  const category = escapeHTML(project.category);
  const description = escapeHTML(project.description);
  const previewUrl = safeUrl(project.liveUrl);

  return `
    <article class="project-card project-tile">
      <div class="project-visual" data-theme="${theme}" aria-label="Live website preview for ${title}">
        <div class="visual-noise"></div>
        ${previewUrl ? `<iframe class="project-preview-frame" src="${escapeHTML(previewUrl)}" title="Live preview of ${title}" loading="lazy" tabindex="-1" aria-hidden="true"></iframe>` : ""}
        <span class="project-badge">${escapeHTML(project.badge || "Concept study")}</span>
      </div>
      <div class="project-info">
        <div>
          <span class="project-category">${category}</span>
          <h3>${title}</h3>
          <p class="project-description">${description}</p>
          <div class="project-tags">${project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}</div>
        </div>
        <button class="project-arrow project-details-button" type="button" data-project-index="${projects.indexOf(project)}" aria-label="View details for ${title}">↗</button>
      </div>
    </article>`;
}).join("");

const projectDialog = document.querySelector("#project-dialog");
projectGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project-index]");
  if (!button) return;
  const project = projects[Number(button.dataset.projectIndex)];
  if (!project) return;

  document.querySelector("#dialog-category").textContent = project.category;
  document.querySelector("#dialog-title").textContent = project.title;
  document.querySelector("#dialog-description").textContent = project.details || project.description;
  document.querySelector("#dialog-tags").innerHTML = project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join("");
  const links = [
    ["Live project", safeUrl(project.liveUrl)],
    ["Source code", safeUrl(project.codeUrl)]
  ].filter(([, url]) => url);
  document.querySelector("#dialog-links").innerHTML = links.map(([label, url]) => {
    const external = /^https?:\/\//i.test(url);
    return `<a href="${escapeHTML(url)}" ${external ? 'target="_blank" rel="noreferrer"' : ""}>${label} ↗</a>`;
  }).join("");
  projectDialog.showModal();
});

projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});

const contactForm = document.querySelector("#contact-form");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.querySelector(".form-status");
  const emailIsReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(portfolioInfo.contactEmail);
  if (!emailIsReady || portfolioInfo.contactEmail === "your-email@example.com") {
    status.textContent = "Add your real email in the portfolioInfo section of script.js to enable this form.";
    return;
  }

  const values = new FormData(contactForm);
  const subject = `Portfolio inquiry: ${values.get("project")}`;
  const body = [
    `Name: ${values.get("name")}`,
    `Reply email: ${values.get("email")}`,
    `Project type: ${values.get("project")}`,
    "",
    values.get("message")
  ].join("\n");
  window.location.href = `mailto:${portfolioInfo.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const renderChips = (target, items) => {
  target.innerHTML = items.map((item) => `<b>${escapeHTML(item)}</b>`).join("");
};

renderChips(document.querySelector("#services-list"), portfolioInfo.services);
renderChips(document.querySelector("#skills-list"), portfolioInfo.skills);

const profileLinks = [
  ["Email", `mailto:${portfolioInfo.contactEmail}`],
  ["GitHub", safeUrl(portfolioInfo.githubUrl)],
  ["LinkedIn", safeUrl(portfolioInfo.linkedinUrl)]
].filter(([, url]) => url);
document.querySelector("#profile-links").innerHTML = profileLinks.map(([label, url]) => {
  const external = url.startsWith("https://");
  return `<a href="${escapeHTML(url)}" ${external ? 'target="_blank" rel="noreferrer"' : ""}>${escapeHTML(label)} <span>↗</span></a>`;
}).join("");

const firstName = portfolioInfo.displayName.trim().split(/\s+/)[0].toLowerCase();
document.querySelector("#brand-name").textContent = firstName;
document.querySelector("#footer-brand-name").textContent = firstName;
document.querySelector("#header-wordmark").setAttribute("aria-label", `${portfolioInfo.displayName}, home`);
document.querySelector("#profile-role").textContent = portfolioInfo.role;
document.querySelector("#profile-school").textContent = portfolioInfo.school;
document.querySelector("#profile-location").textContent = portfolioInfo.location;
document.querySelector("#footer-location").textContent = portfolioInfo.location;
document.querySelector("#footer-name").textContent = portfolioInfo.displayName;
document.querySelector("#hero-intro").textContent = portfolioInfo.heroIntro;
document.querySelector("#profile-bio").textContent = portfolioInfo.bio;
document.title = `${portfolioInfo.displayName} — ${portfolioInfo.role}`;
document.querySelector('meta[name="description"]').content = `${portfolioInfo.displayName} is a ${portfolioInfo.role.toLowerCase()} and computer science student at ${portfolioInfo.school}, based in ${portfolioInfo.location}.`;

document.querySelector("#year").textContent = new Date().getFullYear();
