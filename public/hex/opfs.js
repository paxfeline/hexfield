export async function store_code_file(e)
{
  const sp = new URLSearchParams(document.location.search);
  console.log("project", sp.get("project[name]"), sp);
  const opfsRoot = await navigator.storage.getDirectory();
  const fileHandle = await opfsRoot.getFileHandle(e.file.name, {
    create: true,
  });
  const writeable = await fileHandle.createWritable();
  let data = await e.file.arrayBuffer();
  console.log(data);
  writeable.write(data);
  writeable.close();
}