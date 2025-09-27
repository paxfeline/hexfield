import * as mcp from "/hex/mcp.js";

// Create a class for the element
class HexTabs extends HTMLElement
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

  get selectedTabBody()
  {
    return this.tab_bodies.children[this.#selectedIndex];
  }

  get selectedTabTab()
  {
    return this.tab_header?.children[this.#selectedIndex];
  }

  set selectedIndex(i)
  {
    if (this.#selectedIndex !== null)
    {
      this.selectedTabBody.removeAttribute("selected");
      this.selectedTabTab?.removeAttribute("selected");
    }
    
    this.#selectedIndex = i;
    
    this.selectedTabBody.setAttribute("selected", "");
    this.selectedTabTab?.setAttribute("selected", "");
  }

  connectedCallback()
  {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });
    this.shadow = shadow;

    // Create spans
    const root = document.createElement("div");
    root.id = "root";
    root.part = "root"; // for CSS

    root.innerHTML = `
      <div id="tab-header" part="header"></div>
      <div id="tab-bodies" part="bodies"></div>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      #root
      {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      #tab-header
      {
        display: flex;
      }

      #tab-header::after
      {
        flex: 1;
        border: 0rem solid black;
        border-width: 0 0 0.2rem 0;
        content: '';
      }

      .tab-tab
      {
        border: 0.2rem outset black;
        padding: 0.3rem;
        border-radius: 0.5rem 0.5rem 0 0;
        cursor: pointer;
      }

      .tab-tab[selected]
      {
        border-style: inset;
        border-color: black black transparent;
      }

      #tab-bodies
      {
        flex: 1;
        /* min-height: 0%; -> moved to hex-tabs element */
        overflow: auto;
      }

      #tab-bodies > *
      {
        display: none;
      }

      #tab-bodies > *[selected]
      {
        display: initial;
      }
    `;

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(root);

    if (!this.hasAttribute("no-tabs"))
    {
      const tabs = Array.from(this.children).map(
        (el, ind) =>
        {
          const tab = document.createElement("div");
          tab.className = "tab-tab";
          tab.innerHTML = el.getAttribute("tab");
          tab.addEventListener("click", () => this.selectedIndex = ind);
          return tab;
        }
      );
      
      const tab_header = shadow.querySelector("#tab-header");
      this.tab_header = tab_header;
      tab_header.append(...tabs);
    }
    
    const tab_bodies = shadow.querySelector("#tab-bodies");
    this.tab_bodies = tab_bodies;
    tab_bodies.append(...this.children);

    if (tab_bodies.children.length > 0)
      this.selectedIndex = 0;
  }
}

customElements.define("hex-tabs", HexTabs);
