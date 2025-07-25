
https://copilot.microsoft.com/chats/JU3pLdWanmvVktA2MU58z

https://copilot.microsoft.com/chats/UketYqf4bW2azPmR3RBUz



npm install -g serve


````
1- متوقف کردن پورت 3000 در سرور:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force



2- اجرای UI در سرور:
Start-Process -WindowStyle Hidden -FilePath "cmd.exe" -ArgumentList '/c', 'serve -s build > "C:\HushaArchive\java\logs\ui-output.log" 2>&1'



3- مشاهده لاگ های ui در سرور:
Get-Content "C:\HushaArchive\java\logs\ui-output.log" -Wait

````