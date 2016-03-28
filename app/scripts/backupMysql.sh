#!/bin/sh
password=`cat /home/httpd/vhosts/tutteli.ch/private/purchase/app/scripts/password.txt`
mysqldump --user=purchase --password=$password --hex-blob -n --all-databases | gzip > /home/httpd/vhosts/tutteli.ch/private/backups/purchase-`/bin/date '+%Y-%m-%d_%H-%M'`.sql.gz
find /home/httpd/vhosts/tutteli.ch/private/backups/purchase-*.sql.gz -mtime +60 -exec rm {} \;