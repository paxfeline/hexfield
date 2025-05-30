import { post } from '@rails/request.js'

// create FormData object from search params
export function fd_from_sp()
{
  const fd = new FormData();
  const sp = new URLSearchParams(document.location.search);
  for (const [key, value] of sp.entries())
    fd.append(key, value);
  return fd;
}

// get info on this project (mainly: does it exist?)
export async function get_project()
{
  const fd = fd_from_sp();
  const response = await post('/api/get-project', {body: fd});
  const body = await response.json;
  console.log("GP body:", response.response.status, body);
  if (response.response.status == 404)
  {
    await create_project();
    return [[], []];
  }
  else
    // could go outside else, but new projs will be empty
    return await get_files();
}

// create this project if neededs
export async function create_project()
{
  const fd = fd_from_sp();
  const response = await post('/projects', {body: fd});
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
  const fd = fd_from_sp();
  const response = await post('/api/get-code-files', {body: fd});
  const body = await response.json;
  console.log("GP body:", response.response.status, body);
  return body;
}

// get media files in this project
export async function get_media_files()
{
  const fd = fd_from_sp();
  const response = await post('/api/get-media-files', {body: fd});
  const body = await response.json;
  console.log("GP body:", response.response.status, body);
  return body;
}

export async function upload_code_file(e)
{
  const fd = fd_from_sp(e.search_params);
  fd.append("code_file", e.file);
  const response = await post('/api/upload-code-file', {body: fd});
  const body = await response.json;
  console.log(body);
}