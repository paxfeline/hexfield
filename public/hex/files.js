import * as mcp from "/hex/mcp.js";
import * as api from "/hex/api.js";

// Create a class for the element
class HexFiles extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();
  }

  connectedCallback()
  {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });

    mcp.addEventListener(
      mcp.events.files_initial_load,
      function logit (data) {console.log(data);}
    );

    // Create spans
    const root = document.createElement("div");
    root.id = "root";

    root.innerHTML = `
      <div id="file-display">
      </div>
      <div id="controls">
        <input type="file" id="file-input">
        <button id="upload-btn">
          Upload
        </button>
      </div>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      #root
      {
        display: flex;
      }
    `;

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(root);

    shadow.querySelector("#upload-btn").addEventListener(
      "click",
      () =>
      {
        api.upload_code_file({
          search_params: document.location.search,
          file: shadow.querySelector("#file-input").files[0]
        })
      }
    )
  }
}

customElements.define("hex-files", HexFiles);
