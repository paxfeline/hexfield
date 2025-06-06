import * as util from "/hex/util.js";

export const foo = "foo42";

export async function store_code_file(file)
{
  let data = await file.arrayBuffer();
  store_code_file_data(file.name, data);
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

export async function store_code_file_data(name, data)
{
  const projDirectoryHandle = await get_proj_dir(true);
  const fileHandle = await projDirectoryHandle.getFileHandle(name, { create: true, });
  const writeable = await fileHandle.createWritable();
  writeable.write(data);
  writeable.close();
}

export async function get_code_file_data(name)
{

}