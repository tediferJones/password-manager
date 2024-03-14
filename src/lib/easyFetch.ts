import { Methods } from "@/types"

export default async function easyFetch(route: string, method: Methods, body?: any, noJSON?: boolean,retryCount = 0) {
  return fetch(route, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).then(res => noJSON ? res : res.json())
    .catch(() => {
      if(retryCount < 5) easyFetch(route, method, body, noJSON, retryCount + 1)
    });
}
