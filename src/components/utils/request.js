/*export default async function request(url, method, data = {}, auth = false) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  if (auth) {
    const token = localStorage.getItem("token");
    console.log("Token dans request:", token);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  const response = await fetch(url, {
    method,
    headers,
    body: method === "GET" ? null : JSON.stringify(data),
  });

  return { data: await response.json(), status: response.status };
}
*/
export default async function request(url, method, data = null, auth = false) {
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers,
  };

  if (method !== "GET" && data !== null) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  let responseData = null;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  }

  return {
    status: response.status,
    data: responseData,
  };
}
