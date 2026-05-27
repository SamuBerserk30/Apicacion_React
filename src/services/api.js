const API_URL = "http://localhost:8080/api/v1";

export async function get(url) {
  const response =
    await fetch(`${API_URL}${url}`);

  if (!response.ok) {
    throw new Error("Error consultando API");
  }

  return response.json();
}

export async function post(
  url,
  body
) {

 const response =
 await fetch(
 `${API_URL}${url}`,
 {
   method:"POST",
   headers:{
     "Content-Type":
     "application/json"
   },
   body:
   JSON.stringify(body)
 })

 if(!response.ok){
   throw new Error(
   "Error guardando")
 }

 return response.json()
}