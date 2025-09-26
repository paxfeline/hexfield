import * as util from "/hex/util.js";

export const foo = "foo42";

export async function store_code_file(file)
{
  let data = await file.arrayBuffer();
  store_code_file_data(file.name, data);
  return data;
}

export async function store_media_file(file)
{
  let data = await file.arrayBuffer();
  store_media_file_data(file.name, data);
}

export async function get_proj_dir(create = false)
{
  const sp = util.search_params();
  const userId = sp.get("project[owner]");
  const projectName = sp.get("project[name]");

  const opfsRoot = await navigator.storage.getDirectory();
  const userDirectoryHandle = await opfsRoot.getDirectoryHandle(
    userId,
    { create }
  );
  return await userDirectoryHandle.getDirectoryHandle(
    projectName,
    { create }
  );
}

export async function get_media_dir(create = false)
{
  const proj_dir = await get_proj_dir(true);
  return await proj_dir.getDirectoryHandle("media", { create });
}

export async function store_code_file_data(name, data)
{
  try
  {
    const projDirectoryHandle = await get_proj_dir(true);
    const fileHandle = await projDirectoryHandle.getFileHandle(name, { create: true, });
    const writeable = await fileHandle.createWritable();
    if (data !== null)
      await writeable.write(data);
    await writeable.close();
    return await fileHandle.getFile();
  } catch (err) {
    console.error(err.name, err.message, err);
  }
}

export async function store_media_file_data(name, data)
{
  const projDirectoryHandle = await get_media_dir(true);
  const fileHandle = await projDirectoryHandle.getFileHandle(name, { create: true, });
  const writeable = await fileHandle.createWritable();
  writeable.write(data);
  writeable.close();

  return fileHandle.getFile();
}

export async function get_code_file_data(name)
{
  // not needed yet
}

export async function create_code_file(name)
{
  return store_code_file_data(name, null);
}