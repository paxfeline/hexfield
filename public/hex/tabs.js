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

    console.log("tab onshow cb?:", this.selectedTabBody?.onshow);
    this.selectedTabBody?.onshow?.();
  }

  static observedAttributes = ["disabled"];

  attributeChangedCallback(name, oldValue, newValue)
  {
    console.log(
      `Tabs: Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
    );

    if (name == "disabled")
    {
      const tabs_fieldset = this.shadowRoot.querySelector("#tabs-fieldset");

      if (newValue === null)
        tabs_fieldset.removeAttribute("disabled");
      else
        tabs_fieldset.setAttribute("disabled", "");

    }
  }

  connectedCallback()
  {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });
    this.shadow = shadow; // redundant? shadowRoot? TODO: remove

    // Create spans
    const root = document.createElement("div");
    root.id = "root";
    root.part = "root"; // for CSS

    root.innerHTML = `
      <fieldset id="tabs-fieldset" style="border: none; padding: 0;">
        <div id="tab-header" part="header"></div>
      </fieldset>
      <div id="tab-bodies" part="bodies"></div>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      :host
      {
        display: block;
        height: 100%;
      }

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
        background-color: white;
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
        border: 0.2rem solid black;
        border-top-width: 0;
        height: 100%;
      }

      #tab-bodies > *
      {
        display: none;
      }

      #tab-bodies > *[selected]
      {
        display: revert-layer;
      }
    `;

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(root);
    
    const tab_bodies = shadow.querySelector("#tab-bodies");
    this.tab_bodies = tab_bodies;
    tab_bodies.append(...this.children);

    const tab_header = shadow.querySelector("#tab-header");
    if (!this.hasAttribute("no-tabs"))
    {
      const tabs = Array.from(tab_bodies.children).map(
        (el, ind) =>
        {
          const tab = document.createElement("button");
          tab.className = "tab-tab";
          tab.innerHTML = el.getAttribute("tab");
          tab.addEventListener("click", () => this.selectedIndex = ind);
          return tab;
        }
      );
      
      this.tab_header = tab_header;
      tab_header.append(...tabs);
    }
    else
    {
      tab_header.style.display = "none";
      tab_bodies.style.borderWidth = "0";
    }

    // run init functions
    this.init?.(mcp);
    
    if (tab_bodies.children.length > 0)
      this.selectedIndex = 0;
  }
}

customElements.define("hex-tabs", HexTabs);
