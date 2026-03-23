import * as util from "/hex/util.js";

export async function store_file(dir_path, file)
{
  let data = await file.arrayBuffer();
  const full_path = dir_path + file.name;
  console.log("store file", full_path);
  store_file_data(full_path, data);
  return data;
}

export async function get_proj_dir(create = false)
{
  const sp = util.search_params();
  const userId = sp.get("project[owner_id]");
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

export const opfs_folder_by_path = {};

export async function delve_folder(path, folder, index=0)
{
  if (!folder)
    folder = await navigator.storage.getDirectory();

  const new_index = path.indexOf("/", index); //path_array.shift();
  if (new_index === -1) //(path_array.length == 0)
  {
    const cur = path.substring(index);
    return [folder, cur];
  }
  else
  {
    const cur = path.substring(index, new_index);
    const subpath = path.substring(0, new_index + 1);
    let subfolder;
    if (opfs_folder_by_path[subpath])
      subfolder = opfs_folder_by_path[subpath];
    else
    {
      subfolder = await folder.getDirectoryHandle( cur, { create: true } );
      opfs_folder_by_path[subpath] = subfolder;
    }
    return delve_folder(path, subfolder, new_index + 1);
  }
}

export async function store_file_data(file_path, data)
{
  try
  {
    // no longer used? just use full paths instead?
    // const projDirectoryHandle = await get_proj_dir(true);

    //const file_path = name.split("/").slice(2);
    // const [container_folder, file_name] = await delve_folder(projDirectoryHandle, file_path);
    const stuff = await delve_folder(file_path);
    console.log(stuff);
    const [container_folder, file_name] = stuff;
    const fileHandle = await container_folder.getFileHandle(file_name, { create: true, });
    const writeable = await fileHandle.createWritable();
    if (data !== null)
      await writeable.write(data);
    await writeable.close();
    return await fileHandle.getFile();
  } catch (err) {
    console.error(err.name, err.message, err, file_path);
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
  // TODO: remove, unneeded?
}

export async function create_code_file(dir_path, name)
{
  return store_file_data(dir_path + name, null);
}