#!/bin/sh

wkdir=$1


cat ${wkdir}/aac.list | tail -n +13 | head -n 100 | while read line; do sudo wget --no-verbose -nc -P ${wkdir}/aac "$line"; done

	fixed_cont_string=""
	ls ${wkdir}/aac/* | tail -n +13 | head -n 100 > ${wkdir}/contlist.txt
	#sudo rm ${wkdir}/contlist.txt
	while read line;
		do 
			fixed_cont_string="${fixed_cont_string}"" -cat ""$line"
	done < ${wkdir}/contlist.txt
	echo $fixed_cont_string
	sudo MP4Box -sbr ${fixed_cont_string} -new ${wkdir}/boxaac/cont.aac 


cat ${wkdir}/aac.list | tail -n +113 | while read line; do sudo wget --no-verbose -nc -P ${wkdir}/aac "$line"; done

	fixed_rest_string=""

	ls ${wkdir}/aac/* | tail -n +113 > ${wkdir}/restlist.txt
	#sudo rm ${wkdir}/restlist.txt
	while read line;
		do 
			fixed_rest_string="${fixed_rest_string}"" -cat ""$line"
	done < ${wkdir}/restlist.txt
	echo $fixed_rest_string
	sudo MP4Box -sbr ${fixed_rest_string} -new ${wkdir}/boxaac/rest.aac 


echo "all_fin"
