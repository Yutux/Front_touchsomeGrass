
export default async function request(url, method, data = {}, auth) {
    
    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": auth ? `Bearer ${localStorage.getItem("token")}` : null,
        },
        body: method === "GET" ? null : JSON.stringify(data),
    });
    
    return {data: await response.json(), status: response.status};
}