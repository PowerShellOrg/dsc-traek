# DSC-TRÆK

The project dsc-[traek])https://en.m.wiktionary.org/wiki/træk) is an Open Source implementation of a service to host
the Powershell Desired State Configuration (DSC) Pull mode
[protocol](https://msdn.microsoft.com/en-us/library/dn393548.aspx).

This is a community supported project with no official support from Microsoft.
Although the maintainers/contributors for the project can be Microsoft employees
(and from the PowerShell DSC engineering team) that does not implicitly create
a support relationship.
There is no SLA for resolving issues or on call support.

If a supported and scalable solution is required, the recommended implementation
of the Pull mode protocol is 
[Azure Automation DSC](https://azure.microsoft.com/en-us/documentation/articles/automation-dsc-overview/).

For a fully supported but limited implementation of Pull service protocol for
isolated network scenarios, consider
[Windows DSC Pull Service](https://docs.microsoft.com/en-us/powershell/dsc/pullserver).

For information on how to use PowerShell DSC and how to configure clients
to register with a Pull service, see the official PowerShell DSC
[documentation](https://docs.microsoft.com/en-us/powershell/dsc/overview).

## Project vision

The journey for this project is to explore the possibility of using innovative
approaches to cloud scale applications as a platform for delivering
configuration management functionality.

The implementation is written in Node.js following best practices for
micro-services with an expectation that the only release vehicle would be
a container platform.
The most likely hosting environment would be Kubernetes.

*Please note that contributors to the project are learning Node.js and
Kubernetes during the process of development, which makes this an exciting
learning opportunity but likely to introduce breaking changes during early
phases of development.*

## Functionality included

This solution is intended to provide three primary functions:

- a **repository** for node configurations (mof) and PowerShell modules
 containing DSC resources
- **assignment** of node configurations to target nodes
- **reporting**

The **repository** stores all configurations and resources
required by target nodes.
This streamlines the process of deploying configurations
and associated DSC resources to all target nodes within your organization.
You do not need to make sure that target nodes have the required resources
before they can enact the configuration
because a node will just get any missing resources from the pull server
before applying the configuration.

Once a target node is configured to pull node configurations
from a pull server,
an Administrator no longer needs to directly access any target nodes
in order to **assign** a node configuration to it.
They simply assign the desired node configuration to the desired target node(s)
and next time the target node communicates with the server,
it will get the assigned configuration and apply it.

In order for any configuration management solution to be viable,
it must provide visibility into configuration state across all managed nodes.
The traek project provides data to support **reporting**
with high level configuration status as well as details
about each node's configuration
so that you can quickly and easily understand the state of your environment
and what if any steps need to be taken.

# Community
[DSC on Stack Exchange](http://stackoverflow.com/questions/tagged/dsc)
[DSC on Twitter](https://twitter.com/hashtag/PSDSC?src=hash)

## License
The DSC Pull Server is licensed under the MIT license.
[License](http://github.com/PowerShell/DSCPullServer/License)

## Contributing
<Build status??>
To learn how you can help make the DSC Pull Server a success visit
[here](https://github.com/PowerShell/DSCPullServer/wiki).
