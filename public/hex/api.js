import { post } from '@rails/request.js'
import * as util from "/hex/util.js";

// uses rails/request.js post function, passing an AbortSignal object
// that will timeout after 5 seconds.
// Returns the response to the post, or null.
export async function post_with_timeout(url, data) {
  try
  {
    const ret = await post(url, {body: data, signal: AbortSignal.timeout(5000)});
    sw.postMessage("fetch success")
    return ret;
  }
  catch (error)
  {
    console.log(error);
    console.log(error.name);
    console.log(error.message);
    console.log(typeof(error));
    if (error.name === "TimeoutError")
      sw.postMessage("fetch timeout");
    return null;
  }
}

// get info on this project (mainly: does it exist?)
export async function get_project()
{
  const fd = util.fd_from_sp();
  const response = await post_with_timeout('/api/get-project', fd);
  if (!response)
    return null;
  if (response.response.status == 404)
  {
    await create_project();
    return [[], []];
  }
  else
  {
    const body = await response.json;
    console.log("GP body:", response.response.status, body);
    // could go outside else, but new projs will be empty
    return await get_files();
  }
}

// create this project if neededs
export async function create_project()
{
  const fd = util.fd_from_sp();
  const response = await post_with_timeout('/projects', fd);
  const body = await response.text;
  console.log("GP body:", response.response.status, body);
}

// get code and media files
export async function get_files()
{
  return await Promise.all([
    get_code_files(),
    get_media_files()
  ]);
}

// get code files in this project
export async function get_code_files()
{
  const fd = util.fd_from_sp();
  const response = await post_with_timeout('/api/get-code-files', fd);
  const body = await response.json;
  console.log("GP body:", response.response.status, body);
  return body;
}

// get media files in this project
export async function get_media_files()
{
  const fd = util.fd_from_sp();
  const response = await post_with_timeout('/api/get-media-files', fd);
  const body = await response.json;
  console.log("GP body:", response.response.status, body);
  return body;
}

export async function upload_code_file(file)
{
  const fd = util.fd_from_sp();
  fd.append("code_file", file);
  const response = await post_with_timeout('/api/upload-code-file', fd);
  const body = await response.json;
  console.log(body);
}

export async function upload_media_file(file)
{
  const fd = util.fd_from_sp();
  fd.append("media_file", file);
  const response = await post_with_timeout('/api/upload-media-file', fd);
  const body = await response.json;
  console.log(body);
}

// get code file in this project
export async function get_code_file(name)
{
  const fd = util.fd_from_sp();
  fd.append("file_name", name)
  const response = await post_with_timeout('/api/get-code-file', fd);
  const body = await response.json;
  //console.log("GP body:", response.response.status, body);
  return body.body;
}