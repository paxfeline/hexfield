export async function store_code_file(file)
{
  let data = await file.arrayBuffer();
  store_code_file_data(file.name, data);
}

export async function store_code_file_data(name, data)
{
  const opfsRoot = await navigator.storage.getDirectory();
  const tmpDirectoryHandle = await opfsRoot.getDirectoryHandle("tmp", { create: true, });
  const fileHandle = await tmpDirectoryHandle.getFileHandle(name, { create: true, });
  const writeable = await fileHandle.createWritable();
  console.log(data);
  writeable.write(data);
  writeable.close();
}

export async function get_code_file_data(name)
{

}