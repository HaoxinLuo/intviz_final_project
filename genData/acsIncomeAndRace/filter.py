import json

counties = ["Kings","Queens","Richmond","Bronx","New York"]
countyNum = ['061','005','081','085','047']

with open('data/tractIncRace.json') as jFile:
    data = json.load(jFile)
    print data.keys()
    i = 0
    while(i<len(data["features"])):
        #name = data["features"][i]["properties"]["name"]
        #sName = name[name.find(',')+2:]
        #eName = sName[:sName.find(' ')]
        #print eName
        eName = data["features"][i]["properties"]["COUNTY"]
        if eName not in countyNum:
            del data["features"][i]
            i-=1
        elif data['features'][i]['properties']['population']=='0':
            del data['features'][i]
            i-=1
        i+=1

    json.dump(data,open("data/test.json",'w'))
