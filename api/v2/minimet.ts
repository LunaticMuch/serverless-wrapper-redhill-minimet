import type { VercelRequest, VercelResponse } from "@vercel/node";

const CLOUDLAYERS = ['cloudLayer1', 'cloudLayer2', 'cloudLayer3', 'cloudLayer4'];

interface ICloud {
    type: number | null
    height: number | null
    coverage: number | null
}

interface IMininetMetar {
    site: string;
    isCavok: boolean
    updatedOn: string;
    isAutomatic: boolean
    qnh: string
    qfe: string
    metar: string
    designator: string
    runway: string
    temperature: number
    dewPoint: number
    visibility: number
    clouds?: ICloud[]
    windSpeed : number
    windDirection : number  | null
    isWindVariable : boolean
    windBetweenFrom : number  | null
    windBetweenTo : number  | null
    windSpeedGust : number | null
}

function metarParser(minimetRaw: any): IMininetMetar {
    const sanitezedMetar = {
        site: minimetRaw.siteId,
        isCavok: minimetRaw.reports.metarReport.cavok,
        updatedOn: minimetRaw.reports.metarReport.time,
        isAutomatic: minimetRaw.reports.metarReport.auto,
        qnh: minimetRaw.reports.metarReport.qnh,
        qfe: minimetRaw.reports.metarReport.airfieldQfe,
        metar: minimetRaw.reports.metarReport.arrivalAtis.metReportString,
        designator: minimetRaw.reports.metarReport.arrivalAtis.codeLetter,
        runway: minimetRaw.reports.metarReport.arrivalAtis.runway,
        temperature: minimetRaw.reports.metarReport.temperature.temperature,
        dewPoint: minimetRaw.reports.metarReport.temperature.dewPoint,
        visibility: minimetRaw.reports.metarReport.visibility.visibility,
        clouds: CLOUDLAYERS.map((layer) => {
            if (minimetRaw.reports.metarReport.cloud[layer].type !== null) {
            return {
                type: minimetRaw.reports.metarReport.cloud[layer].type,
                height: minimetRaw.reports.metarReport.cloud[layer].height,
                coverage: minimetRaw.reports.metarReport.cloud[layer].cover
            }}
            return null
        }).filter((layer) => layer !== null),
        windSpeed: minimetRaw.reports.metarReport.arrivalAtis.wind.wind2Min.averageWindSpeed,
        windDirection: minimetRaw.reports.metarReport.arrivalAtis.wind.wind2Min.averageWindDirection,
        windBetweenFrom: minimetRaw.reports.metarReport.arrivalAtis.wind.wind2Min.minimumWindDirection,
        windBetweenTo: minimetRaw.reports.metarReport.arrivalAtis.wind.wind2Min.maximumWindDirection,
        isWindVariable: minimetRaw.reports.metarReport.arrivalAtis.wind.wind2Min.isVrb,
        windSpeedGust: minimetRaw.reports.metarReport.arrivalAtis.wind.wind2Min.minimumWindSpeed
    }
    return sanitezedMetar;
}


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
      return res.status(200).json(metarParser(data));
    })
    .catch((err) => {
      return res.status(500).json({error: err});
    });

  
}
