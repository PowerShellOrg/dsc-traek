Parm(
    [Parameter(Mandatory)] 
    [ValidateNotNullOrEmpty()]
    $PullServerURL, 
    
    [Parameter(Mandatory)] 
    [ValidateNotNullOrEmpty()]
    [string]$SharedRegistrationKey, # Shared key (should be a GUID) to be used by target nodes to register with Pull Server
    
    $OutputPath = ".\"
)

[DscLocalConfigurationManager()]
Configuration MetaConfig
{
    
    Settings
    {
        RefreshMode          = 'Pull'
        ConfigurationMode    = 'ApplyAndAutoCorrect'
        ActionAfterReboot    = 'ContinueConfiguration'
        RebootNodeIfNeeded   = $true
    }

    ConfigurationRepositoryWeb V2PullServer
    {
        ServerURL           = $PullServerURL
        #ConfigurationNames = 'Basic.FileServer' # This can be used to bootstrap target node with configuration during registration
        RegistrationKey     = $SharedRegistrationKey
    }

    ResourceRepositoryWeb V2PullServer
    {
        ServerURL         = $PullServerURL
        RegistrationKey   = $SharedRegistrationKey
    }

    ReportServerWeb V2PullServer
    {
        ServerURL         = $PullServerURL
        RegistrationKey   = $SharedRegistrationKey
    }
}

MetaConfig -OutputPath $OutputPath
