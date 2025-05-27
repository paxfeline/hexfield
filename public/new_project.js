
import { FetchRequest } from '@rails/request.js'

export async function doot() {
  const form = document.querySelector("form");
  const fd = new FormData(form);
  const request = new FetchRequest('post', '/projects', {body: fd})
  const response = await request.perform()
  if (response.ok) {
    const body = await response.text
  }
  else
    console.log("error", response);
}