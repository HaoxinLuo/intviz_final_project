import csv
import json
import sys
import re

#borough > zip > address1 = {latlng:[lat1,lng1],data:[{rowx},{rowx+1},...}]}
def parseCsv(fin):
    try:
        csvIn = csv.DictReader(fin);
    except:
        print 'Error: could not open csv reader on input file'
        sys.exit(1)
    wantedFields = ["datestop","arstmade","frisked","searched",\
                    "lat2","lng2",'full_addr2','race','age']
    data = {'BROOKLYN':{},'QUEENS':{},'STATEN IS':{},'MANHATTAN':{},'BRONX':{}}
    for unmodRow in csvIn:
        row = {key:v for key,v in unmodRow.items() if key in wantedFields}
        addr = unmodRow['full_addr1']
        lat = unmodRow['lat1']
        lng = unmodRow['lng1']
        borough = unmodRow['city']
        zipcode = extractZip(addr) #00000 if failed to get zip

        if zipcode not in data[borough]:
            data[borough][zipcode] = {}
        if addr not in data[borough][zipcode]:
            data[borough][zipcode][addr] = {'latlng':[lat,lng],'data':[]}
        data[borough][zipcode][addr]['data'].append(row)
    return data

def extractZip(addr):
    try:
        zip = re.search("1[10][0-9]{3},",addr).group()[:-1]
    except AttributeError:
        zip = '00000'
    if len(zip) != 5:
        zip = '00000'
    return zip

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print 'Error: expected two input arguments'
        sys.exit(1);
    try:
        fin = open(sys.argv[1],'r')
        fout = open(sys.argv[2],'w')
    except:
        print 'Error: cannot open given file(s)'
        sys.exit(1);

    data = parseCsv(fin) #read csv
    json.dump(data,fout) #write json
    
