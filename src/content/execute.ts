import type {Message} from "../types/types";
import {GPData} from "../types/types";
// import Tab = chrome.tabs.Tab;

(function (){

    // let newTab :Tab|null = null;
    let count:number = 0;
   function getGP ( callback:()=>void,err:()=>void ){
       count += 1;
       if(count>3){
           err()
           return;
       }
       if(window.generalPixel){
           callback()
           return ;
       }
       setTimeout( getGP,500,callback,err)
   }

    let oldlength = 0;
    let oldRTGLength = 0;
    let  clearId:  NodeJS.Timer
    let  clearIdRtg:  NodeJS.Timer

    async function sendMessage  (message:Message){
        // if(!newTab?.id)return;
        try {
            // await chrome.tabs.sendMessage(newTab.id, message);
            window.postMessage(message)
        }catch (e) {
            console.error(e)
            throw e
        }

    }


   function listingForEventData(){
      if ( window.generalPixel?.eventData?.length === oldlength) return
       oldlength = window.generalPixel?.eventData?.length || 0;
       const messageEventData:Message ={action:'set_event_data',payload:[...window.generalPixel?.eventData||[]]};
       sendMessage(messageEventData)
   }
   function listingForRtgData(){
        const dataForRTGMessage = window.generalPixel?.dataForRTGMessage;
        if(!Array.isArray(dataForRTGMessage)) return;
        if ( dataForRTGMessage.length === oldRTGLength) return
       oldRTGLength = dataForRTGMessage?.length || 0;
       const messageEventData:Message ={action:'set_RTG_data',payload:dataForRTGMessage};
       sendMessage(messageEventData)
   }

    window.generalPixel?.eventEmitter?.subscribe('onSetUid', function(uid:string) {
        const messageEventData:Message ={action:'set_Uid',payload:uid};
        sendMessage(messageEventData)
    })

   function findGP (){

       const data:GPData = {
           version:window.generalPixel?.VERSION,
           options:window.generalPixel?.options,
           uid:window.generalPixel?.uid,
       }
       const messageData:Message ={action:'set_gp_data',payload:data};
       sendMessage(messageData)
       const messageEventData:Message ={action:'set_event_data',payload:[...window.generalPixel?.eventData ||[]]};
       sendMessage(messageEventData)
       oldlength = window.generalPixel?.eventData?.length || 0;

       if(Array.isArray(window.generalPixel?.dataForRTGMessage)){
           const messageRTGData:Message ={action:'set_RTG_data',payload:window.generalPixel?.dataForRTGMessage};
           sendMessage(messageRTGData)
           oldRTGLength=window.generalPixel?.dataForRTGMessage.length||0
       }
       clearIdRtg = setInterval(listingForRtgData,1000)
      if(window.generalPixel?.eventData){
        clearId =  setInterval(listingForEventData,1000)
      }


   }

   function error(){
       const messageEventData:Message ={action:'error_event_data'};
       sendMessage(messageEventData)
   }

    getGP(findGP,error)

    window.addEventListener("message", listenerMessage);

    function removeEvents() {
        window.removeEventListener("message", listenerMessage)
    }


    function listenerMessage(e: MessageEvent<Message>) {

        if (e.data?.action === 'remove_execute') {
            removeEvents()
            clearInterval(clearId)
            clearInterval(clearIdRtg)
        }
    }

})();
