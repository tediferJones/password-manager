import { Methods } from "@/types"

export default async function easyFetch(route: string, method: Methods, body?: any, retryCount = 0) {
  return fetch(route, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then(res => res.json())
    .catch(() => {
      if(retryCount < 5) easyFetch(route, method, body, retryCount + 1)
    });
}
