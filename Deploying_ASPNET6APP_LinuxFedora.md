# Deploying an ASP.NET 6 APP to Linux Fedora 35
_*By Bill Nice Havugukuri*_
### Inspired by [microsoft official guide for linux debain systems](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-nginx?view=aspnetcore-6.0)
### Install the .NET6 runtime: 
```bash
  $ sudo dnf install aspnetcore-runtime-6.0
```
### Prepare your app for deployment on linx and to receive requests from a nginx/apache reverse proxy server:
##### Add Kestrel configuration section in the appsettings.json making sure to specify a cert and endpoints for https:
```json
	"Kestrel": {
		  "Endpoints": {
			"Http": {
			  "Url": "http://localhost:5087"
			},
			"HttpsDefaultCert": {
			  "Url": "https://localhost:4500"
			}
		  },
		"Certificates": {
			"Default": {
			  "Path": "./priv/key.pfx",
			  "Password": "xxxxxsr"
			}
		  }
	}	
```
##### Configure your app to use forwarded headers from the reverse proxy, add them after build, before any other middleware:
```cs
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ConfigureHttpsDefaults(listenOptions =>
    {
        listenOptions.AllowAnyClientCertificate();
    });
});
//service....

//app.Build()...
app.UseForwardedHeaders(new ForwardedHeadersOptions{ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto});
```
### Publish your app and copy all the produced files in a directory on the remote machine:
```bash
  $ scp publish.zip  username@10.20.05.06:/var/gcodsui
```

### Create a service for launching the dll of your web app.(this is will use the kerstel configs in the appsettings.json):
```bash
  $ sudo vim /etc/systemd/system/<serviceName>.service
  #make it executable.
  $ sudo chmod +x /etc/systemd/system/<serviceName>.service

```
##### paste in this:
```ini
  [Unit]
  Description=ASP.NET web app and Angular.
  [Service]
  # will set the Current Working Directory (CWD)
  WorkingDirectory=<where you published your files on the remote machine/>
  # systemd will run this executable to start the service
  ExecStart=dotnet <yourDLL_location/>.dll
  # to query logs using journalctl, set a logical name here
  SyslogIdentifier=<yourAppName/>
  # Use your username to keep things simple, for production scenario's I recommend a dedicated user/group.
  # If you pick a different user, make sure dotnet and all permissions are set correctly to run the app.
  # To update permissions, use 'chown yourusername -R /srv/AspNetSite' to take ownership of the folder and files,
  #       Use 'chmod +x /srv/AspNetSite/AspNetSite' to allow execution of the executable file.
  User=<yourUsername/>
  # ensure the service restarts after crashing
  Restart=always
  # amount of time to wait before restarting the service
  RestartSec=10
  # copied from dotnet documentation at
  # https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-nginx?view=aspnetcore-3.1#code-try-7
  KillSignal=SIGINT
  Environment=ASPNETCORE_ENVIRONMENT=Production
  Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false
  # This environment variable is necessary when dotnet isn't loaded for the specified user.
  # To figure out this value, run 'env | grep DOTNET_ROOT' when dotnet has been loaded into your shell.
  Environment=DOTNET_ROOT=/usr/lib64/dotnet
  [Install]
  WantedBy=multi-user.target
```

### Enable the service for auto start and start it and that it is running properly:
```bash
  $ sudo systemctl enable <serviceName/>.service
  $ sudo systemctl enable daemon-reload
  $ sudo systemctl start <serviceName/>.service
  $ sudo systemctl status <serviceName/>.service
  #In a separate terminal run the following command to  view the console logs of the app in realtime.
  $ sudo journalctl -fu <serviceName/>
```
	 
### At this point you should already be able to taste your app locally using kestrel that was already installed by the asp.net runtime installation above:
```bash
	$ curl -v -k "https://localhost:4500"
```
_*once you get the expected response locally, then the next step is the install a server and configure it as a reverse proxy for your app. For this example i will use nginx as the reverse proxy but also apache would be a good choice.*_
    
### Install and configure nginx:
```bash
  $ sudo sudo dnf install nginx
  $ sudo sudo systemctl enable nginx
  $ sudo systemctl start nginx
```
##### Open the firewall for nginx on ports 80,443 by the default, but you can also change the configuration to LISTEN to different ports and that case you would have to enable them also here:
```bash
  $ sudo firewall-cmd --permanent --add-service=http
  $ sudo firewall-cmd --permanent --add-service=https
  $ sudo firewall-cmd --reload
  #to check the status of nginx
  $ sudo systemctl status nginx 
```
_*Now your app and nginx services should be working and the last step is to connect them by forwarding all requests intented to your webapp from nginx to our local webserver.*_
### Configure Nginx as a reverse proxy for our app:
    
##### _*open the nginx configuration file:*_
      
```bash
  $ sudo vim /etc/nginx/nginx.conf
```
_*paste in:*_

```bash
	server {

		  listen  443 ssl;
		  #the hostname of your site:(the requests your want to redirect to your webserver.)
		  server_name  www.example.com;
		  #location of the cert and key you want to bind to this website for mtls
		  ssl_certificate "client.pem";
		  ssl_certificate_key "client.key";

		  location / {
			proxy_pass https://127.0.0.1:4500;
			proxy_http_version 1.1;
			proxy_set_header   Upgrade $http_upgrade;
			proxy_set_header   Connection keep-alive;
			proxy_set_header   Host $host;
			proxy_cache_bypass $http_upgrade;
			proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header   X-Forwarded-Proto $scheme;
		  }

		  include /etc/nginx/default.d/*.conf;

		  error_page 404 /404.html;
		  location = /404.html {
		  }

		  error_page 500 502 503 504 /50x.html;
		  location = /50x.html {
		  }
	}
```
##### restart nginx and make sure there is no error:

```bash
  $ systemctl restart nginx.service
  $ systemctl status nginx.service
```
### Your app should be working and you can test it from any computer that can reach your remote server IP binded to the hostname ("www.example.com") chosen.






	  

 





