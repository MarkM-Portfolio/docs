:
eval 'exec perl -wS $0 ${1+"$@"}'
    if 0;
 
#*************************************************************************
#IBM Confidential
#collect_gui_pii.pl
#Copyright IBM Corporation 2010. All righs Reserved.
#*************************************************************************

use strict;
use Getopt::Long;
use IO::Handle;
use File::Find;
use File::Copy;
use File::Path;
use Cwd;

#### global variables ##################################

# nlv po root path
my $pii = './';

# pii files root directory
my $srcroot ='';

#files or directories that needs translation
my @msgdnts = qw { com.ibm.docs.im.installer/src/com/ibm/docs/im/installer/internal
		com.ibm.docs.im.installer.common/src/com/ibm/docs/im/installer/common/internal
		com.ibm.docs.im.installer.vfeature/src/com/ibm/docs/im/installer/vfeature/internal
		com.ibm.docs.im.invoke/src/com/ibm/docs/im/invoke/internal
		com.ibm.docs.installer/com.ibm.docs.im.installer/nl
};
my @plugindnts = qw { com.ibm.docs.im.installer.lic
		com.ibm.docs.im.installer
};
#### main ################################################

#parse parameters 
parse_options();

#begin
print "Collecting English PII files for translation......\n";

#copy
copy_pii();

#compress


#quit
exit(0);

#########################################################
#copy pii files to target directory
sub copy_pii {
	#the pii files
	my @piiparticles;

	if( !(-e $srcroot) ) {
		print STDERR "The src path $srcroot is not existed. \n";
		exit(1);
	} 	

	my $working_path = getcwd();

	#traverse src root direccory and get all pathes of pii files
	chdir $srcroot;
	my $srcrootpath = getcwd();
	
	find sub {
		my $file = $File::Find::name;
		#Document
		if( -f && ((($file =~ /messages\.properties$/ )||($file =~ /plugin\.properties$/ )) && ($file !~ /.*\/bin\/.*\/messages\.properties$/ ))) {
			#print "Collected file list".$file."\n";
			push @piiparticles , $file;
		}
	} , getcwd() ;#"."; #$piipath;
		
	chdir $working_path;
	
	#copy each pii file to the target directory in the path of @dnt
	my $num = 0;
	foreach my $piifile (@piiparticles) {
		if($piifile =~ /$srcrootpath(.*)\/.*[\s]*$/) {
			$piifile =~ s/\\/\//g;			
			
			#print "-------------------------------\n";
			#print "Source".$piifile."\n";
			my $collected = "false";
			foreach my $dnt ( @msgdnts ) {
				#templates should be included
				if ( $piifile =~ /.*$dnt.*/ ) {					
					my $path = $pii.'/'.$1.$dnt;
					
					#print "target dir".$path."\n";
					
					if( !(-e $path) ) {eval{mkpath($path,0,0755)} or warn "Cannot make $path directory: $@" }
					
					#print "Type msgdnts:".$dnt."\n";
					$collected = "true";
					copy($piifile, $path) or die "Copy failed: $!";
					print '.'; 
					$num = $num + 1;
					last;
				}					
			}
			if ( $collected eq "false" ){
				foreach my $pdnt ( @plugindnts ) {
					#templates should be included
					if ( $piifile =~ /.*$pdnt.*/ ) {
						my $path = $pii.'/'.$1.$pdnt;
						
						#print "target dir".$path."\n";
						
						if( !(-e $path) ) {eval{mkpath($path,0,0755)} or warn "Cannot make $path directory: $@" }
						
						#print "Type plugindnts:".$pdnt."\n";
											
						copy($piifile, $path) or die "Copy failed: $!";
						print '.'; 
						$num = $num + 1;
						last;
					}					
				}
			}
			STDOUT->autoflush(1);
		}
	}
	
	print "\n";
	print "$num files are collected and copied to $pii\n";
}

#########################################################
sub buginfo {
	my $info = shift;
	print "Bug Information: ".$info."\n";
	STDOUT->autoflush(1);
}

#########################################################

sub parse_options{
 
	my $help;
	my $success = GetOptions('s=s' => \$srcroot , 't=s' => \$pii, 'h' => \$help );

	if( $help || !$success || !$srcroot || $#ARGV > 1 ){
		usage();
		exit(1);
	}
}

#########################################################
#help information
sub usage{
	print STDERR "\nMany thanks for using collect_gui_pii.\n\n";
	print STDERR "Usage: collect and copy pii files to specified directory for translation \n";
	print STDERR "            -s <srcroot> -t <tardir>\n";
	print STDERR "Options:\n";
	print STDERR "    -s <srcroot> \tPath to the root directory of source code\n";
	print STDERR "    -t <tardir> \tPath to the target directory\n";
}