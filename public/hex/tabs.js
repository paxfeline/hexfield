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
    return this.tab_bodies.assignedElements()[this.#selectedIndex];
  }

  get selectedTabTab()
  {
    return this.tab_header?.children[this.#selectedIndex];
  }

  set selectedIndex(i)
  {
    if (this.#selectedIndex !== null)
    {
      this.selectedTabBody.setAttribute("hidden", "");
      this.selectedTabTab?.removeAttribute("selected");
    }
    
    this.#selectedIndex = i;
    
    this.selectedTabBody.removeAttribute("hidden");
    this.selectedTabTab?.setAttribute("selected", "");

    console.log("tab onshow cb?:", this.selectedTabBody?.onshow);
    this.selectedTabBody?.onshow?.(mcp);
  }

  static observedAttributes = ["disabled", "hidden"];

  attributeChangedCallback(name, oldValue, newValue)
  {
    console.log(
      `Tabs: Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
    );

    // maybe not connected yet?
    if (!this.shadowRoot) return;

    if (name == "disabled")
    {
      const tabs_fieldset = this.shadowRoot.querySelector("#tabs-fieldset");

      if (newValue === null)
        tabs_fieldset.removeAttribute("disabled");
      else
        tabs_fieldset.setAttribute("disabled", "");
    }
    else if (name === "hidden")
    {
      if (newValue === null)
        this.shadowRoot.querySelector("#root").removeAttribute("hidden");
      else
        this.shadowRoot.querySelector("#root").setAttribute("hidden", "");
    }
  }

  connectedCallback()
  {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });

    // Create spans
    const root = document.createElement("div");
    root.id = "root";
    root.part = "root"; // for CSS

    root.innerHTML = `
      <fieldset id="tabs-fieldset" style="border: none; padding: 0; margin: 0;"
        ${this.hasAttribute("disabled") ? "disabled" : ""}>
        <div id="tab-header" part="header"></div>
      </fieldset>
      <slot id="tab-bodies" part="bodies"></slot>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      :host
      {
        display: block;
        height: 100%;
      }

      /* I wish I could think of a nicer way to do this.
        It's necessary because, without it, the #root rule above
        overrides the "element attribute style" for "hidden" */

      :host([hidden]) { display: none; }

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

      /*
      #tab-header::before
      {
        width: 1rem;
        border: 0rem solid black;
        border-width: 0 0 var(--hex-line-width, 0.2rem) 0;
        content: '';
      }
        */

      #tab-header::after
      {
        flex: 1;
        border: 0rem solid black;
        border-width: 0 0 var(--hex-line-width, 0.2rem) 0;
        content: '';
      }

      .tab-tab
      {
        border: var(--hex-line-width, 0.2rem) solid black;
        border-bottom-width: 0;
        padding: 0.3rem;
        cursor: pointer;
        background-color: white;
        position: relative;
        padding-bottom: calc(0.3rem + var(--hex-line-width, 0.2rem));
        /*
        border-radius: 0.5rem 0.5rem 0 0;
        */
      }

      .tab-tab:not(:first-child)
      {
        border-left-width: 0;
      }

      .tab-tab::after
      {
        content: '';  
        border: 0 solid black;
        position: absolute;
        left: 0;
        bottom: 0;
        height: 0;
        width: 100%;
        border-bottom-width: var(--hex-line-width, 0.2rem);
      }
      
      .tab-tab[selected]::after
      {
        border-bottom-width: 0;
      }

      #tab-bodies
      {
        flex: 1;
        /* min-height: 0%; -> moved to hex-tabs element */
        overflow: auto;
        border: var(--hex-line-width, 0.2rem) solid black;
        border-top-width: 0;
        height: 100%;
        display: block; /* slot default = contents */
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
    
    // Create some CSS to apply to the shadow dom
    const uistyle = document.createElement("link");
    uistyle.href = "/css/ui.css";
    uistyle.rel = "stylesheet";

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(uistyle);
    shadow.appendChild(root);
    
    const tab_bodies = shadow.querySelector("#tab-bodies");
    this.tab_bodies = tab_bodies;
    //tab_bodies.append(...this.children);
    tab_bodies.assignedElements().map(el => 
    {
      console.log("hiding tab", el);
      el.setAttribute("hidden", "");
    });

    const tab_header = shadow.querySelector("#tab-header");
    if (!this.hasAttribute("no-tabs"))
    {
      const tabs = Array.from(tab_bodies.assignedElements()).map(
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
    
    if (tab_bodies.assignedElements().length > 0)
      this.selectedIndex = 0;
  }
}

customElements.define("hex-tabs", HexTabs);
