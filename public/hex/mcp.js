import * as api from "/hex/api.js";

export const eventClientMap = {};

export const events = {};
[
  "files_loaded",
]
.forEach(x => events[x] = Symbol(x));


export function regHexEvent(e, cb)
{
  eventClientMap[e] = [...(eventClientMap[e] || []), cb];
  console.log("hex reg event", ...arguments);

  // this special event will trigger the cb when its registered if appropriate
  if ((e == events.files_loaded) && files)
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

function fireEvent(e, data)
{
  eventClientMap[e]?.forEach(cb => cb(data))
}

console.log("files loaded", files)