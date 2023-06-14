export function getXMLConfig() {
  return `<?xml version="1.0" encoding="utf-8"?>
  <unattend xmlns="urn:schemas-microsoft-com:unattend">
  <settings pass="oobeSystem">
  <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FolderLocations>
  <ProfilesDirectory>D:\Users</ProfilesDirectory>
  </FolderLocations>
  </component>
  </settings>
  </unattend>`.split("\n").map((i) => i.trim()).join("\n");
}