import * as api from "/hex/api.js";

export const eventClientMap = {};

export const events = {};
[
  "code_files_loaded",
  "media_files_loaded",
  "files_initial_load"
]
.forEach(x => events[x] = Symbol(x));


export function addEventListener(e, cb)
{
  eventClientMap[e] = [...(eventClientMap[e] || []), cb];
  console.log("hex reg event", ...arguments);

  // this special event will trigger the cb when its registered if appropriate
  if (e == events.files_initial_load && files)
  {
    fireEvent(e, files);
    removeEventListener(e, cb);
  }
}

export function removeEventListener(e, cb)
{
  eventClientMap[e] = (eventClientMap[e] ?
    eventClientMap[e].filter(el => el != cb) :
    []);
}

export const files = await api.get_project();

function fireEvent(e, data)
{
  eventClientMap[e]?.forEach(cb => cb(data))
}

console.log("files loaded", files)