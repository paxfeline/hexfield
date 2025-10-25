// Create a class for the element
class BuilderElement extends HTMLElement
{
  constructor()
  {
    // Always call super first in constructor
    super();
  }

  connectedCallback()
  {
    // Create a shadow root
    // This can happen twice if element is moved
    if (this.shadowRoot) return;
    
    const shadow = this.attachShadow({ mode: "open" });

    // Create spans
    const root = document.createElement("div");
    root.id = "builder-element";

    const block = document.createElement("div");
    
    root.append(block);
    
    const dz = document.createElement("div");
    dz.className = "dropzone";
    dz.setAttribute("ondrop", "builder_globals.handlers.drop(event)");
    dz.setAttribute("ondragover", "builder_globals.handlers.dragover(event)");
    dz.setAttribute("ondragleave", "builder_globals.handlers.dragleave(event)");

    dz.part = "dropzone";
    
    root.append(dz);
    
    let type = this.getAttribute("type");

    if (type === '[custom]' || type === '[custom-empty]')
      block.innerHTML = '<div class="builder-custom-el">Type: <input class="builder-custom-type"></div>';

    if (!builder_globals.text_elements.includes(type))
    {
      block.innerHTML += `
        <div class="builder-attribute-set" part="attributes">
          <div class="builder-attribute-container"></div>
          <div
            class="builder-attribute-dropzone"
            ondragleave="builder_globals.handlers.dragleave_attribute(event)"
            ondrop="builder_globals.handlers.drop_attribute(event)"
            ondragover="builder_globals.handlers.dragover_attribute(event)">
          </div>
        </div>
      `
    }

    // empty tags won't have any content
    if (builder_globals.empty_elements.includes(type) || builder_globals.text_elements.includes(type))
    {
      // ...unless they contain a text node
      if (builder_globals.text_elements.includes(type))
        block.innerHTML += `
          <textarea></textarea>
        `;
    }
    else // not empty
      block.innerHTML += `
        <div class="dropzone"
          ondrop="builder_globals.handlers.drop(event)"
          ondragover="builder_globals.handlers.dragover(event)"
          ondragleave="builder_globals.handlers.dragleave(event)"
          part="dropzone"></div>
        <slot></slot>
      `;

    // ex:
    //  <div class="el blue-set" data-type="html" draggable="true" ondragstart="dragstart_handler(event)">

    // attribute set automatically
    block.draggable = "true";
    // TODO: ensure necessary changes:
    block.setAttribute("ondragstart", "builder_globals.handlers.dragstart(event)");

    if (builder_globals.no_attributes.includes(type))
      block.dataset.noAttributes = ""; // maybe not needed? maybe for CSS?
    
    // copy "set" attribute to class:
    // <tag set="foo"> -> <div class="el foo-set">
    block.className = "el " + this.getAttribute("set") + "-set";

    // used for embedded [text] nodes (on the node)
    if (this.hasAttribute("hidden"))
      block.classList.add("hidden");

    // used for embedded [text] nodes (on the parent)
    if (builder_globals.text_elements.includes(type))
      block.classList.add("text-content");
    
    // copy "type" attribute to "data-type":
    // <tag type="foo"> -> <div data-type="foo">
    block.dataset.type = type;
    
    // Create some CSS to apply to the shadow dom
    const style = document.createElement("link");
    style.href = "/builder/builder.css";
    style.rel = "stylesheet";

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(root);

    
  }
}

customElements.define("builder-element", BuilderElement);

class BuilderAttribute extends HTMLElement
{
  constructor()
  {
    // Always call super first in constructor
    super();
  }

