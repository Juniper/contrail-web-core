## contrail-web-core
---

## Contrail Web Core
---
This software is licensed under the Apache License, Version 2.0 (the "License"); you may not use this software except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

### Overview
---
The Contrail Web Core repository contains back end (web server) code and common resources required to render Contrail Web UI for the management of Contrail network virtualization solution. This module interacts with other components of both Contrail network virtualization solution and underlying orchestration systems like Openstack, Cloudstack.

The API requests from web client to web server and web server to other components are REST based.

The code that **implements** various features of the Web UI (such as Dashboard, Configuration, Monitoring, Reporting) is available in a separate code repository [Contrail Web Controller](https://github.com/Juniper/contrail-web-controller/).

### Setting up working environment for Contrail Web UI
---
1) Download, extract and compile the following.

a) **Node.JS**

Install the latest nodejs from https://nodejs.org/

Verify Node.JS installation.

    node --version

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

'make repos' downloads two more repos contrail-web-controller and contrail-webui-third-party in parent directory.
    

4) Execute the following commands under `contrail-web-core` directory to setup development environment. It downloads all the third-party libraries and generates the files required for Contrail Web UI.

    make fetch-pkgs-dev
    make dev-env REPO=webController

'make fetch-pkgs-dev' downloads all the third-party modules required for development. 

'make dev-env' sets the environment for development. It copies all the third-party modules in correct path.
Please note this step changes the file contents in dashboard.tmpl, login.tmpl and login-error.tmpl under webroot/html directory. So if you have any changes in any of these three files, before check-in, you MUST issue below command
    
    make rem-ts-prod

5) Start `redis-server` on port 6379, 6379 is the default port used by Contrail Web UI, the port can be changed as explained in 'Configuration parameters' section.

    redis-server --port 6379


#### Configuration parameters
---
The configuration file(`config.global.js`) is located under `contrail-web-core/config` directory

Configure the following settings as required.

* Identify Openstack/Cloudstack Services’ IP (E.g. 1.1.1.1)
* Identify Configuration API Server IP (E.g. 2.2.2.2)
* Identify Analytics Server IP (E.g.IP:  3.3.3.3

Fill the following Orchestration Services’ IP (E.g. 1.1.1.1). Note that `config.identityManager.ip` is mandatory.

    config.identityManager.ip
    config.networkManager.ip
    config.imageManager.ip
    config.computeManager.ip
    config.storageManager.ip

Fill the below with Configuration API Server Node IP (E.g. 2.2.2.2)

    config.cnfg.server_ip

Fill the below with Analytics Node IP (E.g. 3.3.3.3)

    config.analytics.server_ip

To Change the redis-server port, change the below entry and start redis-server on that specific port (E.g. 6383).
    
    config.redis_server_port

Set the path where contrail-web-controller code resides

    config.featurePkg.webController.path

You must set the above configuration before issuing "make dev-env REPO=webController".

If you want to enable authentication support of contrail-webui while communicating with redis-server, then in redis config file set the password

    requirepass <password>

Same password needs to be specified in contrail-webui config file:

    config.redis_password

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

If both are running successfully, then point the browser to `http://localhost:8080/`.
Default credentials are 

    Username: admin
    Password: contrail123


### Directory structure
---
**config**&nbsp;&nbsp;&nbsp; - Contains web server configuration file. 

    The file 'config.global.js' holds configuration parameters related to web server (IP address/Port/Protocol,Caching, Log levels etc). 
    It also has configuration parameters required to communicate with underlying orchestration modules, the IP addresses/Port/Protocol these module listen at etc. 
    Refer section 'Configuration parameters' for further details.

**keys**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - Contains certificate file, certificate request, RSA private key files.

**src**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - Source directory for backend code

**test**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - Files required to unit-test files under **src** directory.

**webroot** - Contains resources such as utility files, images, customized css commonly used to render Contrail Web UI. 

Note: All the files/directories under 'webroot' directory of [Contrail Web Controller](https://github.com/Juniper/contrail-web-controller/) are copied under this directory during Contrail Web UI Package creation.


### Contributing code
---
* Sign the [CLA](https://secure.echosign.com/public/hostedForm?formid=6G36BHPX974EXY)
* Submit change requests via gerrit at <http://review.opencontrail.org>.


