export async function store_code_file(file)
{
  const sp = new URLSearchParams(document.location.search);
  console.log("project", sp.get("project[name]"), sp);

  // to properly store this, we need to also get the user id from the backend

  const opfsRoot = await navigator.storage.getDirectory();
  const fileHandle = await opfsRoot.getFileHandle(file.name, {
    create: true,
  });
  const writeable = await fileHandle.createWritable();
  let data = await file.arrayBuffer();
  console.log(data);
  writeable.write(data);
  writeable.close();
}

export async function get_code_file_data(path)
{

}