import * as mcp from "/hex/mcp.js";
import * as api from "/hex/api.js";

// Create a class for the element
class HexFiles extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();
  }

  loadSelectedFile(file)
  {
    mcp.fireEvent(mcp.events.load_code_file_text, file)
  }

  loadFileList([code_files, media_files])
  {
    console.log("loading...", code_files, media_files);

    this.file_display.innerHTML = "";
    code_files.forEach(file => {
      const opt = document.createElement("option");
      opt.value = file;
      opt.innerHTML = file.split("/").pop();
      this.file_display.add(opt);
    });

    if (this.file_display.selectedOptions.length > 0)
      this.loadSelectedFile(this.file_display.selectedOptions[0].value);

    this.media_file_display.innerHTML = "";
    media_files.forEach(file => {
      const opt = document.createElement("option");
      opt.value = file;
      opt.innerHTML = file.split("/").pop();
      this.media_file_display.add(opt);
    });
  }

  connectedCallback()
  {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });
    this.shadow = shadow;

    // Create spans
    const root = document.createElement("div");
    root.id = "root";

    root.innerHTML = `
      Code files:
      <select id="file-display">
      </select>
      <div>
        <input type="file" id="file-input">
        <button id="upload-btn">
          Upload
        </button>
      </div>
      Media files:
      <select id="media-file-display">
      </select>
      <div>
        <input type="file" id="media-file-input">
        <button id="media-upload-btn">
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

    this.file_display = shadow.querySelector("#file-display");
    this.media_file_display = shadow.querySelector("#media-file-display");

    this.file_display.addEventListener("change",
      e =>
      {
        console.log(e.target.value);
        this.loadSelectedFile(e.target.value)
      }
    )

    mcp.regHexEvent(
      mcp.events.files_loaded,
      this.loadFileList.bind(this)
    );

    shadow.querySelector("#upload-btn").addEventListener(
      "click",
      () =>
      {
        mcp.store_and_upload_code_file(
          shadow.querySelector("#file-input").files[0]
        );
      }
    )

    shadow.querySelector("#media-upload-btn").addEventListener(
      "click",
      () =>
      {
        mcp.store_and_upload_media_file(
          shadow.querySelector("#media-file-input").files[0]
        );
      }
    )
  }
}

customElements.define("hex-files", HexFiles);
