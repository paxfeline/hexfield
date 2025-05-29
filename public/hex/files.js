// Create a class for the element
class HexFiles extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();
  }

  connectedCallback()
  {
    let myWorker;

    if (window.Worker)
    {
      myWorker = new Worker("/hex/file-worker.js");
      myWorker.onmessage = (e) => {
        console.log("Message received from worker", e);
      };
    }

    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });

    // Create spans
    const root = document.createElement("div");
    root.id = "root";

    root.innerHTML = `
      <div id="file-display">
      </div>
      <div id="controls">
        <input type="file" id="file-input">
        <button id="upload-btn">
          Upload
        </button>
      </div>
    `;

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");

    style.textContent = `
      #root
      {
        display: flex;
      }
    `;

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
    shadow.appendChild(root);

    shadow.querySelector("#upload-btn").addEventListener(
      "click",
      () =>
      {
        myWorker?.postMessage(
          shadow.querySelector('#file-input').files
        );
      }
    )
  }
}

customElements.define("hex-files", HexFiles);
