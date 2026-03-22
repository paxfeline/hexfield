// create FormData object from search params
export function search_params()
{
  return new URLSearchParams(document.location.search);
}

export function fd_from_sp()
{
  const sp = search_params();
  const fd = new FormData();
  for (const [key, value] of sp.entries())
    fd.append(key, value);
  return fd;
}

export function base_project_path()
{
  const sp = search_params();
  return `${sp.get("project[owner_id]")}/${sp.get("project[name]")}/`
}