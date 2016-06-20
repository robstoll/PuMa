#!/bin/sh
password=`cat /home/httpd/vhosts/tutteli.ch/private/puma/app/scripts/password.txt`
mysqldump --user=puma --password=$password --hex-blob -n --all-databases | gzip > /home/httpd/vhosts/tutteli.ch/private/backups/puma-`/bin/date '+%Y-%m-%d_%H-%M'`.sql.gz
find /home/httpd/vhosts/tutteli.ch/private/backups/puma-*.sql.gz -mtime +60 -exec rm {} \;