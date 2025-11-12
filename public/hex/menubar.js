import * as mcp from "/hex/mcp.js";

// Create a class for the element
class HexMenubar extends HTMLElement
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
    mcp.fireEvent(mcp.events.load_code_file_text, file);
  }

  connectedCallback()
  {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });

    // Create spans
    const root = document.createElement("div");
    root.id = "root";

    root.innerHTML = `
      <div id="header">
        <h1>Hexfield ⬣</h1>
      </div>
      <div class="menu-item" id="file-menu">
        <label id="file-menu-item">
          <input type="checkbox"></input>
          File
        </label>
        <div class="menu-daycare"><div class="menu-children">
          <div class="menu-child selectable" data-action="file-save">Save</div>
          <div class="menu-child selectable" data-action="file-view">View (new tab)</div>
          <div class="menu-child selectable" data-action="file-delete">Delete...</div>
        </div></div>
      </div>
      <div class="menu-item" id="share-menu">
        <label id="share-menu-item">
          <input type="checkbox"></input>
          Share
        </label>
        <div class="menu-daycare"><div class="menu-children">
          <div class="menu-child">Shareable?</div>
          <div class="menu-child selectable" id="share-yes" data-action="share-yes">Yes</div>
          <div class="menu-child selectable" id="share-no"  data-action="share-no" data-selected>No</div>
          <div class="menu-child selectable" data-action="share-url">Get URL</div>
        </div></div>
      </div>
      <div class="spacer"></div>
      <div id="status-cont">
        Status:
        <span id="status">
          Idle
        </span>
      </div>
      <div class="spacer"></div>
      <div class="menu-item" id="user-menu">
        <label id="user-menu-item">
            <input type="checkbox"></input>
            <span id="user-name">
              <slot></slot>
            </span>
        </label>
        <div class="menu-daycare"><div class="menu-children">
          <div class="menu-child selectable" data-action="user-dashboard">Dashboard</div>
            <div class="menu-child selectable" data-action="user-signout">
              <a data-turbo-method="delete" href="/users/sign_out">
                Exit & Sign Out
              </a>
            </div>
          </div>
        </div></div>
      </div>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      #root
      {
        display: flex;
        align-items: baseline;
        gap: 2rem;
        background-color: var(--menubar-main-color);
        font-family: monospace;
        padding: 1rem;
      }

      #header h1
      {
        margin: 0;
      }

      .menu-item
      {
        font-size: 18pt;
        position: relative;
      }

      .menu-item > label
      {
        text-shadow: black 0 0;
        transition: text-shadow var(--hex-anim-speed);
        cursor: pointer;
        color: black;
        background-image: linear-gradient(transparent 50%, black 50%);
        background-size: 100% 200%;
        background-position-y: 0%;
        transition: color, background-position-y var(--hex-anim-speed);
      }

      .menu-daycare
      {
        pointer-events: none;
        position: absolute;
        overflow: hidden;
        width: max-content;
        z-index: 10;
        margin-left: -1rem;
      }
      
      .menu-children
      {
        pointer-events: all;
        transition: transform var(--hex-anim-speed);
        transform: translateY(-100%);
        border: var(--hex-line-width) solid var(--menubar-menu-border-color);
        background-color: var(--menubar-menu-color);
      }

      .menu-item:has(:checked) > label
      {
        color: white;
        text-shadow: white 0.075rem 0.075rem;
        background-position-y: 100%;
      }
      
      label:has(:checked) + .menu-daycare > .menu-children
      {
        transform: translateY(0%);
      }

      .menu-child
      {
        margin: 0;
        padding: 0.75rem;
      }

      .menu-child.selectable:hover
      {
        font-style: italic;
        background-color: lightblue;
        cursor: pointer;
      }

      #share-yes,
      #share-no
      {
        border-left: 0.333rem solid black;
        margin-left: 0.75rem;
      }

      #user-menu
      {
        direction: rtl;
      }

      [data-selected]::after
      {
        content: " ☜";
      }

      input[type="checkbox"]
      {
        position: absolute;
        width: 0;
        height: 0
      }

      .spacer
      {
        flex: 1;
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

    this.fileMenu = shadow.querySelector("#file-menu");
    this.shareMenu = shadow.querySelector("#share-menu");
    this.shareYes = shadow.querySelector("#share-yes");
    this.shareNo = shadow.querySelector("#share-no");

    this.fileMenu.addEventListener("click",
      e =>
      {
        this.shareMenu.querySelector("input[type='checkbox']").checked = false;
        if (e.target.dataset.action === "file-save")
        {
          console.log("save")
        }
        else if (e.target.dataset.action === "file-view")
        {
          console.log("view")
        }
        else if (e.target.dataset.action === "file-delete")
        {
          console.log("delete")
        }
      }
    );
    
    this.shareMenu.addEventListener("click",
      e =>
      {
        console.log(e);

        this.fileMenu.querySelector("input[type='checkbox']").checked = false;

        if (e.target.dataset.action === "share-yes" || e.target.dataset.action === "share-no")
        {
          const sp = new URLSearchParams(document.location.search);
          sp.set("project[visibility]", e.target.dataset.action === "share-yes" ? 1 : 0);
          window.history.replaceState(null, "", `edit?${sp}`);
          mcp.update_project();

          // update UI
          // TODO: move and fire event when done
          const onChoice = e.target.dataset.action === "share-yes" ? this.shareYes : this.shareNo;
          const offChoice = e.target.dataset.action === "share-yes" ? this.shareNo : this.shareYes;
          delete offChoice.dataset.selected;
          onChoice.dataset.selected = "";
        }
        else if (e.target.dataset.action === "share-url")
        {
          console.log("url")
        }
      }
    );

    // share menu setup
    const params = new URLSearchParams(document.location.search);
    if (params.get("project[visibility]") === "0")
    {
      delete this.shareYes.dataset.selected;
      this.shareNo.dataset.selected = "";
    }
    else if (params.get("project[visibility]") === "1")
    {
      delete this.shareNo.dataset.selected;
      this.shareYes.dataset.selected = "";
    }
  }
}

customElements.define("hex-menubar", HexMenubar);
