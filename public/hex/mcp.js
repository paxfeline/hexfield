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
]
.forEach(x => events[x] = Symbol(x));

// associate events with callbacks to invoke

export const eventClientMap = {};

function fireEvent(e, data)
{
  eventClientMap[e]?.forEach(cb => cb(data))
}

export function regHexEvent(e, cb)
{
  eventClientMap[e] = [...(eventClientMap[e] || []), cb];

  console.log("hex reg event", ...arguments);

  // this special event will trigger the cb when its registered if appropriate
  if (e == events.files_loaded && files)
  {
    fireEvent(e, files);
  }
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

// initial actions

export const files = await api.get_project();

export const file_data = {};
for (const file of files[0])
{
  const name = file.split("/").pop();
  file_data[name] = await api.get_code_file(name);
  opfs.store_code_file_data(name, file_data[name]);
}

console.log(file_data);