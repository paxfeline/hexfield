import * as api from "/hex/api.js";
import * as opfs from "/hex/opfs.js";

/*
  Loading a project while signed in copies its files
  from the cloud to the opfs.
  When signing out, the opfs temp files are removed.
  
  Projects can also be created while signed out.
  These will use a user with id "local", and these
  projects will also be stored in the opfs and will persist.
*/

// event types

export const events = {};
[
  "files_loaded",
  "connection_lost",
  "connection_restored",
  "sw_msg",
  "load_code_file_text",
  "update_file_data",
  "builder_built",
]
.forEach(x => events[x] = Symbol(x));

const firedEvents = {};

// associate events with callbacks to invoke

export const eventClientMap = {};

export function fireEvent(e, data)
{
  console.log("hex fire event", ...arguments);
  eventClientMap[e]?.forEach(cb => cb(data));
  firedEvents[e] = data;
}

export function regHexEvent(e, cb)
{
  eventClientMap[e] = [...(eventClientMap[e] || []), cb];

  console.log("hex reg event", ...arguments);

  // catch up with previous events
  let fe = firedEvents[e];
  console.log("firing stored event:", e, fe);
  if (fe)
    cb(fe)
}

export function remHexEvent(e, cb)
{
  eventClientMap[e] = (eventClientMap[e] ?
    eventClientMap[e].filter(el => el != cb) :
    []);
}

// coordinate OPFS and Google Cloud storage

export async function store_and_upload_code_files(files)
{
  Array.from(files).forEach(
    async file =>
    {
      let data = await opfs.store_code_file(file);
      let text = new TextDecoder().decode(data);
      file_data[file.name] = text;
    });
  const resp = await api.upload_code_files(files);
  // this could be done more efficiently,
  // but it's broken up to enable better error handling
  Array.from(files).forEach(
    async file =>
    {
      last_saved_data[file.name] = file_data[file.name];
    });
  return resp;
}

export async function store_and_upload_media_files(files)
{
  Array.from(files).forEach(file => opfs.store_media_file(file));
  return await api.upload_media_files(files);
}

// TODO: check: used?
export function install_sw(sw)
{
  console.log(sw);
  navigator.serviceWorker.addEventListener("message", (message) => {
    console.log(message);
  });
  sw.postMessage("test42");
}

export let html_editor;
export let current_file_url;
export let current_file_name;
export function register_html_editor(editor)
{
  html_editor = editor;
  regHexEvent(events.load_code_file_text,
    data =>
    {
      // store any changes before switching
      const code = html_editor.state.doc.toString();
      file_data[current_file_name] = code;
      //console.log(data);
      current_file_url = data;
      current_file_name = data.split("/").pop();
      update_html_code_editor(file_data[current_file_name]);
    });
}

export function update_html_code_editor(code)
{
  let transaction = html_editor.state.update({
    changes: {
      from: 0,
      to: html_editor.state.doc.length,
      insert: code
    }
  });
  const update = html_editor.state.update(transaction);
  html_editor.update([update]);
}

export async function update_html_code_file()
{
  const code = html_editor.state.doc.toString();
  const file = await opfs.store_code_file_data(current_file_name, code);
  file_data[current_file_name] = code;
  await api.upload_code_files([file]);
  last_saved_data[current_file_name] = code;
  
  fireEvent(events.update_file_data);
}

export async function create_code_file()
{
  let name = prompt("Enter a file name:\nWarning: Entering an existing file name will overwrite it with a blank file.")
  
  if (name)
  {
    let file = await opfs.create_code_file(name);
    let [path] = await api.upload_code_files([file]);
    return path;
  }
}

export async function update_project()
{
  api.update_project();
}

// initial actions:

// retrieve project info (file list) from backend.
// if the project doesn't exist, it will be created.
export const files = await api.get_project();

// if we're offline, files could be null.
// if it exists, load the files into the opfs.
export const file_data = {};
export const last_saved_data = {};
if (files)
{
  fireEvent(events.files_loaded, files);
  
  // files[0] = code files
  for (const file of files[0])
  {
    const name = file.split("/").pop();
    const data = await api.get_code_file(name);
    file_data[name] = last_saved_data[name] = data;
    await opfs.store_code_file_data(name, last_saved_data[name]); // maybe skip await?
  }
}