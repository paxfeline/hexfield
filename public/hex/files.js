import * as mcp from "/hex/mcp.js";

// Create a class for the element
class HexFiles extends HTMLElement
{
  #selectedPath = null; // private field

  constructor()
  {
    // Always call super first in constructor
    super();
  }

  get selectedPath()
  {
    return this.#selectedPath;
  }

  get selectedRow()
  {
    return this.file_display.querySelector(`[data-path="${this.#selectedPath}"]`);
  }

  set selectedPath(path)
  {
    if (this.#selectedPath !== null)
      this.selectedRow.removeAttribute("selected");
    
    this.#selectedPath = path;
    
    this.selectedRow.setAttribute("selected", "");
  }

  loadSelectedFile(file)
  {
    mcp.fireEvent(mcp.events.load_code_file_text, file);
  }
  
  makeFolder(folder)
  {
    return null;
  }

  loadFolder(folder, element, path)
  {
    for (const [key, val] of folder)
    {
      const item_path = path + "/" + key;
      if (typeof val == "object")
      {
        const folder = this.makeFolder(key);
        this.loadFolder(val, folder, item_path);
      }
      else
      {
        this.addFile(key, val, element, item_path);
      }
    }
  }

  addFile(file_name, type, element, path)
  {
    if (file_name !== "")
    {
      const row = this.file_row_template.cloneNode(true);
      // const frontend_path = path_parts.slice(2); // skip user and project name
      row.querySelector(".file-row-name").innerHTML = file_name;
      row.dataset.name = file_name;
      row.dataset.path = path;
      row.dataset.type = type;
      row.firstElementChild.addEventListener("click",
        () =>
        {
          this.selectedPath = path;
          this.loadSelectedFile(code_file);
        }
      );
      element.appendChild(row);
    }
    // else // file name == "" means folder
    // {
      
    // }
  }

  loadFileList(files)
  {
    console.log("loading...", files);

    this.file_display.innerHTML = "";

    this.loadFolder(Object.entries(files), this.file_display, "/");

    if (files.length > 0)
    {
      // const path = files[0];
      // this.loadSelectedFile(path);
      // this.selectedPath = path; // TODO: move into loadSelectedFile?
    }
  }

  connectedCallback()
  {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });

    // Create spans
    const root = document.createElement("div");
    root.id = "root";

    root.innerHTML = `
      <template id="file-row-template">
        <div class="file-row">
          <div class="file-row-name"></div>
        </div>
      </template>
      
      <template id="folder-row-template">
        <details>
          <summary></summary>
          <div></div>
        </details>
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
            <button id="code-file-view-btn">
              View
            </button>
            <button id="code-file-delete-btn">
              Delete
            </button>
          </div>
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
        border: var(--hex-line-width, 0.5rem) solid black;
        padding: 0.5rem;
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
        position: relative;
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

    // Create some CSS to apply to the shadow dom
    const uistyle = document.createElement("link");
    uistyle.href = "/css/ui.css";
    uistyle.rel = "stylesheet";

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(uistyle);
    shadow.appendChild(root);

    this.file_display = shadow.querySelector("#file-display");

    this.file_row_template = shadow.querySelector("#file-row-template").content.firstElementChild;
    this.folder_row_template = shadow.querySelector("#folder-row-template").content.firstElementChild;

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
            code_files.forEach(this.addFile.bind(this));
            file_input.value = null;
          }
        }
      )
    
    shadow.querySelector("#code-file-new-btn").addEventListener(
      "click",
      async () =>
      {
        let path = await mcp.create_code_file();
        if (path)
        {
          console.log("adding new file to files", path, mcp.files[0]);
          mcp.files[0].push(path);
          // not needed because file_data[name] will initially be null...
          // and then any changes will be flagged?:
          //const name = path.split("/").pop();
          //file_data[name] = last_saved_data[name] = "";
          mcp.fireEvent(mcp.events.file_created);
          this.addFile(path);
          this.selectedPath = path;
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

    shadow.querySelector("#code-file-view-btn").addEventListener(
      "click",
      () =>
      {
        open(`/web/${mcp.current_file_url}`);
      }
    )
    
    mcp.regHexEvent(mcp.events.update_file_data,
      () =>
      {
        Array.from(this.file_display.children).forEach(
          file_row =>
          {
            const file = file_row.dataset.name;
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
