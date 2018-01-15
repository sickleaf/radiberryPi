#!/bin/sh

wkdir=$1
tmpDir=$1/tmp


cat ${wkdir}/aac.list | tail -n +13 | head -n 100 | while read line; do wget --no-verbose -nc -P ${tmpDir} "$line"; done

	fixed_cont_string=""
	ls ${tmpDir}/* | tail -n +13 | head -n 100 > ${wkdir}/contlist.txt
	while read line;
		do 
			fixed_cont_string="${fixed_cont_string}"" -cat ""$line"
	done < ${wkdir}/contlist.txt
	echo $fixed_cont_string
	MP4Box -sbr ${fixed_cont_string} -new ${wkdir}/cont.aac 


cat ${wkdir}/aac.list | tail -n +113 | while read line; do wget --no-verbose -nc -P ${tmpDir} "$line"; done

	fixed_rest_string=""

	ls ${tmpDir}/* | tail -n +113 > ${wkdir}/restlist.txt
	while read line;
		do 
			fixed_rest_string="${fixed_rest_string}"" -cat ""$line"
	done < ${wkdir}/restlist.txt
	echo $fixed_rest_string
	MP4Box -sbr ${fixed_rest_string} -new ${wkdir}/rest.aac 


echo "all_fin"
