import sys
import csv
import requests
import bar

api = "https://maps.googleapis.com/maps/api/geocode/json?"
key = bar.key
#address = "345 chambers st"
bounds = "40.491564,-74.260851|40.916375,-73.677794"
#fields = ["datestop","arstmade","frisked","searched","addrnum","stname","stinter","crossst","city"]

def main(infile,outfile,taskIn,taskOut):
    tasks = []
    curRow = 1
    inLimit = True
    searched = {}
    curTask = int(taskIn.readline())
    justgo = False
    if curTask == 1:
        outfile.writeheader()
    for row in infile:
        #row = {key:value for key,value in row.items() if key in fields}
        results = []
        if justgo or curTask == curRow:
            try:
                if not justgo:
                    curTask = int(taskIn.readline())
            except ValueError:
                justgo = True
            if inLimit:
                for addr in getAddress(row):#tries get latlng for each address
                    print addr
                    if addr in searched:
                        results.append(searched[addr])
                    else:
                        result = getLatLng(addr)
                        if result['status'] == 'OK':
                            results.append(result)
                            searched[addr] = result
                            continue;
                        else:#could be 0 results,bad serach,or over daily limit
                            if result['status'] == 'OVER_QUERY_LIMIT':
                                print 'over limit'
                                inLimit = False
                            results = [] #reset results if poss fails 2nd
                            #tasks.append((curRow,result['status']))
                            break;
            for i in range(len(results)):
                row['lat%d'%(i+1)] = results[i]['lat']
                row['lng%d'%(i+1)] = results[i]['lng']  
                row['full_addr%d'%(i+1)] = results[i]['full_addr']
            if len(results) > 0:
                outfile.writerow(row);
            else:
                tasks.append(curRow);
        curRow+=1
        if not inLimit:
            break;
    taskIn.close()
    tasks.append(curRow)
    exportTasks(tasks,taskOut)

def exportTasks(tasks,taskout):
    taskfile = open(taskout,'w');
    for task in tasks:
        taskfile.write("%d\n"%(task))                

def getAddress(row):
    def addrnumTest(addrnum):
        if len(addrnum)>0:
            try:
                if int(addrnum[0])!=0:
                    return True
            except ValueError:
                return False
        return False
    def stnameTest(stname):
        if not stname.isspace() and stname!='':
            return True
        return False
    def interCrossTest(row):
        return not row['stinter'].isspace() and not row['crossst'].isspace() \
            and row['stinter']!='' and row['crossst']!=''

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
    for i in range(len(addresses)):
        addresses[i] +=' '+row['city']
    return addresses

def getLatLng(address):
    payload = {'address':address,'bounds':bounds,'key':key}
    result = {'status':''}
    for i in range(2):
        try:
            r = requests.get(api,params=payload)
        except:
            result['status'] = 'requests.error'
            print 'request broken on %s'%(address)
            break;
        result['status'] = r.json()['status']
        if result['status'] == 'OK': #take first result's latlng
            #adds lat & lng to result
            #print r.json()['results'][0]['formatted_address']
            result['full_addr']=r.json()['results'][0]['formatted_address']
            result.update(r.json()['results'][0]['geometry']['location'])
            break;
        if result['status'] != 'UNKNOWN_ERROR': #break unless it's unknown err
            try:
                print r.json()['status'],r.json()['error_message']
            except:
                print 'failed'
            break;
    return result

if __name__ == "__main__":
    try:
        csvIn = open(sys.argv[1],"r")
        csvOut = open(sys.argv[2],'a')
        tasksIn = open(sys.argv[3],'r')
    except IOError as e:
        print e
        sys.exit()


    #fields2 = ["datestop","arstmade","frisked","searched","addrnum","stname","stinter","crossst","city","lat1","lng1","lat2","lng2"]
    csvIn = csv.DictReader(csvIn)
    fields2 = csvIn.fieldnames
    fields2.extend(["lat1",'lng1','lat2','lng2','full_addr1','full_addr2'])
    csvOut = csv.DictWriter(csvOut,fields2)
    main(csvIn,csvOut,tasksIn,sys.argv[3]);
