debugger;

/*
import { get, post } from '@rails/request.js';
*/

import { get_files } from '/hex/api.js';

get_files();

// create FormData object from search params
/*
function fd_from_sp(sp)
{
  const fd = new FormData();
  const sp = new URLSearchParams(sp);
  for (const [key, value] of sp.entries())
    fd.append(key, value);
  return fd;
}
*/

onmessage = async (e) => {
  console.log("Message received from main script", e);

  debugger;
  const opfsRoot = await navigator.storage.getDirectory();

  for await (const value of opfsRoot.values()) {
    console.log(value);
  }

  const fileHandle = await opfsRoot.getFileHandle(e.data.file.name, {
    create: true,
  });
  const syncAccessHandle = await fileHandle.createSyncAccessHandle();
  let data = await e.data.file.arrayBuffer();
  console.log(data);
  syncAccessHandle.write(data);
  syncAccessHandle.close();

  const fd = fd_from_sp(e.data.search_params);
  fd.append("code_file", e.data.file);
  const response = await post('/api/upload-code-file', {body: fd});
  const body = await response.text;
  console.log(body, request);

  postMessage("done boss!");
};


