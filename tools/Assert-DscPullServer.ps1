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
