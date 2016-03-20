#!/bin/sh
password=`cat /home/httpd/vhosts/tutteli.ch/private/purchase/app/scripts/password.txt`
mysqldump --user=purchase --password=$password --hex-blob -n --all-databases > /home/httpd/vhosts/tutteli.ch/private/backups/purchase-`/bin/date +\%Y\%m\%d`.sql
find /home/httpd/vhosts/tutteli.ch/private/backups/purchase-*.sql -mtime +120 -exec rm {} \;