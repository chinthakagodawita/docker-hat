# Changelog

## 0.1.0
* Fixed SOE drush command from complaining if no args are passed through.

## 0.0.7

* Updated yargs and shelljs
* Fixed flags being passed to the soe drush command (i.e. `dh soe drush dl views --select` now works)
* Removed duplicate Docker host existence check
* Fixed false-positive error when exiting `dh shell`
* Removed the `latest` tag from the SOE version selection list
* Added ability to skip host checks and image pulls
    - `dh soe start <my container> --skip-host`
    - `dh soe start <my container> --skip-pull`
* Removed mentions of the HTTP proxy and dnsmasq and added dnsdock.
* Added ability to override host IP and DNS address.
    - `dh soe start <my container> --dns=mydnsserver.local`
    - `dh soe start <my container> --hostip=10.0.2.2`

## 0.0.6

* Removed HTTP proxy
* Started using dnsdock in dinghy to automatically map *.docker hostnames to Docker containers via DNS
* Remove apache hostname setting in containers (simplified startup)
* Add command to control Docker host (`dh host`)
* Last started SOE container name is now stored and used for subsequent SOE commands (#17)

## 0.0.5

* Initial version (added changelog file)
