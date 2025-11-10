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
        <h1>Hexfield</h1>
      </div>
      <div class="menu-item">
        <label id="file-btn">
          <input type="checkbox" style="position: absolute; width: 0; height: 0"></input>
          File
        </label>
      </div>
      <div class="menu-item">
        <label id="share-btn">
          <input type="checkbox" style="position: absolute; width: 0; height: 0"></input>
          Share
        </label>
        <div class="menu-daycare">
          <div class="menu-children">
            <li>Item 1</li>
            <li>Item 2</li>
          </div>
        </div>
      </div>
      <div class="spacer"></div>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      #root
      {
        display: flex;
        background-color: var(--menubar-main-color);
      }

      .menu-item
      {
        font-size: 48pt;
        padding: 1rem;
      }

      .menu-daycare
      {
        pointer-events: none;
        position: absolute;
        overflow: hidden;
        z-index: 10;
      }
      
      .menu-children
      {
        pointer-events: all;
        transition: transform 0.2s;
        transform: translateY(-100%);
        background-color: var(--menubar-share-color);
        padding: 1rem;
      }
      
      label:has(:checked) + .menu-daycare > .menu-children
      {
        transform: translateY(0%);
      }

      li
      {
        list-style: none;
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
    this.media_file_display = shadow.querySelector("#media-file-display");
  }
}

customElements.define("hex-menubar", HexMenubar);
