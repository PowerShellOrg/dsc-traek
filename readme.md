# Desired State Configuration Pull Server

Powershell Desired State Configuration (DSC) is a management platform that enables configuration of your environment at cloud speed and scale. Although DSC supports management by pushing configurations to target nodes, in order to acheive cloud speed and scale a central managment solution is required. [Azure Automation DSC](https://azure.microsoft.com/en-us/documentation/articles/automation-dsc-overview/) provides a solution for organizations with servers that have cloud access. This project provides a DSC Pull Server solution that can be installed on-premises. It provides three primary functions: a **repository** for node configurations (mofs)and PowerShell modules containing DSC resources, **assignment** of node configurations to target nodes, **reporting**.

In order for any configuration managment solution to be viable for production use, it must provide visablity into configuration state across all managed nodes. The DSC Pull server provides **reporting** with high level configuration status as well as details about each node's configuration so that you can quickly and easily understand the state of your environment and what if any steps need to be taken next. 

The **repository** stores all configurations and resources required by target nodes. This streamlines the process of deploying configurations and associated DSC resources to all target nodes within your organization. You do not need to make sure that target nodes have the required resources before they can enact the configuration because a node will just get any missing resources from the pull server before applying the configuration. 

Lastly once a target node is configured to pull node configurations from a pull server, an Administrator no longer needs to directly access any target nodes in order to **assign** a node configuration to it. They simply assign the desired node configuration to the desired target node(s) and next time the target node communicates with the server, it will get the assigned configuration and apply it.

[About Powershell DSC](https://technet.microsoft.com/en-us/library/dn249912.aspx)

## Quick Start

### Install & Configure Pull Server
To fully install and configure the pull server use the Assert-DscPullServer.ps1 script in the tools directory of this repo. Before running the following commands, copy your SSL certificate PF file to the computer that will become your DSC pull server. In the below example, I copied 'Fabricam_SSL.pfx' to 'C:\Configs\Certs\' on the pull server. Next generate a GUID to use as the shared secret that will be used by target nodes during registration. Keep this shared secret in a safe place as it will allow any target node to register with your pull server. The following PowerShell command will generate a GUID that can be used as the shared secret:

```PowerShell
[GUID]::NewGuid()
```
Finally run the 'Assert-DscPullServer.ps1' script passing in the SSL cert path, GUID and output path to install and configure the pull server as follows:
```PowerShell
    Assert-DscPullServer.ps1 -SSLCertificatePath 'C:\Configs\Certs\Fabricam_SSL.pfx' -SharedRegistrationKey '1de7d9f9-b26f-465a-9e5b-5c2fe60ff1b0' -OutputPath 'C:\Configs\Pull\'
```

### Configure Target Nodes
The following script will generate a meta-configuration. When applied to target nodes using the Set-DscLocalConfiguraitonManager cmdlet, will put them in pull mode and point them at your pull server. All configurations, resources and reporting will come from and go to the pull server.

```PowerShell

```

### Publish Configurations & Resources

```PowerShell

```

# Community
[DSC on Stack Exchange](http://stackoverflow.com/questions/tagged/dsc)    
[DSC on Twitter](https://twitter.com/hashtag/PSDSC?src=hash)

## License
The DSC Pull Server is licensed under the MIT license.    
[License](http://github.com/PowerShell/DSCPullServer/License)

## Contributing
<Build status??>
To learn how you can help make the DSC Pull Server a success visit [here](https://github.com/PowerShell/DSCPullServer/wiki).
