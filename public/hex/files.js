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
    const file_name = code_file.split("/").pop();
    row.querySelector(".file-row-name").innerHTML = file_name;
    row.setAttribute("value", code_file);
    row.setAttribute("name", file_name);
    row.firstElementChild.addEventListener("click",
      () =>
      {
        this.selectedIndex = ind;
        this.loadSelectedFile(code_file);
      }
    )
    this.file_display.appendChild(row);
  }

  addMediaFile(media_file, ind)
  {
    const row = document.createElement("option");
    row.innerHTML = media_file.split("/").pop();
    row.setAttribute("value", media_file);
    this.media_file_display.appendChild(row);
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
    media_files.forEach(this.addMediaFile.bind(this));
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
          <button id="code-file-new-btn">
            New
          </button>
          <div class="file-code-upload-controls">
            Upload: 
            <input
              type="file"
              id="file-input"
              multiple="multiple"
              accept=".html, .css, .js">
          </div>
          <div class="file-code-other-controls">
            <button id="code-file-save-btn">
              Save
            </button>
            <button id="code-file-delete-btn">
              Delete
            </button>
          </div>
        </div>
      </div>
      <div class="file-section">
        Media files:
        <div>
          <select size=4 id="media-file-display"></select>
        </div>
        <div>
          <input
            type="file"
            id="media-file-input"
            multiple="multiple"
            accept=".png, .jpg, .jpeg, .gif, image/*">
        </div>
      </div>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      #root
      {
        display: flex;
        gap: 1rem;
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

      .file-row.changed::after
      {
        content: '';
        display: block;
        width: 0.75rem;
        height: 0.75rem;
        background-color: red;
        border-radius: 100%;
        position: absolute;
        right: 0.75rem;
        top: calc(50% - 0.5rem);
        border: 1px solid darkred;
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
        cursor: pointer;
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
        margin: 0 0.5rem;
      }

      .file-code-other-controls
      {
      }

      #media-file-display
      {
        width: 100%;
        text-size: 150%;
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

    let file_input = shadow.querySelector("#file-input");
    file_input.addEventListener(
      "change",
      async () =>
      {
        if (file_input.files?.length > 0 && confirm("Upload?"))
          {
            let code_files = await mcp.store_and_upload_code_files(
              file_input.files
            );
            code_files.forEach(this.addCodeFile.bind(this));
            file_input.value = null;
          }
        }
      )
        
    let media_file_input = shadow.querySelector("#media-file-input");
    media_file_input.addEventListener(
      "change",
      async () =>
      {
        if (media_file_input.files?.length > 0 && confirm("Upload?"))
          {
            let media_files = await mcp.store_and_upload_media_files(
              media_file_input.files
            );
            media_files.forEach(this.addMediaFile.bind(this));
            media_file_input.value = null;
          }
        }
      );

    shadow.querySelector("#media-file-display").addEventListener(
      "dblclick",
      async () =>
      {
        console.log(this.#selectedIndex);
      }
    );
    
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

    shadow.querySelector("#code-file-save-btn").addEventListener(
      "click",
      () =>
      {
        mcp.update_html_code_file();
      }
    )
    
    mcp.regHexEvent(mcp.events.update_file_data,
      () =>
      {
        Array.from(this.file_display.children).forEach(
          file_row =>
          {
            const file = file_row.getAttribute("name");
            if (mcp.file_data[file] != mcp.last_saved_data[file])
            {
              file_row.classList.add("changed");
            }
            else
            {
              file_row.classList.remove("changed");
            }
          }
        )
      }
    )
  }
}

customElements.define("hex-files", HexFiles);
