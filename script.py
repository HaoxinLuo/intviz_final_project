import csv
import json
from geopy.geocoders import Nominatim


out = open("data/test.json",'w')

csvfile = open('data/small.csv','r')
geolocator = Nominatim()

fieldnames = ("datestop","arstmade","frisked","searched","addrnum","stname","stinter","crossst")
reader = csv.DictReader(csvfile, fieldnames)
i = 0;
out.write('[')
for row in reader:
    i+=1;            
    if(i>10):
        break;
    if(i==0):
        continue
    if(i>1):
        try:
            addrnum = int(row['addrnum']);
        except ValueError:
            addrnum = 0
        print addrnum
        if(addrnum > 0):
            address = str(addrnum)+' '+row['stname']
            location = geolocator.geocode(address)
            print address,location.latitude,location.longitude
        out.write(',')        
    json.dump(row,out)
out.write(']')

