import * as mcp from "/hex/mcp.js";
import * as api from "/hex/api.js";

// Create a class for the element
class HexFiles extends HTMLElement
{
  constructor()
  {
    // Always call super first in constructor
    super();
  }

  loadSelectedFile(file)
  {
    mcp.fireEvent(mcp.events.load_code_file_text, file)
  }

  addCodeFile(code_file)
  {
    const row = this.file_row_template.cloneNode(true);
    row.querySelector(".file-row-name").innerHTML = code_file.split("/").pop();
    row.setAttribute("value", code_file);
    row.firstElementChild.addEventListener("click",
      () =>
      {
        this.loadSelectedFile(code_file);
      }
    )
    this.file_display.appendChild(row);
  }

  loadFileList([code_files, media_files])
  {
    console.log("loading...", code_files, media_files);

    this.file_display.innerHTML = "";
    code_files.forEach(this.addCodeFile.bind(this));

    this.loadSelectedFile(this.file_display.firstElementChild?.getAttribute("value"));

    this.media_file_display.innerHTML = "";
    //media_files.forEach(this.addCodeFile);
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
      <template id="file-row-template">
        <div class="file-row">
          <div class="file-row-name"></div>
          <div class="file-row-delete">DELETE</div>
        </div>
      </template>
      
      <div class="file-section">
        Code files:
        <div id="file-display">
        </div>
        <div>
          <input
            type="file"
            id="file-input"
            multiple="multiple"
            accept=".html, .css, .js">
          <button id="upload-btn">
            Upload
          </button>
        </div>
      </div>
      <div class="file-section">
        Media files:
        <select id="media-file-display">
        </select>
        <div>
          <input
            type="file"
            id="media-file-input"
            multiple="multiple"
            accept=".png, .jpg, .jpeg, .gif, image/*">
          <button id="media-upload-btn">
            Upload
          </button>
        </div>
      </div>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      #root
      {
        display: flex;
      }
      
      .file-section
      {
        border: 0.5em solid black;
        padding: 0.5em;
      }
      
      #file-display
      {
        height: 5rem;
        overflow: auto;
        border: 1px solid black;
      }

      .file-row
      {
        display: flex;
      }

      .file-row-name
      {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .file-row div
      {
        margin: 0.12rem 0.5rem;
      }

      .file-row-name:hover
      {
        background-color: pink;
      }
    `;

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(root);

    this.file_display = shadow.querySelector("#file-display");
    this.media_file_display = shadow.querySelector("#media-file-display");

    this.file_row_template = shadow.querySelector("#file-row-template").content.firstElementChild;

    console.log("FRT", this.file_row_template);

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
        mcp.store_and_upload_code_files(
          shadow.querySelector("#file-input").files
        );
      }
    )

    shadow.querySelector("#media-upload-btn").addEventListener(
      "click",
      () =>
      {
        mcp.store_and_upload_media_files(
          shadow.querySelector("#media-file-input").files
        );
      }
    )
  }
}

customElements.define("hex-files", HexFiles);