  connectedCallback()
  {
    // Create a shadow root
    // This can happen twice if element is moved
    if (this.shadowRoot) return;
    
    const shadow = this.attachShadow({ mode: "open" });

    // Create spans
    const root = document.createElement("div");
    root.id = "builder-attribute";

    // <div class="attr" data-attribute-name="[custom]" draggable="true" ondragstart="dragstart_attribute_handler(event)">
    // <input class="builder-attr-name" oninput="update_value(event)"> = &quot;<input class="builder-attr-value" oninput="update_value(event)">&quot;
    // </div>

    const attr = document.createElement("div");
    root.append(attr);

    let type = this.getAttribute("type");

    if (type === 'style')
    {
      attr.innerHTML += `
        <span class="attr-style-label">style = </span>
        <div class="builder-property-set">
          <div class="builder-property-container"></div>
          <div
            class="builder-property-dropzone"
            ondragenter="onPropertyDragEnter(event)"
            ondragleave="onPropertyDragLeave(event)"
            ondrop="drop_property_handler(event)"
            ondragover="dragover_property_handler(event)">
          </div>
        </div>
      `;
    }
    else
    {
      if (type === '[custom]' || type === '[custom-empty]')
        attr.innerHTML = '<input class="builder-attr-name" oninput="update_value(event)">';
      else
        attr.innerHTML = type;

      attr.innerHTML += ' = &quot;<input class="builder-attr-value" oninput="update_value(event)">&quot;';
    }

    // ex:
    //  <div class="el blue-set" data-type="html" draggable="true" ondragstart="dragstart_handler(event)">

    attr.draggable = "true";
    // TODO: ensure necessary changes:
    attr.setAttribute("ondragstart", "builder_globals.handlers.dragstart_attribute(event)");
    
    // copy "set" attribute to class:
    // <tag set="foo"> -> <div class="el foo-set">
    attr.className = "attr";

    // copy "type" attribute to "data-type":
    // <tag type="foo"> -> <div data-type="foo">
    attr.dataset.type = type;
    
    // Create some CSS to apply to the shadow dom
    const style = document.createElement("link");
    style.href = "/builder/builder.css";
    style.rel = "stylesheet";

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(root);

    
  }
}

customElements.define("builder-attribute", BuilderAttribute);

// Create a class for the element
class BuilderBank extends HTMLElement
{
  constructor()
  {
    // Always call super first in constructor
    super();
  }

  connectedCallback()
  {
    // Create a shadow root
    // TODO: fix others to allow movement?
    // This can happen twice if element is moved
    if (this.shadowRoot) return;
    
    const shadow = this.attachShadow({ mode: "open" });

    // Create spans
    const root = document.createElement("div");
    root.id = "builder-bank";


    //<div id="bank" ondragenter="onTrashDragEnter(event)" ondragleave="onTrashDragLeave(event)" ondrop="drop_trash_handler(event)" ondragover="dragover_trash_handler(event)">
    
    root.innerHTML = `
<builder-element set="blue" type="!DOCTYPE html"></builder-element>

<br>

<builder-element set="blue" type="html"></builder-element>

<builder-element type="[text]">
<textarea></textarea>
</builder-element>

<details open class="builder-element-group">
<summary>Document metadata</summary>

<builder-element set="purple" type="head"></builder-element>

<builder-element set="purple" type="title">
</builder-element>

<builder-element set="purple" type="link"></builder-element>

<builder-element set="purple" type="style">
</builder-element>

<builder-element set="purple" type="script">
</builder-element>

</details>

<details open class="builder-element-group">
<summary>Document content</summary>

<builder-element set="green" type="body"></builder-element>

<!-- this is here (h1 below) because the clone function needs it empty -->
<!-- (see builder-files#addAttributes) -->
<!-- ...all no longer application -->

<builder-element set="green" type="h1"></builder-element>

<builder-element set="green" type="div"></builder-element>

<builder-element set="green" type="span"></builder-element>

<builder-element set="green" type="img"></builder-element>

<builder-element set="green" type="p"></builder-element>

<builder-element set="green" type="nav"></builder-element>

</details>

<details open class="builder-element-group">
<summary>Other elements</summary>

<builder-element set="gold" type="a"></builder-element>

<builder-element set="gold" type="form"></builder-element>

<builder-element set="gold" type="input"></builder-element>

<builder-element set="gold" type="option">
</builder-element>

<builder-element set="gold" type="br"></builder-element>

</details>

<builder-element set="red" type="[custom]">
</builder-element>

<builder-element set="red" type="[custom-empty]">
</builder-element>

</div>

<builder-attribute type="[custom]"></builder-attribute>

<builder-attribute type="href"></builder-attribute>

<builder-attribute type="src"></builder-attribute>

<builder-attribute type="width"></builder-attribute>

<builder-attribute type="style"></builder-attribute>

<div class="property" data-property-name="[custom]" draggable="true" ondragstart="dragstart_property_handler(event)">
<input class="builder-property-name" onchange="update_value(event)">: <input class="builder-property-value" onchange="update_value(event)">
</div>

<div class="property" data-property-name="font-size" draggable="true" ondragstart="dragstart_property_handler(event)">
font-size: <input class="builder-property-value" onchange="update_value(event)">
</div>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("link");
    style.href = "/builder/builder.css";
    style.rel = "stylesheet";
    
    const style2 = document.createElement("style");
    style2.innerText = ":host { display: block; }";

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(style2);
    shadow.appendChild(root);

    
  }
}

customElements.define("builder-bank", BuilderBank);
