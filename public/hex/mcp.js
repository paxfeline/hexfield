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

export const supported_file_types =
  {
    code: ["text/html", "css", "js", "txt", "py"],
    media: ["png", "jpg", "jpeg", "gif"]
  };

// file not loaded symbol

export const file_not_loaded = Symbol("file not loaded");

// event types

export const events = [
  "files_loaded",             // initial files loaded
  "update_file_data",         // a file has been modified
  "file_selected",            // file selected
  "file_created",             // a file has been created
  "file_deleted",
  "connection_lost",
  "connection_restored",
  "sw_msg",
  "builder_built",
].reduce(
  (obj, val) => {obj[val] = Symbol(val); return obj;},
  {}
)

const firedEvents = {};

// associate events with callbacks to invoke

export const eventClientMap = {};

export function fireEvent(e, data)
{
  //console.log("hex fire event", ...arguments);
  eventClientMap[e]?.forEach(cb => cb(data));
  firedEvents[e] = data;
}

export function regHexEvent(e, cb)
{
  eventClientMap[e] = [...(eventClientMap[e] || []), cb];

  //console.log("hex reg event", ...arguments); // Safari can't handle converting symbols to strings?

  // catch up with previous events
  let fe = firedEvents[e];
  //console.log("firing stored event:", e, fe); // ibid
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

export async function store_and_upload_files(dir_path, files)
{
  Array.from(files).forEach(
    async file =>
    {
      let data = await opfs.store_file(dir_path, file);
      let text = new TextDecoder().decode(data);
      file_data[dir_path + file.name] = text;
    });
  const upfiles = await api.upload_files(dir_path, files);
  upfiles.forEach(
    async file =>
    {
      last_saved_data[file] = file_data[file];
    });
  return upfiles;
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
export let current_file_type;
export let current_dir_path;

export function current_file_is_text()
{
  return supported_file_types.code.includes(current_file_type);
}

export function register_html_editor(editor)
{
  html_editor = editor;
  regHexEvent(events.file_selected,
    ({path, type}) =>
    {
      console.log("selected file", path, type);
      // store any changes before switching
      if (current_file_url && current_file_is_text())
      {
        const code = html_editor.state.doc.toString();
        file_data[current_file_url] = code;
      }
      //console.log(path);
      current_file_url = path;
      current_file_type = type;
      if (current_file_is_text())
        update_html_code_editor(file_data[current_file_url]);
      else
        update_html_code_editor("<not a recognized text format>");

      // TODO: create event for switching selected dir
      // extract path up to file name as working dir
      let m = current_file_url.match(/((?:[^/]+\/)+).*/);
      const [_, dir_path] = m;
      current_dir_path = dir_path;
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
  const file = await opfs.store_file_data(current_file_url, code);
  // TODO: maybe: class for URLs that will give directory path and name together or seprately
  file_data[current_file_url] = code;
  await api.upload_files(current_dir_path, [file]);
  last_saved_data[current_file_url] = code;
  
  fireEvent(events.update_file_data);
}

export async function create_code_file(dir_path)
{
  let name = prompt("Enter a file name:\nWarning: Entering an existing file name will overwrite it with a blank file.")
  
  if (name)
  {
    let file = await opfs.create_code_file(dir_path, name);
    let [path] = await api.upload_files([file]);
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
  console.log("mcp, loading files", files);

  const folder_delve = async (folder) =>
  {
    folder.items.forEach(
      file =>
      {
        const [all, name, ext] = file.name.match(/(?:[^\/]+\/)+([^\.]*\.?(.*))$/);
        console.log(all, name, ext);
        if (name === "") return; else console.log(name === "", name, "");
        file_data[file.name] = last_saved_data[file.name] = null; //file_not_loaded;

        // aysnc load
        const load_file = async () =>
        {
          console.log("file loaded", file.name);
          file_data[file.name] = last_saved_data[file.name] = await api.get_code_file(file.name)
          opfs.store_file_data(file.name, last_saved_data[file.name]); // async
        };
        load_file();
      }
    );

    for (const subfolder of folder.folders)
    {
      folder_delve(subfolder);
    }
  };

  folder_delve(files);
  
  fireEvent(events.files_loaded, files);
}