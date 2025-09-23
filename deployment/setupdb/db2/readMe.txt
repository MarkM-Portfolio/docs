For developers & testers & deployment engineer who need to update db schema to their local/testing environment.
- You will still be notified if any schema change is required by server team
- If you get the notice, below step tells you how to update db schema

1. Run db2cmd in console(for linux, create an instance at first)
2. Go to $SRC/deployment/setupdb/db2
3. If you haven't created db schema before, run below command, else go to step 4
  $ createDb.bat (on linux, run ./createDb.sh)
4. run "updateDBSchema.bat" to update db schema to latest.

For developers who need to change db schema
Alter db schema by sql statement (instead of changing the createdb.sql directly), and name the sql file as fixup${ver}.sql
then check into $SRC/deployment/setupdb/db2
The ${var} is the new db schema version incremented. For example, if current largest version is fixup5.sql exists in this folder, then your new one will be fixup6.sql
If you need to change db name, make sure python is installed and accessible from command line. 
And before creating a database, run "python prepare_db_name.py new_db_name" in 
$SRC/deployment/setupdb/db2, and then create a database and so on.