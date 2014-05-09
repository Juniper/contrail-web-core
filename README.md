## contrail-web-core
---

## Contrail Web Core
---
This software is licensed under the Apache License, Version 2.0 (the "License"); you may not use this software except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

### Overview
---
The Contrail Web Core repository contains back end(web server) code and common files required to render Contrail Web UI for the management of Contrail network virtualization solution. 

The code that **requests** data from various features of the Web UI is available in a separate code repository [Contrail Web Controller](https://github.com/Juniper/contrail-web-controller/).

This repository contains code that retrieves data reqeusted by components(such as Dashboard, Configuration, Monitoring, Reporting) in [Contrail Web Controller](https://github.com/Juniper/contrail-web-controller/). This module interacts with other components of both Contrail network virtualization solution and underlying Openstack components as well.

The API request from web client to webserver and web server to other components are REST based.

### How to set working environment for Contrail Web UI
---
1) Download, extract and compile the following.

a) **NodeJS** v0.8.15 (Recommended).

    wget http://nodejs.org/dist/v0.8.15/node-v0.8.15.tar.gz -O /tmp/node-v0.8.15.tar.gz
    cd /tmp
    tar -xf node-v0.8.15.tar.gz
    ./configure
    make
    sudo make install

b) Any version of **Redis Server**.
    
    http://redis.io/download
    
   or
    
    wget http://download.redis.io/releases/redis-2.8.9.tar.gz
    tar xzf redis-2.8.9.tar.gz
    cd redis-2.8.9
    make
    
2) Get the `contrail-web-core` repo

SSH clone URL:
    
    git clone git@github.com:Juniper/contrail-web-core.git

HTTPS clone URL:
    
    git clone https://github.com/Juniper/contrail-web-core.git

3) Get [Contrail Web Controller](https://github.com/Juniper/contrail-web-controller/) code.

    cd contrail-web-core
    make repos

or SSH clone URL:

    git clone https://github.com/Juniper/contrail-web-controller.git

or HTTPS clone URL:

    git clone git@github.com:Juniper/contrail-web-controller.git    
    

4) The following command sets the developemnt environment. It generates files required for Contrail Web UI. Do the following under `contrail-web-core` directory.

    make fetch-pkgs-dev
    make dev-env

"make fetch-pkgs-dev" downloads all the third-party libraries required.
Also check the version of Node JS installed once done.

    node --version

5) Start redis server on port 6383, 6383 is the default port used by Contrail WebUI, the port can be changed as explained in 'Configuration parameters' section.

#### Configuration parameters
---
The configuration file(`config.global.js`) is located under `contrail-web-core/config` directory

Change the below settings as required.

* Identify openstack node (ex: IP: 1.1.1.1)
* Identify Config Api Server Node (ex: IP: 2.2.2.2)
* Identify Analytics Node (ex: IP: 3.3.3.3)

Now for the below IPs fill with openstack node IP (ex: 1.1.1.1)

    config.networkManager.ip
    config.imageManager.ip
    config.computeManager.ip
    config.identityManager.ip
    config.storageManager.ip

Fill the below with Config Api Server Node IP (ex: 2.2.2.2)
    
    config.cnfg.server_ip

Fill the below with Analytics Node IP (ex: 3.3.3.3)

    config.analytics.server_ip

To Change the redis-server port, change the below entry and start redis-server on that specific port.
    
    config.redis_server_port

#### Starting web servers
---
Create an empty file `/var/log/contrail-webui.log`. This is the log file for Contrail Web UI.

Contrail Web UI has two servers:

1. Main web server - which handles all the Web Client requests
2. Job server / Contrail Web UI Middleware - If any request needs more processing or job based task, then it is performed by Job Server.

To Start Main web server, invoke (in `contrail-web-core` directory)

    node webServerStart.js

And to Start Job Server:

    node jobServerStart.js

If both are running successfully, then all are set to start working, testing and debugging Contrail Web UI code!!!

### Directory structure
---
**config**&nbsp;&nbsp;&nbsp; - Contains web server configuration file. 

    The file 'config.global.js' holds configuration parameters related to web server (IP address/Port/Protocol,Caching, Log levels etc). 
    It also has configuration parameters required to communicate with underlying orchestration modules, the IP addresses/Port/Protocol these module listen at etc. 
    Refer section 'Configuration parameters' for further details.

**distro**&nbsp;&nbsp;&nbsp;&nbsp; - Contains patches to be applied on top of existing third party softwares/modules/libraries etc.

**keys**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - Contains certificate file, certificate request, RSA private key files.

**src**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - Source directory for backend code

**test**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - Files required to unit-test files under **src** directory.

**webroot** - Contains resources such as utility files, images, customized css commonly used render Web UI. 

Note: All the files/directories under 'webroot' directory of [Contrail Web Controller](https://github.com/Juniper/contrail-web-controller/) are copied under this directory during Contrail Web UI Package creation.


### Contributing code
---
* Sign the [CLA](https://secure.echosign.com/public/hostedForm?formid=6G36BHPX974EXY)
* Submit change requests via gerrit at <http://review.opencontrail.org>.
