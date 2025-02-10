import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const minimetUrl = process.env.MINIMET_URL || "";
  const token = process.env.MINIMET_TOKEN || "";

  const headers = { 
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept':'application/json',
   };

  fetch(minimetUrl, {headers, method: "POST"})
    .then((res) => res.json())
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(500).json({error: err});
    });

  
}
