import { post, patch } from '@rails/request.js'
import * as util from "/hex/util.js";

// get info on this project (mainly: does it exist?)
export async function get_project()
{
  const body = util.fd_from_sp();
  const response = await post('/api/get-project', {body});
  if (!response)
    return null;

  // TODO: better error handling
  if (![200, 404].includes(response.response.status)) return {items: [], folders: []};
  
  if (response.response.status == 404)
  {
    console.log("GP: creating")
    await create_project();
  }
  
  return await get_files();
}

// create this project if neededs
export async function create_project()
{
  const body = util.fd_from_sp();
  const response = await post('/projects', {body});
  if (response.response.status == 200)
  {
    const resp_body = await response.text;
    console.log("CP body:", response.response.status, resp_body);
  }
  else
  {
    console.error("CP error:", response);
    return;
  }
}


// get all files in this project
export async function get_files()
{
  const body = util.fd_from_sp();
  const response = await post('/api/get-all-files', {body});
  if (response.response.status == 200)
  {
    console.log("GAF status:", response.response.status);
    const resp_body = await response.json;
    console.log("GAF output:", resp_body);
    return resp_body;
  }
  else
  {
    console.error("GAF error:", response);
    return;
  }
}

export async function update_project()
{
  const body = util.fd_from_sp();
  const response = await patch(`/projects/${body.get("project[name]")}`, {body});
  if (response.response.status == 200)
  {
    const resp_body = await response.json;
    console.log("GMF body:", response.response.status, resp_body);
    return resp_body;
  }
  else
  {
    console.error("GMF error:", response);
    return;
  }
}

export async function upload_files(dir_path, files)
{
  const body = util.fd_from_sp();
  Array.from(files).forEach(file => body.append("code_file[]", file));
  body.append("dir_path", dir_path);
  const response = await post('/api/upload-code-files', {body});
  if (response.response.status == 200)
  {
    const resp_body = await response.json;
    console.log("UCF body", resp_body);
    return resp_body.uploaded;
  }
  else
  {
    console.error("GMF error:", response);
    return;
  }
}

export async function upload_media_files(files)
{
  const body = util.fd_from_sp();
  Array.from(files).forEach(file => body.append("media_file[]", file));
  const response = await post('/api/upload-media-files', {body});
  if (response.response.status == 200)
  {
    const resp_body = await response.json;
    console.log(resp_body);
    return resp_body.uploaded;
  }
  else
  {
    console.error("GMF error:", response);
    return;
  }
}

// get code file in this project
export async function get_code_file(file_name)
{
  // don't need search params anymore, just use full file path
  // const body = util.fd_from_sp();
  // body.append("file_name", name)
  console.log("get file", file_name)
  const response = await post('/api/get-file', {body: {file_name}});
  if (response.response.status == 200)
  {
    const resp_text = await response.text;
    return resp_text;
  }
  else
  {
    console.error("GMF error:", response);
    return "<File Load Error>";
  }
}