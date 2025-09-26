import * as mcp from "/hex/mcp.js";

// Create a class for the element
class HexFiles extends HTMLElement
{
  #selectedIndex = null; // private field

  constructor()
  {
    // Always call super first in constructor
    super();
  }

  get selectedIndex()
  {
    return this.#selectedIndex;
  }

  get selectedRow()
  {
    return this.file_display.children[this.#selectedIndex];
  }

  set selectedIndex(i)
  {
    if (this.#selectedIndex !== null)
      this.selectedRow.removeAttribute("selected");
    
    this.#selectedIndex = i;
    
    this.selectedRow.setAttribute("selected", "");
  }

  loadSelectedFile(file)
  {
    mcp.fireEvent(mcp.events.load_code_file_text, file)
  }

  addCodeFile(code_file, ind)
  {
    const row = this.file_row_template.cloneNode(true);
    row.querySelector(".file-row-name").innerHTML = code_file.split("/").pop();
    row.setAttribute("value", code_file);
    row.firstElementChild.addEventListener("click",
      () =>
      {
        this.selectedIndex = ind;
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

    if (code_files.length > 0)
    {
      this.loadSelectedFile(this.file_display.firstElementChild.getAttribute("value"));
      this.selectedIndex = 0;
    }

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
        </div>
      </template>
      
      <div class="file-section">
        Code files:
        <div id="file-display">
        </div>
        <div class="file-code-controls">
          <div class="file-code-upload-controls">
            <input
              type="file"
              id="file-input"
              multiple="multiple"
              accept=".html, .css, .js">
          </div>
          <div class="file-code-other-controls">
            <button id="code-file-delete-btn">
              Delete
            </button>
            <button id="code-file-new-btn">
              New
            </button>
          </div>
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
        flex: 1;
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

      .file-row[selected] .file-row-name
      {
        background-color: lightblue;
      }

      .file-code-controls
      {
        display: flex;
      }

      .file-code-upload-controls
      {
        flex: 1;
      }
    `;

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(root);

    this.file_display = shadow.querySelector("#file-display");
    this.media_file_display = shadow.querySelector("#media-file-display");

    this.file_row_template = shadow.querySelector("#file-row-template").content.firstElementChild;

    console.log("FRT", this.file_row_template);

    mcp.regHexEvent(
      mcp.events.files_loaded,
      this.loadFileList.bind(this)
    );

    let file_input = shadow.querySelector("#file-input")
    file_input.addEventListener(
      "change",
      async () =>
      {
        if (file_input.files?.length > 0 && confirm("Upload files?"))
        {
          let code_files = await mcp.store_and_upload_code_files(
            file_input.files
          );
          code_files.forEach(this.addCodeFile.bind(this));
          file_input.value = null;
        }
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

    shadow.querySelector("#code-file-new-btn").addEventListener(
      "click",
      async () =>
      {
        let path = await mcp.create_code_file();
        if (path)
        {
          this.addCodeFile(path, this.file_display.children.length)
          this.selectedIndex = this.file_display.children.length - 1;
          this.loadSelectedFile(path);
        }
      }
    )
  }
}

customElements.define("hex-files", HexFiles);
