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
  console.log(fe);
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

export function store_and_upload_code_file(file)
{
  opfs.store_code_file(file);
  api.upload_code_file(file);
}

export function store_and_upload_media_file(file)
{
  opfs.store_media_file(file);
  api.upload_media_file(file);
}

export function install_sw(sw)
{
  console.log(sw);
  navigator.serviceWorker.addEventListener("message", (message) => {
    console.log(message);
  });
  sw.postMessage("test42");
}

// initial actions

// retrieve project info (file list) from backend.
// if the project doesn't exist, it will be created.
export const files = await api.get_project();

// if we're offline, files could be null.
// if it exists, load the files into the opfs.
export const file_data = {};
if (files)
{
  fireEvent(events.files_loaded, files);
  
  for (const file of files[0])
  {
    const name = file.split("/").pop();
    file_data[file] = await api.get_code_file(name);
    opfs.store_code_file_data(name, file_data[file]);
  }
}