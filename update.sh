git pull
yarn
pm2 restart platform
cd agastya-database
git add .
git commit -m "Agastya database backup"
git push origin master --force
cd ../
