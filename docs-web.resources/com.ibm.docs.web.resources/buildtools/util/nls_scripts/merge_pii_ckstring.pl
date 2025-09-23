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

#path of merged resources
my $path_cklang = '/com.ibm.docs.web.resources/WebContent/js/ckresource/lang/';

# pii files root directory
my $srcroot ='';

#supported languages
my @nlv_langs = qw / ar bg ca cs da de el es fi fr he hr hu id it ja kk ko no nl pl pt-br pt ro ru sk sl sv th tr uk zh-cn zh-tw /;

#en hash resource
my $en_res;

#### main ################################################

#parse parameters 
parse_options();

#begin
print "Merge PII Strings with English for each native languages ...\n";

#merge
print "merge en...\n";
$en_res = read_res("en");

foreach my $lg ( @nlv_langs ) {
	print "merge $lg...\n";
	my $lg_res = read_res($lg);
	my $lang_res = merge_res($lg_res, $en_res);
	write_res($lg, $lang_res);
	refine_res($lg);
}


#quit
exit(0);

#########################################################
#copy pii files to target directory
sub read_res {
	my $lang = shift;
	my $path = $srcroot.$path_cklang.$lang.'.js';
	my %pii_hash = ();
		
	if( !(-e $srcroot) ) {
		print STDERR "The src path $srcroot is not existed. \n";
		exit(1);
	} 	

	if( !open READFILE , "< $path" ){
		warn "Cann't open destination file $path.\n";
		exit(0);
	}
	
	my $state = "START";
	my $pre_key = "";
	
	while(<READFILE>) {
		my $line = defined $_ ? $_ : '';
		chomp($line);

		if( $line =~ /^\s*([\w]+)\s*\:\s*$/) {
			if($pre_key eq "") {
				$pre_key = $1;
			}
			else {
				$pre_key = $pre_key."|".$1;
			}
		}
		
		elsif($line =~ /^\s*([\'|\"]?[\w]+[\'|\"]?)\s*\:\s*([\'|\"].*[\'|\"])/) {
			my $value = $2;
			my $key = $1; 
			$value =~ s/\/\*.*$//;
			if($pre_key eq "") {
				$pii_hash{$key} = $value;
			}
			else {
				$pii_hash{$pre_key."|".$key} = $value;
			}
		}
		
		elsif($line =~ /^\s*\}[^;]*/)  {
			if($pre_key =~ /\|[\w]+$/) {
				$pre_key =~ s/\|[[\w]+$//;
			}
			else {
				$pre_key = "";
			}
		}
	}
		
	close ( READFILE );
	return \%pii_hash;
}

#########################################################
sub write_res {
	my $lang = shift;
	my $strings = shift;
	my $destination = $srcroot.$path_cklang.$lang.'_tmp.js';
		
	if( !open WRITEFILE , "> $destination" ){
		warn "Cann't open file $destination.\n";
		exit(0);
	}
	
	print WRITEFILE ( "CKEDITOR.lang['$lang'] =" , "\n" );
	print WRITEFILE ( "{" , "\n" );
	
	my %pre_key = ();
	my $num_embed = 0;
	
	foreach my $key (sort keys %{ $strings }) {
		my @items = split(/\|/, $key);
		my $obj_key = "";
		my $leng = @items;
		my $i = 0;
		my $isend = "FALSE";
		my $last_item;
		foreach my $item (@items) {
			$i = $i + 1;
			$obj_key = $obj_key.$item;
			if($pre_key{$obj_key} eq "YES") {
				$num_embed = $num_embed - 1;
				next;
			}
						
			if(($isend eq "FALSE")) {
				$isend = "TRUE";
				for(my $count = 0; $count < $num_embed; $count++) {
					print WRITEFILE ( "}" , "\n" );
				}			
			}
			if( $i < $leng) {
				print WRITEFILE ( $item." :" , "\n" );
				print WRITEFILE ( "{" , "\n" );
				$pre_key{$obj_key} = "YES";
			}
			else {
				$last_item = $item;
			}
		}
		$num_embed = $leng -1;
		print WRITEFILE ( $last_item." : ".$strings->{$key}, "\n" );		
	}
	
	for(my $count = 0; $count < $num_embed; $count++) {
		print WRITEFILE ( "}" , "\n" );
	}
	
	print WRITEFILE ( "};" , "\n" );
	close(WRITEFILE);
}
 
#########################################################

sub merge_res {
	my $to = shift;
	my $from = shift;
	foreach my $key (keys %{ $from }) {
		if (!(exists $to->{$key})) {
			$from->{$key} = $to->{$key};
		}
	}
	return $to;
}

#########################################################

sub refine_res {
	my $lang = shift;
	my $from = $srcroot.$path_cklang.$lang.'_tmp.js';
	my $to = $srcroot.$path_cklang.$lang.'.js';
	 
	if( !open READFILE , "< $from" ){
		warn "Cann't open file $from.\n";
		exit(0);
	}
	
	if( !open WRITEFILE , "> $to" ){
		warn "Cann't open file $to.\n";
		exit(0);
	}
	
	my $preline = "";
	
	while(<READFILE>) {
		my $line = defined $_ ? $_ : '';
		chomp($line);
		if($line =~ /^\s*\}/) {
			print WRITEFILE ( $preline, "\n" );	
		}
		else {	
			if($preline =~ /^\s*([\'|\"]?[\w]+[\'|\"]?)\s*\:\s*([\'|\"].*[\'|\"])/ || $preline =~ /^\s*\}\s*$/) {
				print WRITEFILE ( $preline.',', "\n" );
			}
			else {
				print WRITEFILE ( $preline, "\n" );
			}
		}
		$preline = $line;
	}
	print WRITEFILE ( $preline, "\n" );
	close(WRITEFILE);
	close(READFILE);
	unlink $from; 	
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