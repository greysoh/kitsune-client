import { exists } from "https://deno.land/std@0.191.0/fs/mod.ts";
import axiod from "https://deno.land/x/axiod@0.26.2/mod.ts";
import isElevated from 'npm:is-elevated@4.0.0';

import { fetchEndpoint } from "./libs/fetchEndpoint.mjs";
import { choiceMenu } from "./libs/textmode.mjs";
import { getXMLConfig } from "./libs/getXMLConfig.mjs";

async function isFullySetupWin() {
  if (Deno.build.os != "windows") return true;
  return await exists("C:/is-setup.txt");
}

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

const menuOpts = [
  "Reload USB ports",
  "Toggle Immutability"
]

if (!await isFullySetupWin()) menuOpts.push("Finish setup");

const selectedOption = choiceMenu("Select an option:", ...menuOpts);

switch (selectedOption) {
  case "Reload USB ports": {
    const reloadUSBRequest = await axiod.post(`http://${endpointIP}:8000/api/v1/usb/refresh`);
    if (!reloadUSBRequest.data.success) console.warn("WARNING: Request failed!");
    else console.log("USB devices reloaded.");
    
    break;
  }

  case "Toggle Immutability": {
    const toggleImmutabilityRequest = await axiod.post(`http://${endpointIP}:8000/api/v1/immutability/set`, {
      state: isImmutabilityEnabled ? "unlock" : "lock"
    });

    if (!toggleImmutabilityRequest.data.success) console.warn("WARNING: Request failed!");
    else console.log(`Immutability ${isImmutabilityEnabled ? "disabled" : "enabled"}.`);

    break;
  }

  case "Finish setup": {
    if (!await isElevated()) {
      console.error("ERROR: You are not running as an Administrator! Exiting...");
      break;
    }

    const userProfile = Deno.env.get("USERPROFILE");
    const driveLetter = prompt("What is the drive letter of your storage drive? (ex. C:, W:)");

    await Deno.writeTextFile(userProfile + "\\unattend.xml", getXMLConfig(driveLetter));
    await Deno.writeTextFile(userProfile + "\\unattendldr.bat", `@echo off\n%windir%\\system32\\sysprep\\sysprep.exe /oobe /reboot /unattend:${userProfile}\\unattend.xml`);

    console.log("Are you sure you want to continue? This WILL take a long time, depending on how much stuff you have in your user directory.");
    prompt("Press any key to start, or Ctrl+C to exit.");

    console.log("Starting unattendldr.bat... ");
    
    const bashCmd = Deno.run({
      cmd: ["cmd.exe", "/c", `${userProfile}\\unattendldr.bat`]
    });

    await bashCmd.status();
  }
}