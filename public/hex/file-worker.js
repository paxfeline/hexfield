onmessage = async (e) => {
  console.log("Message received from main script", e);

  debugger;
  const opfsRoot = await navigator.storage.getDirectory();

  for await (const value of opfsRoot.values()) {
    console.log(value);
  }

  const fileHandle = await opfsRoot.getFileHandle(e.data[0].name, {
    create: true,
  });
  const syncAccessHandle = await fileHandle.createSyncAccessHandle();
  let data = await e.data[0].arrayBuffer();
  console.log(data);
  syncAccessHandle.write(data);
  syncAccessHandle.close();

  postMessage("done boss!");
};


