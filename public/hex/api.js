import { post, patch } from '@rails/request.js'
import * as util from "/hex/util.js";

// get info on this project (mainly: does it exist?)
export async function get_project()
{
  const body = util.fd_from_sp();
  const response = await post('/api/get-project', {body});
  if (!response)
    return null;
  if (response.response.status == 404)
  {
    console.log("GP: creating")
    await create_project();
    return [[], []];
  }
  else if (response.response.status == 200)
  {
    const resp_body = await response.json;
    console.log("GP body:", resp_body);
    // could go outside else, but new projs will be empty
    return await get_files();
  }
  else
  {
    console.error("GP error:", body);
    return;
  }
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

// TODO: streamline
// get code and media files
export async function get_files()
{
  return await get_all_files();
  // return await Promise.all([
  //   get_code_files(),
  //   get_media_files()
  // ]);
}

// get all files in this project
export async function get_all_files()
{
  const body = util.fd_from_sp();
  const response = await post('/api/get-all-files', {body});
  if (response.response.status == 200)
  {
    const resp_body = await response.json;
    console.log("GAF body:", response.response.status, resp_body);
    let out = {};
    // Object.defineProperty(out, "folders", {value: resp_body.folders});
    // // create folders:
    // for (const item of resp_body.folders)
    // {
    //     const parts = item.path.split("/").slice(2); // item.name = path
    //     let cur = out;
    //     const last = parts.pop();
    //     for (let i = 0; i < parts.length; i++)
    //     {
    //         if (cur[parts[i]] === undefined)
    //             cur[parts[i]] = {};
    //         cur = cur[parts[i]];
    //     }
    //     if (last !== "") console.log("folder error 1 / ", last);
    // }
    // // add files:
    // for (const item of resp_body.items)
    // {
    //     // get path parts and discard the user id and project name
    //     // TODO: check these values and ensure correctness
    //     const prefix = item.name.split("/").slice(0, 2).join("/"); // user id and project
    //     Object.defineProperty(out, "prefix", {value: prefix});
    //     const parts = item.name.split("/").slice(2); // item.name = path
    //     let cur = out;
    //     const last = parts.pop();
    //     for (let i = 0; i < parts.length; i++)
    //     {
    //         if (cur[parts[i]] === undefined) console.log("folder error 2")
    //         cur = cur[parts[i]];
    //     }
    //     if (last === "") console.log("folder error 3");
    //     cur[last] = last.includes(".") ? last.split(".").at(-1) : "data file";
    // }
    out = resp_body;
    console.log("GAF output:", out);
    return out;
  }
  else
  {
    console.error("GAF error:", response);
    return;
  }
}

// get code files in this project
// export async function get_code_files()
// {
//   const body = util.fd_from_sp();
//   const response = await post('/api/get-code-files', {body});
//   if (response.response.status == 200)
//   {
//     const resp_body = await response.json;
//     console.log("GCF body:", response.response.status, resp_body);
//     return resp_body;
//   }
//   else
//   {
//     console.error("GFC error:", response);
//     return;
//   }
// }

// get media files in this project
// export async function get_media_files()
// {
//   const body = util.fd_from_sp();
//   const response = await post('/api/get-media-files', {body});
//   if (response.response.status == 200)
//   {
//     const resp_body = await response.json;
//     console.log("GMF body:", response.response.status, resp_body);
//     return resp_body;
//   }
//   else
//   {
//     console.error("GMF error:", response);
//     return;
//   }
// }

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

export async function upload_code_files(files)
{
  const body = util.fd_from_sp();
  Array.from(files).forEach(file => body.append("code_file[]", file));
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
export async function get_code_file(name)
{
  const body = util.fd_from_sp();
  body.append("file_name", name)
  const response = await post('/api/get-file', {body});
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