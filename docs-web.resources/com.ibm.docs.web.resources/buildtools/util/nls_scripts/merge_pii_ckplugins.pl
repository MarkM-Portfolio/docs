:
eval 'exec perl -wS $0 ${1+"$@"}'
    if 0;
 
#*************************************************************************
#IBM Confidential
#collect_pii.pl
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

# nlv root path
my $pii = './';

#path of CKPlugins
my $path_ckplugin_en = '/com.ibm.docs.web.resources/WebContent/js/ckplugins/';
my $path_ckplugin_nlv = '/com.ibm.concord.nls/';
my $path_source = '/com.ibm.docs.web.resources/WebContent/js/ckeditor/_source/lang/';
#path of merged resources
my $path_cklang = '/com.ibm.docs.web.resources/WebContent/js/ckresource/lang/';

# pii files root directory
my $srcroot ='';

#supported languages
my @nlv_langs = qw / ar bg ca cs da de el es fi fr he hr hu id it ja kk ko no nl pl pt-br pt ro ru sk sl sv th tr uk zh-cn zh-tw /;

#### main ################################################

#parse parameters 
parse_options();

#begin
print "Merge PIIs in CKPlugins to one file...\n";

#merge
print "merge en...\n";
merge_pii_ckplugin("en", $path_ckplugin_en);

foreach my $lg ( @nlv_langs ) {
	#process one language
	print "merge $lg...\n";
	my $path = $path_ckplugin_nlv.$lg.$path_ckplugin_en;
	merge_pii_ckplugin($lg, $path);
}

#quit
exit(0);

#########################################################
#copy pii files to target directory
sub merge_pii_ckplugin {
	my $lang = shift;
	my $path_ckplugin = shift;
	my $destination = $srcroot.$path_cklang.$lang.'.js';
	#the pii files
	my @piiparticles;
	my $ckpleng = 0;
	

	if( !(-e $srcroot) ) {
		print STDERR "The src path $srcroot is not existed. \n";
		exit(1);
	} 	

	my $working_path = getcwd();

	chdir $srcroot.$path_ckplugin;
	my $srcrootpath = getcwd();
	find sub {
		my $file = $File::Find::name;

		if(-f && $file =~ /.*\/lang\/$lang\.js$/) { 
			push @piiparticles , $file;
			$ckpleng = $ckpleng + 1;
		}
	} , getcwd() ;
	
	chdir $working_path;
	
		
	if( !open DESTFILE , "> $destination" ){
		warn "Cann't open destination file $destination.\n";
		exit(0);
	}
	
	print DESTFILE ( "CKEDITOR.lang['$lang'] =" , "\n" );
	print DESTFILE ( "{" , "\n" );
	print DESTFILE ("\tckpluginpiiloaded: \'1\',", "\n");
	
	foreach my $piifile (@piiparticles) {
		if ( !(open PIIFILE , "< $piifile") ) {
			warn "Can't open '$piifile'\n";
			next;
		}
		
		my $frtline = "FALSE";
		my $leftbracket = 0;
		while(<PIIFILE>) {
			my $line = defined $_ ? $_ : '';
			
			chomp($line);
			
			#sometimes '{' is put below statement 'CKEDITOR.plugins.setLang ...'			
			if(($frtline eq "TRUE") && $line =~ /^\s*\{\s*$/) {
				$frtline = "FALSE";
				next;
			}
			
			if($line =~/^CKEDITOR.plugins.setLang/) {
				$frtline = "TRUE";
				next;
			}
			else {
				$frtline = "FALSE";
			}
			
			#empty line
			next if($line =~ /^\s*$/ ||
				#comments /*...*/
				$line =~ /^\s*\/\*.*?\*\/\s*$/ ||
				#comments //
				$line =~/^\s*\/\// ||
				#end line
				$line =~ /^\s*\}\)\;/ );

			if($line=~/\{\s*$/) {
				$leftbracket = $leftbracket + 1;
			}
			
			elsif($line=~/^\s*\}\s*$/ && $leftbracket == 1) {
				$line =~ s/\s+$//;
				$line = $line.',';
			}
			
			elsif($line=~/^\s*\}/ && $leftbracket > 1) {
				$leftbracket = $leftbracket - 1;
			}
			
								
			print DESTFILE ( $line , "\n" );
		}
		
		close ( PIIFILE );
	}
	
	my $psource;
	if($lang eq "en") {
		$psource = $srcroot.$path_source.$lang;  
	}
	else {
		$psource = $srcroot.$path_ckplugin_nlv.$lang.$path_source.$lang;
	}
	
	foreach my $ln ( get_pii_cksource($psource."\.js") ) {
		print DESTFILE ( $ln , "\n" );
	}
		
	print DESTFILE ( "};" , "\n" );
	close ( DESTFILE );
}

#########################################################

sub get_pii_cksource {
	my $cksource_path = shift;	
	if ( !(open PIIFILE , "< $cksource_path") ) {
			warn "Can't open '$cksource_path'\n";
	}
	my @pii_lines;
	
	my $state = "HEAD";
	
	while(<PIIFILE>) {
		my $line = $_?$_:'';
		chomp($line);
		
		if($state eq "HEAD" ) {
			if($line =~ /^\s*CKEDITOR\.lang/) {
				$state = "FIRSTLINE";
			}
			next;
		}
		elsif($state eq "FIRSTLINE" && $line =~ /^\s*\{\s*$/) {
			$state = "CONTENT";
			next;
		}
		
		elsif($state eq "CONTENT" && $line =~ /^\s*\};\s*$/) {
			$state = "END";
			next;
		}
		#empty line
		next if($line =~ /^\s*$/ ||
			#comments /*...*/
			$line =~ /^\s*\/\*.*?\*\/\s*$/ ||
			#comments //
			$line =~/^\s*\/\//);
		
		push @pii_lines , $line;			
	}
	
	return @pii_lines;
	close (PIIFILE);	
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
	my $success = GetOptions('s=s' => \$srcroot ,  'h' => \$help );

	if( $help || !$srcroot || $#ARGV > 1 ){
		usage();
		exit(1);
	}
}

#########################################################
#help information
sub usage{
	print STDERR "\nMany thanks for using merge_pii_ckplugins.\n\n";
	print STDERR "Usage: merge all the resources in ckplugins into one file \n";
	print STDERR "            -s <srcroot>\n";
	print STDERR "Options:\n";
	print STDERR "    -s <srcroot> \tPath to the root directory of source code\n";
}