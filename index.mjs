import axiod from "https://deno.land/x/axiod@0.26.2/mod.ts";

import { fetchEndpoint } from "./libs/fetchEndpoint.mjs";
import { choiceMenu } from "./libs/textmode.mjs";

console.log(`                                    ____  __.__  __                               _________ .__  .__               __   
 Z      |\\      _,,,---,,_         |    |/ _|__|/  |_  ________ __  ____   ____   \\_   ___ \\|  | |__| ____   _____/  |_ 
  Z    / ,\`.-'\`'   -.  ;-,'-,,_    |      < |  \\   __\\/  ___/  |  \\/    \\_/ __ \\  /    \\  \\/|  | |  |/ __ \\ /    \\   __\\
   Zz  |,4-  ) )-,_. ´\\ (  \`'-,##> |    |  \\|  ||  |  \\___ \\|  |  /   |  \\  ___/  \\     \\___|  |_|  \\  ___/|   |  \\  |  
      ' --''(_/--'  \`-'\\_)         |____|__ \\__||__| /____  >____/|___|  /\\___  >  \\______  /____/__|\\___  >___|  /__|  
                                           \\/             \\/           \\/     \\/          \\/             \\/     \\/      `);

console.log("INFO> Fetching endpoint IP address...");
const endpointIP = await fetchEndpoint();

console.log("INFO> Found host IP address is: %s", endpointIP);

if (Deno.args[0] == "automate") {
  console.log("Automate mode! Have fun:")
  console.log(" - Hotreload USB enabled.");

  while (true) {
    const reloadUSBRequest = await axiod.post(`http://${endpointIP}:8000/api/v1/usb/refresh`);
    if (!reloadUSBRequest.data.success) console.warn("WARNING: Request failed!");

    await new Promise((i) => setTimeout(i, 2000));
  }
}


console.log("");

const isImmutabilityEnabledRequest = await axiod.get(`http://${endpointIP}:8000/api/v1/immutability`);
const isImmutabilityEnabled = isImmutabilityEnabledRequest.data.state == "locked";

console.log(`Immutability is ${isImmutabilityEnabled ? "enabled" : "disabled"} for this session.`);

const menuOpts = choiceMenu("Select an option:", "Reload USB ports", isImmutabilityEnabled ? "Disable Immutability" : "Enable Immutability");

switch (menuOpts) {
  case 1: {
    const reloadUSBRequest = await axiod.post(`http://${endpointIP}:8000/api/v1/usb/refresh`);
    if (!reloadUSBRequest.data.success) console.warn("WARNING: Request failed!");
    else console.log("USB devices reloaded.");
    
    break;
  }

  case 2: {
    const toggleImmutabilityRequest = await axiod.post(`http://${endpointIP}:8000/api/v1/immutability/set`, {
      state: isImmutabilityEnabled ? "unlock" : "lock"
    });

    if (!toggleImmutabilityRequest.data.success) console.warn("WARNING: Request failed!");
    else console.log(`Immutability ${isImmutabilityEnabled ? "disabled" : "enabled"}.`)
  }
}