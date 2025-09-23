import com.ibm.concord.viewer.services.fileUtil.WinFileLocker;
import java.net.URL;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.IOException;

public class TestJniLock {
	static {
    InputStream in = null;
    FileOutputStream out = null;
    try
    {
    	URL location = TestJniLock.class.getProtectionDomain().getCodeSource().getLocation();
      String libext = ".so";
      if (System.getProperty("os.name").toUpperCase().indexOf("WIN") == -1)
      {
				//
      } else {  // on Windows, it also needs check 32bit or 64bit
        libext = ".dll";
        boolean isamd64 = false;
        if (System.getProperty("os.arch").indexOf("64") != -1)
          isamd64 = true;
        String arch_str = "32bit";
        if (isamd64) arch_str = "64bit";
        //LOG.info("Detected Windows " + arch_str + ", load Windows native library.");
        
        String fpath = location.toURI().toString();
        String fname = "";
        if (isamd64) {
        	fname = "FileUtil64.dll";
        } else {
        	fname = "FileUtil32.dll";
        }
        System.out.println(fpath + fname);
        File f = new File(location.toURI());
        if (!f.exists())
            System.out.println("error path!!!");
        in = new FileInputStream(new File(f, fname));
      }
      File f = File.createTempFile("libFileUtil", libext);
      //jniLibPath = f.getName();
      System.out.println("Create temp JNI library: " + f.getAbsolutePath());
      out = new FileOutputStream(f);
      byte[] buf = new byte[1024];
      int len;
      while ((len = in.read(buf)) > 0)
        out.write(buf, 0, len);
      in.close();
      out.close();
      System.load(f.getAbsolutePath());
      //LOG.info("Temp JNI library load successfully.");
      if (f.delete())
        System.out.println("Temp JNI library delete successfully.");
    }
    catch (Exception e)
    {
      //LOG.info("Temp JNI library loaded failed.");
      e.printStackTrace();
    }
    finally
    {
      try
      {
        if (in != null)
          in.close();
        if (out != null)
          out.close();
      }
      catch (IOException e)
      {
        //LOG.warning("Close stream error while load temp JNI library.");
        e.printStackTrace();
      }
    }
	}
	
	public static void main(String[] argv) {
    String lockFileName = "c://test.txt";
    
    if (argv.length > 0) {
      lockFileName = argv[0];
    }
    
    System.out.println("To lock file " + lockFileName);
    System.out.println();
    
    boolean rc = testlockfile(lockFileName);
    if (rc == false) { // try again
    	try {
	      System.out.println("lock file failed, type any key to try again.");
	      System.in.read();
	    } catch (Exception e) {}
        testlockfile(lockFileName);
    }
	}
	
	public static boolean testlockfile(String lockFileName) {
		boolean succ = false;
    WinFileLocker locker = null;
    int hd = -1;
    
    try
    {
      boolean locked = false;

      locker = new WinFileLocker();
      int lr = locker.lock(lockFileName);
      locked = (lr != -1 && lr != -2);
      hd = locked ? lr : -1;
      
      if (locked) {
	      System.out.println("Paused, type any key to continue.");
	      System.in.read();

      	locker.unlock(hd);
      	succ = true;
      } else {
      	System.out.println("lock failed!!!");
      }
	  } catch (Exception e) {
	  }
	  
	  return succ;
	}
}