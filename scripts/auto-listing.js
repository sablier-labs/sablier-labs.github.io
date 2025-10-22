// Auto-configure based on current page path
function initializeDirectoryListing() {
  const path = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
  const directory = path.replace(/^\//, "") || ".";

  // Configuration for each directory
  const configs = {
    ".": {
      excludeFiles: [
        ".prettierrc.yml",
        ".gitignore",
        ".vscode",
        "CNAME",
        "index.html",
        "scripts",
        "README.md",
      ],
      showDirs: true,
    },
    external: { showDirs: true },
    templates: { showDirs: true },
    tokens: { showDirs: false },
  };

  const config = configs[directory] || { showDirs: false };
  createFileListing(directory, config);
}

/**
 * Creates a file listing for a directory using GitHub API
 */
function createFileListing(directory, options = {}) {
  const { showDirs = false, excludeFiles = ["index.html"] } = options;

  const OWNER = "sablier-labs";
  const REPO = "sablier-labs.github.io";

  fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${directory}`)
    .then((response) => response.json())
    .then((data) => {
      const list = document.getElementById("fileList");

      // List directories first
      if (showDirs) {
        data.forEach((file) => {
          if (excludeFiles.includes(file.name)) {
            return;
          }
          if (file.type !== "dir") {
            return;
          }

          const li = document.createElement("li");
          const a = document.createElement("a");
          a.setAttribute("href", `${file.name}/`);
          a.textContent = `${file.name}/`;
          li.appendChild(a);
          list.appendChild(li);
        });
      }

      // List files
      data.forEach((file) => {
        if (excludeFiles.includes(file.name)) {
          return;
        }
        if (file.type !== "file") {
          return;
        }

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.setAttribute("href", `https://files.sablier.com/${directory}/${file.name}`);
        a.setAttribute("target", "_blank");
        a.textContent = file.name;
        li.appendChild(a);
        list.appendChild(li);
      });
    })
    .catch((error) => console.error("Error fetching repo contents:", error));
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initializeDirectoryListing);
