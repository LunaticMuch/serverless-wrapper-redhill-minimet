import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const minimetUrl = process.env.MINIMET_URL || "";
  const token = process.env.MINIMET_TOKEN || "";

  const headers = { 
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'PostmanRuntime/7.26.8',
    'Accept':'application/json',
   };

   let metar
   let error

  fetch(minimetUrl, {headers, method: "POST"})
    .then((res) => res.json())
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(500).json({error: err});
    });

  
}
