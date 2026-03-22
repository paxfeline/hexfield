import * as mcp from "/hex/mcp.js";
import { base_project_path } from "/hex/util.js";

// Create a class for the element
class HexFiles extends HTMLElement
{
  #selectedPath = null; // private field

  constructor()
  {
    // Always call super first in constructor
    super();

    this.folder_items_by_path = {};
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
  
  makeFolder(folder, path)
  {
    const el = this.folder_row_template.cloneNode(true);
    el.querySelector(".file-row-name").innerHTML = folder;
    el.querySelector(".file-row").dataset.path = path;
    el.querySelector(".file-row").addEventListener("click",
      () =>
      {
        this.selectedPath = path;
        console.log(path);
      }
    );
    this.folder_items_by_path[path] = el.querySelector(".folder-children");
    return el;
  }

  loadFolder(folder, element)
  {
    for (const subfolder of folder.folders)
    {
      const el = this.makeFolder(subfolder.path.split("/").at(-2), subfolder.path);
      element.appendChild(el);
      this.loadFolder(subfolder, el.querySelector(".folder-children"), subfolder.path);
    }
    
    for (const file of folder.items)
    {
      this.addFile(file.name.split("/").pop(), "file", element, file.name);
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
      row.addEventListener("click",
        () =>
        {
          this.selectedPath = path;
          console.log(path);
          this.loadSelectedFile(path);
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

    this.loadFolder(files, this.file_display);

    // after loading files, select one
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
        <div class="folder-container">
          <div class="file-row">
            <div class="file-row-name"></div>
          </div>
          <div class="folder-children"></div>
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
            <label>Upload
              <input
                type="file"
                id="file-input"
                style="opacity: 0; position: absolute;"
                multiple="multiple"
                accept=".html, .css, .js">
            </label>
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
        display: flex; /* needed? */
        gap: 1rem; /* not used? */
        height: 100%;
      }
      
      .file-section
      {
        border: var(--hex-line-width, 0.5rem) solid black;
        padding: 0.5rem;
        flex: 1; /* flex parent needed? */
        display: flex;
        flex-direction: column;
      }
      
      #file-display
      {
        overflow: auto;
        border: 1px solid black;
        flex: 1;
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
        flex-direction: column;
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

      .folder-children
      {
        margin-left: 1rem;
      }

      .folder-container > .file-row-name
      {
        position: relative;
        left: -1rem;
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
        let dir_path = this.selectedPath ?? base_project_path();
        alert(dir_path);
        let path = await mcp.create_code_file(dir_path);
        if (path)
        {
          console.log("adding new file to files", path, mcp.files[0]);
          debugger;
          this.selectedRow.querySelector(".folder-children");
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
        const folder_recurse = folder =>
        {
          Array.from(folder.children).forEach(
            file_row =>
            {
              if (file_row.classList.contains("folder-container"))
                folder_recurse(file_row.querySelector(".folder-children"))
              else
              {
                const file = file_row.dataset.path;
                if (mcp.file_data[file] != mcp.last_saved_data[file])
                {
                  file_row.classList.add("changed");
                }
                else
                {
                  file_row.classList.remove("changed");
                }
              }
            }
          )
        };
        folder_recurse(this.file_display);
      }
    )
  }
}

customElements.define("hex-files", HexFiles);
