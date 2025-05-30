import * as api from "/hex/api.js";
import * as opfs from "/hex/opfs.js";

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

export const files = await api.get_project();

// coordinate OPFS and Google Cloud storage

export function store_and_upload_code_file(file)
{
  opfs.store_code_file(file);
  api.upload_code_file(file);
}