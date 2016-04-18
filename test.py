import requests
import bar

api = "https://maps.googleapis.com/maps/api/geocode/json?"
key = bar.key
address = "345 chambers st"
bounds = "40.491564,-74.260851|40.916375,-73.677794"

def main(infile,outfile,taskfile):
    tasks = []
    curRow = 0
    inLimit = True
    for row in infile:
        results = []
        if inLimit:
            for addr in getAddress(row):#tries get latlng for each address
                result = getLatLng(addr)
                if result['status'] == 'OK':
                    results.append(result)
                    continue;
                else:#could be 0 results, bad serach, or over daily limit
                    if result['status'] == 'OVER_QUERY_LIMIT':
                        inLimit = False
                    tasks.append((curRow,result['status']))
                    break;
        for i in range(len(results)):
            row['lat%d'%(i+1)] = results[i]['lat']
            row['lng%d'%(i+1)] = results[i]['lng']        
        outfile.writerow(row);
        curRow+=1 
    exportTasks(tasks,taskfile)

def exportTasks(tasks,taskfile):
    if len(tasks)>2:
        for i in range(1,len(tasks)-1):
            
                

def getAddress(row):
    def addrnumTest(addrnum):
        if len(addrnum)>0:
            try:
                if int(s[0])!=0:
                    return True
            except ValueError:
                return False
        return False
    def stnameTest(stname):
        if len(stname)!=0:
            return True
        return False
    def interCrossTest(row):
        return len(row['stinter'])>0 and len(row['crossst'])>0

    addresses = []
    if addrnumTest(row['addrnum']):
        addresses.append(row['addrnum']+' '+row['stname'])
    elif stnameTest(row['stname']):
        addresses.append(row['stname']+' & '+row['stinter'])
        addresses.append(row['stname']+' & '+row['crossst'])
    elif interCrossTest(row):
        addresses.append(row['stinter']+' & '+row['crossst'])
    else:
        return addresses;
    for address in addresses:
        address +=' '+row['city']
    return addresses

def getLatLng(address):
    payload = {'address':address,'bounds':bounds,'key':key}
    result = {'status':''}
    for i in range(2):
        r = requests.get(api,params=payload)
        result['status'] = r.json()['status']
        if result['status'] == 'OK': #take first result's latlng
            #adds lat & lng to result
            print r.json()['results'][0]['formatted_address']
            result.update(r.json()['results'][0]['geometry']['location'])
        if result['status'] != 'UNKNOWN_ERROR': #break unless it's unknown err
            break;
    return result

print getLatLng("102 street & 101 avenue QUEENS")
