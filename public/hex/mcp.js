import * as api from "/hex/api.js";

export const eventClientMap = {};

export const events = {
  "code-files-loaded": Symbol("code-files-loaded"),
  "media-files-loaded": Symbol("media-files-loaded"),
}

export function addEventListener(e, cb)
{
  eventClientMap[e] = [...(eventClientMap[e] || []), cb];
}

export function removeEventListener(e, cb)
{
  eventClientMap[e] = (eventClientMap[e] ?
    eventClientMap[e].filter(el => el != cb) :
    []);
}

const files = await api.get_project();