
type EventData ={
  event:string
  value:Record<string, string>
}

type DataForRTGMessage = {
  [key:string]:string
  action:string,
}

type GeneralPixel = {
  eventData?:EventData[]
  VERSION:string
  options:Record<string, string>
  uid?:string
  eventEmitter?:{
    subscribe:(event:string,cb:(v:any)=>void)=>void
  }
  dataForRTGMessage?:DataForRTGMessage | DataForRTGMessage[]
};

interface Window {
  generalPixel?: GeneralPixel;
}
