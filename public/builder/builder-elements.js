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
    this.shadow = shadow;

    // Create spans
    const root = document.createElement("div");
    root.id = "root";

    let type = this.getAttribute("type");
    if (builder_globals.empty_elements.includes(type))
    {
      if (builder_globals.text_elements.includes(type))
        root.innerHTML = `
          <textarea></textarea>
        `;
    }
    else
      root.innerHTML = `
        <slot></slot>
        <div class="dropzone"></div>
      `;

    // ex:
    //  <div class="el blue-set" data-type="html" draggable="true" ondragstart="dragstart_handler(event)">

    root.draggable = "true";
    // TODO: ensure necessary changes:
    root.setAttribute("ondragstart", "builder_globals.handlers.dragstart(event)");

    if (this.hasAttribute("no-attributes"))
      root.dataset.noAttributes = "";

    // copy "set" attribute to class:
    // <tag set="foo"> -> <div class="el foo-set">
    root.className = "el " + this.getAttribute("set") + "-set";
    
    // copy "type" attribute to "data-type":
    // <tag type="foo"> -> <div data-type="foo">
    root.dataset.type = type;
    
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
    this.shadow = shadow;

    // Create spans
    const root = document.createElement("div");
    root.id = "root";

    //<div id="bank" ondragenter="onTrashDragEnter(event)" ondragleave="onTrashDragLeave(event)" ondrop="drop_trash_handler(event)" ondragover="dragover_trash_handler(event)">
    
    root.innerHTML = `
<div class="property" data-property-name="[custom]" draggable="true" ondragstart="dragstart_property_handler(event)">
<input class="builder-property-name" onchange="update_value(event)">: <input class="builder-property-value" onchange="update_value(event)">
</div>

<div class="property" data-property-name="font-size" draggable="true" ondragstart="dragstart_property_handler(event)">
font-size: <input class="builder-property-value" onchange="update_value(event)">
</div>

<div class="attr" data-attribute-name="[custom]" draggable="true" ondragstart="dragstart_attribute_handler(event)">
<input class="builder-attr-name" oninput="update_value(event)"> = &quot;<input class="builder-attr-value" oninput="update_value(event)">&quot;
</div>

<div class="attr" data-attribute-name="href" draggable="true" ondragstart="dragstart_attribute_handler(event)">
href = &quot;<input class="builder-attr-value" oninput="update_value(event)">&quot;
</div>

<div class="attr" data-attribute-name="src" draggable="true" ondragstart="dragstart_attribute_handler(event)">
src = &quot;<input class="builder-attr-value" oninput="update_value(event)">&quot;
</div>

<div class="attr" data-attribute-name="width" draggable="true" ondragstart="dragstart_attribute_handler(event)">
width = &quot;<input class="builder-attr-value" oninput="update_value(event)">&quot;
</div>


<div class="attr" data-attribute-name="style" draggable="true" ondragstart="dragstart_attribute_handler(event)">
<span class="attr-style-label">style = </span>
<div class="builder-property-set">
<div class="builder-property-container"></div>
<div class="builder-property-dropzone" ondragenter="onPropertyDragEnter(event)" ondragleave="onPropertyDragLeave(event)" ondrop="drop_property_handler(event)" ondragover="dragover_property_handler(event)"></div>
</div>
</div>

<div class="el blue-set" data-type="!DOCTYPE html" data-self-closing data-no-attributes draggable="true" ondragstart="dragstart_handler(event)"></div>

<br>

<builder-element set="blue" type="html"></builder-element>

<builder-element type="[text]" no-attributes>
<textarea onchange=""></textarea>
</builder-element>

<div class="el" data-type="[text]" data-no-attributes draggable="true" ondragstart="dragstart_handler(event)">
<textarea onchange=""></textarea>
</div>

<details open class="builder-element-group">
<summary>Document metadata</summary>

<div class="el purple-set" data-type="head" draggable="true" ondragstart="dragstart_handler(event)">
<div class="dropzone"></div>
</div>

<div class="el purple-set text-content" data-type="title" draggable="true" ondragstart="dragstart_handler(event)">
<div class="el hidden" data-type="[text]">
<textarea onchange=""></textarea>
</div>
</div>

<div class="el purple-set" data-type="link" data-self-closing draggable="true" ondragstart="dragstart_handler(event)">
</div>

<div class="el purple-set text-content" data-type="style" draggable="true" ondragstart="dragstart_handler(event)">
<div class="el hidden" data-type="[text]">
<textarea></textarea>
</div>
</div>

<div class="el purple-set text-content" data-type="script" draggable="true" ondragstart="dragstart_handler(event)">
<div class="el hidden" data-type="[text]">
<textarea></textarea>
</div>
</div>

</details>

<details open class="builder-element-group">
<summary>Document content</summary>

<div class="el green-set" data-type="body" draggable="true" ondragstart="dragstart_handler(event)">
<div class="dropzone"></div>
</div>

<!-- this is here (h1 below) because the clone function needs it empty -->
<!-- (see builder-files#addAttributes) -->

<div class="el green-set" data-type="h1" draggable="true" ondragstart="dragstart_handler(event)">
<div class="dropzone"></div>
</div>

<div class="el green-set" data-type="h1" draggable="true" ondragstart="dragstart_handler(event)">
<div class="dropzone"></div>
<div class="el green-set" data-type="[text]" data-no-attributes draggable="true" ondragstart="dragstart_handler(event)">
<textarea onchange="renderCode(); render();"></textarea>
</div>
<div class="dropzone"></div>
</div>

<div class="el green-set" data-type="div" draggable="true" ondragstart="dragstart_handler(event)">
<div class="dropzone"></div>
</div>

<div class="el green-set" data-type="span" draggable="true" ondragstart="dragstart_handler(event)">
<div class="dropzone"></div>
</div>

<div class="el green-set" data-type="img" data-self-closing draggable="true" ondragstart="dragstart_handler(event)">
</div>

<div class="el green-set" data-type="p" draggable="true" ondragstart="dragstart_handler(event)">
<div class="dropzone"></div>
</div>

<div class="el green-set" data-type="nav" draggable="true" ondragstart="dragstart_handler(event)">
<div class="dropzone"></div>
</div>

</details>

<details open class="builder-element-group">
<summary>Other elements</summary>

<div class="el gold-set" data-type="a" draggable="true" ondragstart="dragstart_handler(event)">
<div class="dropzone"></div>
</div>

<div class="el gold-set" data-type="form" draggable="true" ondragstart="dragstart_handler(event)">
<div class="dropzone"></div>
</div>

<div class="el gold-set" data-type="input" data-self-closing draggable="true" ondragstart="dragstart_handler(event)">
</div>

<div class="el gold-set text-content" data-type="option" draggable="true" ondragstart="dragstart_handler(event)">
<div class="el hidden" data-type="[text]">
<textarea onchange="renderCode(); render();"></textarea>
</div>
</div>

<div class="el gold-set" data-type="br" data-self-closing draggable="true" ondragstart="dragstart_handler(event)">
</div>

</details>

<div class="el red-set text-content" data-type="[custom]" draggable="true" ondragstart="dragstart_handler(event)">
<div class="builder-custom-el">Type: <input class="builder-custom-type" onchange="renderCode(); render();"></div>
<div class="dropzone"></div>
</div>

<div class="el red-set" data-type="[custom-empty]" data-self-closing draggable="true" ondragstart="dragstart_handler(event)">
<div class="builder-custom-el">Type: <input class="builder-custom-type" onchange="renderCode(); render();"></div>
</div>

</div>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("link");
    style.href = "/builder/builder.css";
    style.rel = "stylesheet";

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(root);

    
  }
}

customElements.define("builder-bank", BuilderBank);
