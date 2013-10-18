contrail-web-ui
===============

Versions Used:
--------------
nodejs: v0.8.15
redis-server: Any Version

Directions to Build Working Environment for Contrail WebUI
----------------------------------------------------------
1. First get the contrail-web-core repo using the below git CLI:     

   SSH Clone URL:
            
            git clone git@github.com:Juniper/contrail-web-core.git

  HTTPS Clone URL:
        
        git clone https://github.com/Juniper/contrail-web-core.git
    

2. $cd contrail-web-core

3. Create all the required repos by invoking below

        $make repos

=>It will download two more repos contrail-web-ui and contrail-web-third-party in
  the parent directory.
                        
      . contrail-web-core contrains WebUI Server back-end code.                  
      . contrail-web-third-party contains all the third party codes used by both WebUI frontend and backend(nodejs)
      . contrail-web-ui contains all the front-end code.

4. Invoke below to make dev environment.
    
        $make dev-env

  => It will install nodejs(v0.8.15) in the system if not already installed, also it will
   generate all the auto-generated files required.
   Check node version installed:
   
        $node --version
   It should return v0.8.15, our code tested on this version.

5. Now start redis server on port 6383, 6383 is the default port used by
   Contrail WebUI, the port can be changed which is explained in 'Config File'
   Section.

Config File:
------------
The Config file is located in
config/config.global.js under contrail-web-core directory
Change the below settings as required.

    1. identify openstack node (ex: IP: 1.1.1.1)
    2. identify Config Api Server Node (ex: IP: 2.2.2.2)
    3. identify Analytics Node (ex: IP: 3.3.3.3)

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

To Change the redis-server port, change the below entry and start redis-server
on that specific port.

    config.redis_server_port

Start WebUI Servers:
---------------------
First create an empty file /var/log/contrail-webui.log
This is the log file for Contrail WebUI back-end.

Contrail WebUI has two servers:
1. Main Web Server - which handles all the Web Client requests
2. Job Server / Contrail WebUI Middleware - If any request needs more processing
  or job based work, then it is performed by Job Server.
To Start Main WebServer, invoke (in contrail-web-core directory)
    
    $node webServerStart.js

And to Start Job Server:
  
    $node jobServerStart.js

Both MUST be running.

If both are running, then all are set to start working, testing and debugging
contrail WebUI Code!!!

