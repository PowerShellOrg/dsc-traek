# Desired State Configuraiton Pull Server

Powershell Desired State Configuration (DSC) is a management platform that enables configuration of your environment at cloud speed and scale. Although DSC supports management by pushing configurations to target nodes, in order to acheive cloud speed and scale a central managment solution is required. [Azure Automation DSC](https://azure.microsoft.com/en-us/documentation/articles/automation-dsc-overview/) provides a solution for organizations with servers that have cloud access. This project provides a DSC Pull Server solution that can be installed on-premises. It provides three primary functions: a **repository** for node configurations (mofs)and PowerShell modules containing DSC resources, **assignment** of node configurations to target nodes, **reporting**.

In order for any configuration managment solution to be viable for production use, it must provide visablity into configuration state across all managed nodes. The DSC Pull server provides **reporting** with high level configuration status as well as details about each node's configuration so that you can quickly and easily understand the state of your environment and what if any steps need to be taken next. 

The **repository** stores all configurations and resources required by target nodes. This streamlines the process of deploying configurations and associated DSC resources to all target nodes within your organization. You do not need to make sure that target nodes have the required resources before they can enact the configuration because a node will just get any missing resources from the pull server before applying the configuration. 

Lastly once a target node is configured to pull node configurations from a pull server, an Administrator no longer needs to directly access any target nodes in order to **assign** a node configuration to it. They simply assign the desired node configuration to the desired target node(s) and next time the target node communicates with the server, it will get the assigned configuration and apply it.

[About Powershell DSC](https://technet.microsoft.com/en-us/library/dn249912.aspx)

## Quick Start
### Install
>This needs to be defined

### Configure Server
Run the following script on the server where you intend to install the DSC pull perver. You will to pass a path to a .PFX file and a shared key into the script in order to properly configure the pull server to use SSL.
```PowerShell
param(
    [Parameter(Mandatory)] 
    [ValidateNotNullOrEmpty()]
    $SSLCertificatePath, # Full path to SSL Certificate PFX file to be used by DSC Pull Server endpoint

    [Parameter(Mandatory)] 
    [ValidateNotNullOrEmpty()]
    [string]
    $SharedRegistrationKey, # Shared key (should be a GUID) to be used by target nodes to register with Pull Server

    $OutputPath = ".\"
)

#Get xPSDesiredStateConfiguration module
$CurrentModule = Get-Module xPSDesiredStateConfiguration -ListAvailable

if($CurrentModule -ne $null)
{
    Install-Module xPSDesiredStateConfiguration -Force
}


Configuration V2PullServer 
{ 
    param( 
            [Parameter(Mandatory)] 
            [ValidateNotNullOrEmpty()] 
            [string] $SSLCertThumbprint 
    ) 

     Import-DscResource -ModuleName xPsDesiredStateConfiguration
 
     node localhost 
     { 
         WindowsFeature DSCServiceFeature 
         { 
             Ensure = "Present" 
             Name   = "DSC-Service"             
         } 
 
         xDscWebService PSDSCPullServer 
         { 
             Ensure                       = "Present" 
             EndpointName                 = "PSDSCService" 
             Port                         = 443 
             PhysicalPath                 = "c:\inetpub\PullServer" 
             CertificateThumbPrint        = $SSLCertThumbprint                   
             State                        = "Started" 
             DependsOn                    = "[WindowsFeature]DSCServiceFeature"  
             AcceptSelfSignedCertificates = $true 
         } 
 
         File RegistrationKeyFile 
         { 
             Ensure          ='Present' 
             Type            = 'File' 
             DestinationPath = "$env:ProgramFiles\WindowsPowerShell\DscService\RegistrationKeys.txt" 
             Contents        =  $SharedRegistrationKey
         } 
     } 
 } 

 
 $SSLCertFilePath = $SSLCertificatePath
 $SSLThumbprint = (Get-PfxCertificate -FilePath $SSLCertFilePath).Thumbprint 

 V2PullServer -SSLCertThumbprint $SSLThumbprint -OutputPath $OutputPath 

 Start-DscConfiguration -Path $OutputPath -Wait -Verbose
```

### Configure Target Nodes

### Publishing Configurations & Resources to Pull Server


# Community
[DSC on Stack Exchange](http://stackoverflow.com/questions/tagged/dsc)    
[DSC on Twitter](https://twitter.com/hashtag/PSDSC?src=hash)

## License
The DSC Pull Server is licensed under the MIT license.    
[License](http://github.com/PowerShell/DSCPullServer/License)

## Contributing
<Build status??>
To learn how you can help make the DSC Pull Server a success visit [here](https://github.com/PowerShell/DSCPullServer/wiki).
