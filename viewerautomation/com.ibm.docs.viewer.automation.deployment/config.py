# was install root
# soap port
class Config:
  def __init__(self):
    # comment
  
  def get_was_install_path(self):
    # nothing
  
  def get_was_command(self):
    was_admin = ""
    if os.name == "nt":
      was_admin = self.was_install_root + "/bin/wsadmin.bat"
    else:
      was_admin = self.was_install_root + "/bin/wsadmin.sh"

    return was_admin
