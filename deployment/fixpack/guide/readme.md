# UPDATING TO A FIXPACK

## INSTALLATION
After intalling the main product, install the ifix patch as follows:

- get the ifix zip copy it to the machine to be installed and unzip it
- see the `PatchGuide.pdf` guide inside the ifix (the laest guide is here: [PatchGuide.pdf](./PatchGuide.pdf) but be aware that the latest could differ from the one inside the patch being installed)
- install the patch it via python installer
  - example: `python applypatch.py -u wasadmin -p passw0rd -f /opt/IBM/WebSphere/AppServer/profiles/AppSrv01/bin/wsadmin.sh -l http://lcauto102.cnx.cwp.pnp-hcl.com/files -a connectionsAdmin`

### Options
- you can tweak config.py to alter installation details and components, such as installing one component at a time by commenting out unwanted components under [config.py](../script/config.py#L200)
- you can fake the installer version check done in [applypatch.py](../deployment/fixpack/script/applypatch.py#L52) by modifying the `build-info` node of the deployed config files of each service under their config directory (example, `/opt/IBM/WebSphere/AppServer/profiles/Dmgr01/config/cells/ip-10-190-161-119Cell01/IBMDocs-config/concord-config.json viewer-config.json conversion-config.json`)
  - sample modification (added  `ifix_version: 25` manually in concord-config.json):
  ```
    "build-info": {
      "product_name": "HCL Connections Docs",
      "build_description": "HCL Connections Docs 2.0.0",
      "build_version": "2.0.0",
      "build_timestamp": "20190428-0958",
      "ifix_version": 25 
  }
  ```


### Problems encountered

  - **Problem:** install fails with error about missing IBMDocsSanity app
    - **Cause:** IBMDocsSanity app likely does not exist in websphere becuase it was wiped out by the conversion installer as it is installed with the same `context root for web modules` as IBMDocsSanity
    - **Solution:**
      - change the `context root for web modules` of the IBMConversionSanity app to something other than `sanity` (example: `cl-sanity`) 
      - install the IBMDocsSanity ear from the original installation
  - **Problem:** DocsConversion app fails install
    - **Cause:** job-manager unreachable?
    - **Solution:** use `-i true` option (see [PatchGuide.pdf](./PatchGuide.pdf)
