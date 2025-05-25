onmessage = async (e) => {
  debugger;
  console.log("Message received from main script", e);
  if (false)
  {
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle("my-high-speed-file.txt", {
      create: true,
    });
    const syncAccessHandle = await fileHandle.createSyncAccessHandle();

  }
};


